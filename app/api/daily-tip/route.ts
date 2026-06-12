import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

// One short personalized health tip per day, based on the member's recent data.
export async function POST(request: NextRequest) {
  try {
    const { profile, recentFood, recentLogs, abnormalLabs, lang } = await request.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Bạn là huấn luyện viên sức khỏe. Dựa trên dữ liệu dưới đây, viết MỘT lời khuyên ngắn (tối đa 2 câu, ${lang === "en" ? "in English" : "bằng tiếng Việt"}) cho hôm nay. Phải cụ thể, dựa trên dữ liệu thật của họ, giọng thân thiện có 1 emoji phù hợp. Không chào hỏi, vào thẳng lời khuyên.

Hồ sơ: ${JSON.stringify(profile)}
Bữa ăn 3 ngày gần nhất: ${JSON.stringify(recentFood)}
Check-in gần đây (giấc ngủ 1-5, tâm trạng 1-5, nước, cân nặng): ${JSON.stringify(recentLogs)}
Chỉ số xét nghiệm bất thường: ${JSON.stringify(abnormalLabs)}`,
        },
      ],
    });

    const content = response.content[0];
    const tip = content.type === "text" ? content.text.trim() : "";
    return NextResponse.json({ tip });
  } catch (error) {
    console.error("daily-tip error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
