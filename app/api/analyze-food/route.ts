import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY chưa được cấu hình trong .env.local" }, { status: 503 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Phân tích khẩu phần ăn trong ảnh này và trả về JSON với cấu trúc sau (chỉ trả JSON, không giải thích thêm, không bọc trong markdown):
{
  "foods": [{"name": "tên món", "portion": "khẩu phần ước tính", "calories": số, "protein": số_gram, "carbs": số_gram, "fat": số_gram}],
  "totalCalories": tổng_calo,
  "totalProtein": tổng_protein_gram,
  "totalCarbs": tổng_carbs_gram,
  "totalFat": tổng_fat_gram,
  "nutritionScore": điểm_1_10,
  "assessment": "đánh giá ngắn về dinh dưỡng",
  "suggestions": ["gợi ý 1", "gợi ý 2", "gợi ý 3"]
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: image.type || "image/jpeg" } },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Error analyzing food:", error);
    return NextResponse.json({ error: "Failed to analyze food image" }, { status: 500 });
  }
}
