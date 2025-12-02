import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 配置 OpenRouter
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1", // <--- 关键：这里指向 OpenRouter
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // 本地开发填这个就行
        "X-Title": "Roast App",
    }
});

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // 调用 OpenRouter 里的 gpt-4o-mini
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini", // <--- 关键：模型名字要加前缀
            messages: [
                {
                    role: "system",
                    content: "你是一个毒舌且幽默的UI设计师。请用简短的中文，毒舌地吐槽用户上传的网页截图，指出1个最大的缺点。不要客气，但要好笑。"
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "吐槽这个网页设计！" },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image,
                            },
                        },
                    ],
                },
            ],
        });

        const roastContent = response.choices[0].message.content;
        return NextResponse.json({ roast: roastContent });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}