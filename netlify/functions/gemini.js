// netlify/functions/gemini.js
const { GoogleGenAI } = require('@google/genai');

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

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: '未配置 GEMINI_API_KEY 环境变量' })
            };
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            // ⭐ 关键修复：改用 gemini-3.6-flash
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `你是一个旅行助手，叫"小猪旅行助手"。用户正在计划去大连和烟台的旅行。

要求：
1. 用中文回答
2. 语气亲切、简洁、实用
3. 回答控制在150-200字之间
4. 必须把话说完，不要中途截断
5. 如果问题很简短，回答也简短；如果问题需要展开，回答最多200字

用户的问题是：${prompt}`
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
                maxOutputTokens: 1500,
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
