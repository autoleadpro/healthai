import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { labResults, foodHistory, userProfile } = body;

    const prompt = `Bạn là bác sĩ tư vấn sức khỏe chuyên nghiệp. Dựa trên dữ liệu sau, hãy đưa ra phân tích và tư vấn toàn diện về sức khỏe.

Thông tin người dùng:
${JSON.stringify(userProfile, null, 2)}

Kết quả xét nghiệm:
${JSON.stringify(labResults, null, 2)}

Lịch sử ăn uống (7 ngày gần nhất):
${JSON.stringify(foodHistory, null, 2)}

Hãy trả về JSON với cấu trúc sau (chỉ trả JSON):
{
  "overallScore": điểm_sức_khỏe_tổng_thể_1_100,
  "riskLevel": "low|medium|high",
  "labAnalysis": {
    "abnormalValues": [{"name": "tên chỉ số", "value": "giá trị", "normalRange": "khoảng bình thường", "status": "high|low|normal", "concern": "mức độ lo ngại"}],
    "summary": "tóm tắt kết quả xét nghiệm"
  },
  "nutritionAnalysis": {
    "avgDailyCalories": số,
    "macroBalance": "đánh giá cân bằng dinh dưỡng",
    "deficiencies": ["thiếu hụt 1", "thiếu hụt 2"],
    "excesses": ["dư thừa 1"]
  },
  "recommendations": {
    "diet": ["lời khuyên chế độ ăn 1", "lời khuyên 2", "lời khuyên 3"],
    "exercise": ["lời khuyên tập luyện 1", "lời khuyên 2"],
    "lifestyle": ["lối sống 1", "lối sống 2"],
    "medical": ["tư vấn y tế 1"]
  },
  "weeklyPlan": {
    "monday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "tuesday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "wednesday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "thursday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "friday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "saturday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."},
    "sunday": {"breakfast": "...", "lunch": "...", "dinner": "...", "exercise": "..."}
  },
  "nextSteps": {
    "period": "2-4 tuần tới",
    "dietFocus": [{"action": "việc cần làm về ăn uống", "reason": "lý do dựa trên dữ liệu", "target": "mục tiêu đo được"}],
    "activityFocus": [{"action": "hoạt động thể chất cụ thể", "reason": "lý do", "target": "mục tiêu đo được"}],
    "habits": ["thói quen nhỏ nên bắt đầu ngay 1", "thói quen 2"],
    "avoid": ["điều cần tránh trong thời gian này 1", "điều 2"],
    "expectedOutcome": "kết quả kỳ vọng nếu tuân thủ sau 2-4 tuần"
  },
  "followUp": "thời gian tái khám và xét nghiệm tiếp theo"
}

Lưu ý: dietFocus và activityFocus mỗi loại 2-3 mục, phải cụ thể và đo được (VD: "đi bộ nhanh 30 phút, 5 ngày/tuần" chứ không phải "tập thể dục nhiều hơn").`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Error analyzing health:", error);
    return NextResponse.json({ error: "Failed to analyze health data" }, { status: 500 });
  }
}
