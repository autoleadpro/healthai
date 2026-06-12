import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/webp";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `Phân tích khẩu phần ăn trong ảnh này và trả về JSON với cấu trúc sau (chỉ trả JSON, không giải thích thêm):
{
  "foods": [{"name": "tên món", "portion": "khẩu phần ước tính", "calories": số, "protein": số_gram, "carbs": số_gram, "fat": số_gram}],
  "totalCalories": tổng_calo,
  "totalProtein": tổng_protein_gram,
  "totalCarbs": tổng_carbs_gram,
  "totalFat": tổng_fat_gram,
  "nutritionScore": điểm_1_10,
  "assessment": "đánh giá ngắn về dinh dưỡng",
  "suggestions": ["gợi ý 1", "gợi ý 2", "gợi ý 3"]
}`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json(
      { error: "Failed to analyze food image" },
      { status: 500 }
    );
  }
}
