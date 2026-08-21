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
        // 🔥 关键改动：接收 model 和 context
        const { prompt, context, model } = JSON.parse(event.body);

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

        // 🔥 构建带上下文的提示词
        let fullPrompt = `你是一个旅行助手，叫"小猪旅行助手"。用户正在计划去大连和烟台的旅行。`;

        if (context) {
            fullPrompt += `\n\n以下是你们之前的对话记录（按时间顺序）：\n${context}\n\n`;
        }

        fullPrompt += `请根据上下文回答用户的最新问题。如果你看到之前的对话中有相关内容，请连贯地继续对话。\n\n用户最新的问题是：${prompt}`;

        // 🔥 使用前端传过来的模型，如果没有则用默认
        const modelName = model || 'gemini-3.5-flash';

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [
                {
                    role: 'user',
                    parts: [{ text: fullPrompt }]
                }
            ],
            config: {
                temperature: 0.7,
                maxOutputTokens: 1500,  // 足够长
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
