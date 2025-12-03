import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 配置 OpenRouter
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Roast App",
    }
});

export async function POST(req: Request) {
    try {
        const { image, mode = 'roast', image2 } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        let systemPrompt = "";
        type UserContentPart =
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string } };
        let userContent: UserContentPart[] = [];

        if (mode === 'compare' && image2) {
            systemPrompt = `你是一个专业的UI/UX设计专家。请对比两张网页设计图，从配色、排版、布局、用户体验等方面进行详细对比分析。
            请返回Markdown格式的报告，包含以下部分：
            1. **总体对比**：一句话总结两者的差异。
            2. **设计风格**：对比两者的风格特点。
            3. **优缺点分析**：分别列出两者的优缺点。
            4. **改进建议**：给出改进建议。
            保持专业但易懂的语气。`;

            userContent = [
                { type: "text", text: "对比这两个网页设计！" },
                { type: "image_url", image_url: { "url": image } },
                { type: "image_url", image_url: { "url": image2 } },
            ];
        } else if (mode === 'analyze') {
            systemPrompt = `你是一个专业的UI/UX设计专家。请对这张网页设计图进行深度风格分析。
            请返回Markdown格式的报告，包含以下部分：
            1. **视觉风格**：分析配色、字体、图标等视觉元素。
            2. **布局结构**：分析页面的布局逻辑和层次。
            3. **用户体验**：分析交互设计和易用性。
            4. **改进建议**：给出具体的优化建议。
            保持专业、客观的语气。`;

            userContent = [
                { type: "text", text: "分析这个网页设计！" },
                { type: "image_url", image_url: { "url": image } },
            ];
        } else {
            // Default Roast Mode
            systemPrompt = "你是一个毒舌且幽默的UI设计师。请用简短的中文，毒舌地吐槽用户上传的网页截图，指出1个最大的缺点。不要客气，但要好笑。";
            userContent = [
                { type: "text", text: "吐槽这个网页设计！" },
                { type: "image_url", image_url: { "url": image } },
            ];
        }

        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
            ],
        });

        const content = response.choices[0].message.content;
        return NextResponse.json({ result: content });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}