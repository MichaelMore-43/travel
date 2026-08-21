// netlify/functions/gemini.js
// 注意：这是一个 Netlify Function，运行在 Netlify 的服务端

const { GoogleGenAI } = require('@google/genai');

// 从环境变量读取 API Key（在 Netlify 控制台配置）
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY 环境变量未设置');
}

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

exports.handler = async (event, context) => {
    // 只允许 POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, error: '只支持 POST 请求' })
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: '请提供问题内容' })
            };
        }

        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: '服务器未配置 API Key，请在 Netlify 环境变量中设置 GEMINI_API_KEY' })
            };
        }

        // 调用 Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `你是一个旅行助手，叫"小猪旅行助手"。用户正在计划去大连和烟台的旅行。请用中文回答，语气亲切、简洁、实用。回答控制在200字以内。

用户的问题是：${prompt}`
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
                maxOutputTokens: 500,
            }
        });

        const reply = response.text || '🐷 小猪暂时不知道怎么回答，换个问题试试吧～';

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, reply })
        };

    } catch (error) {
        console.error('Gemini API 错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: '小猪暂时回答不了，请稍后再试 🐷'
            })
        };
    }
};
