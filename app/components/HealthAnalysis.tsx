"use client";
import { useState } from "react";
import { useHealthStore, useActiveMemberData } from "../store/healthStore";
import { Brain, Loader2, AlertCircle, CheckCircle, Utensils, Dumbbell, Heart, Stethoscope, Calendar, ChevronDown, ChevronUp, Target, Ban, Flame, TrendingUp } from "lucide-react";

export default function HealthAnalysis() {
  const { userProfile: storeProfile, setHealthAnalysis } = useHealthStore();
  const { member, foodHistory, labResults, analysis: healthAnalysis } = useActiveMemberData();
  const userProfile = member.id === "me"
    ? storeProfile
    : { ...storeProfile, name: member.name, age: member.age, gender: member.gender, height: member.height, weight: member.weight, conditions: member.conditions };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const { consumeCredit } = await import("../lib/credits");
      const credit = await consumeCredit("health_analysis");
      if (!credit.ok) {
        setError("Hết lượt AI. Vui lòng nâng cấp gói tại trang Bảng giá. / Out of AI credits — please upgrade.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/analyze-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          labResults: labResults.slice(0, 30),
          foodHistory: foodHistory.slice(0, 21),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setHealthAnalysis(data);
    } catch {
      setError("Không thể phân tích. Vui lòng kiểm tra API key và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const dayNames: Record<string, string> = {
    monday: "Thứ Hai", tuesday: "Thứ Ba", wednesday: "Thứ Tư",
    thursday: "Thứ Năm", friday: "Thứ Sáu", saturday: "Thứ Bảy", sunday: "Chủ Nhật",
  };

  const scoreColor = !healthAnalysis ? "#22c55e" :
    healthAnalysis.overallScore >= 80 ? "#22c55e" :
    healthAnalysis.overallScore >= 60 ? "#f59e0b" : "#ef4444";

  const circumference = 2 * Math.PI * 54;
  const offset = healthAnalysis ? circumference - (healthAnalysis.overallScore / 100) * circumference : circumference;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain size={24} /> Phân tích & Tư vấn AI
        </h2>
        <p className="text-purple-100 mt-1">AI tổng hợp dữ liệu xét nghiệm và dinh dưỡng để đưa ra tư vấn toàn diện</p>
      </div>

      {/* Analyze Button */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-700">Sẵn sàng phân tích</h3>
            <p className="text-sm text-gray-400 mt-1">
              {labResults.length} chỉ số xét nghiệm • {foodHistory.length} bữa ăn đã ghi nhận
            </p>
          </div>
        </div>

        {(labResults.length === 0 && foodHistory.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700">Hãy thêm kết quả xét nghiệm hoặc ghi nhận bữa ăn trước khi phân tích để có kết quả chính xác hơn.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={20} className="animate-spin" /> Đang phân tích với AI...</> : <><Brain size={20} /> Phân tích sức khỏe toàn diện</>}
        </button>
      </div>

      {healthAnalysis && (
        <>
          {/* Overall Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
            <h3 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <Heart size={20} className="text-purple-500" />
              Điểm sức khỏe tổng thể
            </h3>
            <div className="flex items-center gap-8">
              <div className="relative">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="54" fill="none"
                    stroke={scoreColor} strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    className="score-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold" style={{ color: scoreColor }}>{healthAnalysis.overallScore}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3 ${
                  healthAnalysis.riskLevel === "low" ? "bg-green-100 text-green-700" :
                  healthAnalysis.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  <AlertCircle size={16} />
                  {healthAnalysis.riskLevel === "low" ? "Mức rủi ro thấp" : healthAnalysis.riskLevel === "medium" ? "Mức rủi ro trung bình" : "Mức rủi ro cao"}
                </div>
                <p className="text-sm text-gray-600">{healthAnalysis.labAnalysis.summary}</p>
                <p className="text-xs text-gray-400 mt-2">{healthAnalysis.followUp}</p>
              </div>
            </div>
          </div>

          {/* Lab Analysis */}
          {healthAnalysis.labAnalysis.abnormalValues.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Stethoscope size={20} className="text-purple-500" />
                Chỉ số xét nghiệm cần chú ý
              </h3>
              <div className="space-y-3">
                {healthAnalysis.labAnalysis.abnormalValues.map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${item.status === "high" ? "bg-red-50 border-red-100" : item.status === "low" ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${item.status === "high" ? "text-red-600" : item.status === "low" ? "text-blue-600" : "text-green-600"}`}>{item.value}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "high" ? "bg-red-100 text-red-600" : item.status === "low" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                          {item.status === "high" ? "↑ Cao" : item.status === "low" ? "↓ Thấp" : "Bình thường"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Khoảng bình thường: {item.normalRange}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.concern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-purple-500" />
              Phân tích dinh dưỡng
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Calo TB/ngày</p>
                <p className="text-2xl font-bold text-green-600">{healthAnalysis.nutritionAnalysis.avgDailyCalories}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Cân bằng dinh dưỡng</p>
                <p className="text-sm font-medium text-purple-600 mt-1">{healthAnalysis.nutritionAnalysis.macroBalance}</p>
              </div>
            </div>
            {healthAnalysis.nutritionAnalysis.deficiencies.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600 mb-2">⚠️ Có thể thiếu hụt:</p>
                <div className="flex flex-wrap gap-2">
                  {healthAnalysis.nutritionAnalysis.deficiencies.map((d, i) => (
                    <span key={i} className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
            )}
            {healthAnalysis.nutritionAnalysis.excesses.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">🔴 Có thể dư thừa:</p>
                <div className="flex flex-wrap gap-2">
                  {healthAnalysis.nutritionAnalysis.excesses.map((e, i) => (
                    <span key={i} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-purple-500" />
              Lời khuyên toàn diện
            </h3>
            <div className="space-y-4">
              {[
                { key: "diet", label: "🥗 Chế độ ăn", color: "green", items: healthAnalysis.recommendations.diet },
                { key: "exercise", label: "🏃 Tập luyện", color: "blue", items: healthAnalysis.recommendations.exercise },
                { key: "lifestyle", label: "🌿 Lối sống", color: "purple", items: healthAnalysis.recommendations.lifestyle },
                { key: "medical", label: "🩺 Y tế", color: "red", items: healthAnalysis.recommendations.medical },
              ].map(({ key, label, color, items }) => {
                const colors: Record<string, string> = { green: "bg-green-50 text-green-600", blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600", red: "bg-red-50 text-red-600" };
                const dotColors: Record<string, string> = { green: "bg-green-400", blue: "bg-blue-400", purple: "bg-purple-400", red: "bg-red-400" };
                return (
                  <div key={key}>
                    <h4 className="font-medium text-gray-700 mb-2">{label}</h4>
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className={`${colors[color]} rounded-xl px-4 py-2 flex items-start gap-2`}>
                          <div className={`w-2 h-2 rounded-full ${dotColors[color]} mt-1.5 flex-shrink-0`} />
                          <p className="text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps — forward-looking plan */}
          {healthAnalysis.nextSteps && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Target size={20} />
                Định hướng {healthAnalysis.nextSteps.period}
              </h3>
              <p className="text-indigo-200 text-xs mb-5">{healthAnalysis.nextSteps.expectedOutcome}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-indigo-100">
                    <Utensils size={14} /> Trọng tâm ăn uống
                  </h4>
                  <div className="space-y-2">
                    {healthAnalysis.nextSteps.dietFocus.map((item, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-indigo-200 mt-0.5">{item.reason}</p>
                        <p className="text-xs mt-1 inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
                          <Target size={10} /> {item.target}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-indigo-100">
                    <Dumbbell size={14} /> Trọng tâm vận động
                  </h4>
                  <div className="space-y-2">
                    {healthAnalysis.nextSteps.activityFocus.map((item, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-indigo-200 mt-0.5">{item.reason}</p>
                        <p className="text-xs mt-1 inline-flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
                          <Target size={10} /> {item.target}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1 text-green-200"><Flame size={12} /> Bắt đầu ngay</h4>
                    {healthAnalysis.nextSteps.habits.map((h, i) => (
                      <p key={i} className="text-xs text-indigo-100 py-0.5">• {h}</p>
                    ))}
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <h4 className="text-xs font-semibold mb-2 flex items-center gap-1 text-red-200"><Ban size={12} /> Cần tránh</h4>
                    {healthAnalysis.nextSteps.avoid.map((a, i) => (
                      <p key={i} className="text-xs text-indigo-100 py-0.5">• {a}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {healthAnalysis.weeklyPlan && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-500" />
                Kế hoạch tuần
              </h3>
              <div className="space-y-2">
                {Object.entries(healthAnalysis.weeklyPlan).map(([day, plan]) => (
                  <div key={day} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <span className="font-medium text-gray-700">{dayNames[day] || day}</span>
                      {expandedDay === day ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {expandedDay === day && (
                      <div className="px-4 py-3 space-y-2">
                        {[
                          { label: "🌅 Sáng", value: plan.breakfast },
                          { label: "☀️ Trưa", value: plan.lunch },
                          { label: "🌙 Tối", value: plan.dinner },
                          { label: "🏃 Tập luyện", value: plan.exercise },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex gap-3">
                            <span className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">{label}</span>
                            <span className="text-sm text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
