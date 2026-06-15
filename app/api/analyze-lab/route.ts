import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Extracts lab markers from a photo/scan of a lab result sheet.
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Đây là ảnh phiếu kết quả xét nghiệm y khoa. Hãy đọc và trích xuất TẤT CẢ các chỉ số xét nghiệm có trong ảnh.
Trả về JSON (chỉ JSON, không markdown) với cấu trúc:
{
  "date": "YYYY-MM-DD nếu thấy ngày xét nghiệm trên phiếu, nếu không thì để rỗng",
  "results": [
    {
      "category": "nhóm xét nghiệm (VD: Sinh hóa máu, Huyết học, Chức năng gan, Tuyến giáp, Vi chất...)",
      "name": "tên chỉ số (VD: Glucose máu, Cholesterol toàn phần, ALT...)",
      "value": "giá trị kết quả (chỉ số, dạng chuỗi)",
      "unit": "đơn vị (VD: mmol/L, g/dL...)",
      "normalMin": số_hoặc_null,
      "normalMax": số_hoặc_null
    }
  ]
}
Lưu ý: chỉ trích các dòng có giá trị kết quả thật. Nếu phiếu ghi khoảng tham chiếu (vd 3.9-6.1) thì điền normalMin/normalMax tương ứng. Nếu không đọc được chỉ số nào, trả về {"date":"","results":[]}.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: image.type || "image/jpeg" } },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Error analyzing lab image:", error);
    return NextResponse.json({ error: "Failed to read lab image" }, { status: 500 });
  }
}
