"use client";
import { useHealthStore } from "../store/healthStore";
import { Activity, Apple, FlaskConical, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Dashboard() {
  const { userProfile, foodHistory, labResults, healthAnalysis, setActiveTab } = useHealthStore();

  const today = new Date().toISOString().split("T")[0];
  const todayFoods = foodHistory.filter((f) => f.date === today);
  const todayCalories = todayFoods.reduce((sum, f) => sum + f.totalCalories, 0);
  const todayProtein = todayFoods.reduce((sum, f) => sum + f.totalProtein, 0);
  const todayCarbs = todayFoods.reduce((sum, f) => sum + f.totalCarbs, 0);
  const todayFat = todayFoods.reduce((sum, f) => sum + f.totalFat, 0);

  const targetCalories = Math.round(
    userProfile.gender === "male"
      ? (10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5) * 1.55
      : (10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161) * 1.55
  );

  const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
  const bmiStatus = bmi < 18.5 ? "Thiếu cân" : bmi < 25 ? "Bình thường" : bmi < 30 ? "Thừa cân" : "Béo phì";
  const bmiColor = bmi < 18.5 ? "#3b82f6" : bmi < 25 ? "#22c55e" : bmi < 30 ? "#f59e0b" : "#ef4444";

  const macroData = [
    { name: "Protein", value: todayProtein * 4, fill: "#3b82f6" },
    { name: "Carbs", value: todayCarbs * 4, fill: "#f59e0b" },
    { name: "Fat", value: todayFat * 9, fill: "#ef4444" },
  ];

  const caloriePercent = Math.min(100, Math.round((todayCalories / targetCalories) * 100));

  const scoreData = [{ value: healthAnalysis?.overallScore || 0, fill: "#22c55e" }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Xin chào{userProfile.name ? `, ${userProfile.name}` : ""}! 👋
        </h2>
        <p className="text-green-100">Hôm nay là ngày tốt để chăm sóc sức khỏe</p>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-green-200 text-sm">BMI</p>
            <p className="text-2xl font-bold">{bmi.toFixed(1)}</p>
            <p className="text-green-200 text-xs">{bmiStatus}</p>
          </div>
          <div>
            <p className="text-green-200 text-sm">Mục tiêu calo/ngày</p>
            <p className="text-2xl font-bold">{targetCalories.toLocaleString()}</p>
            <p className="text-green-200 text-xs">kcal</p>
          </div>
          <div>
            <p className="text-green-200 text-sm">Xét nghiệm</p>
            <p className="text-2xl font-bold">{labResults.length}</p>
            <p className="text-green-200 text-xs">chỉ số đã nhập</p>
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Calo hôm nay", value: todayCalories, unit: "kcal", icon: Apple, color: "green", max: targetCalories },
          { label: "Protein", value: Math.round(todayProtein), unit: "g", icon: Activity, color: "blue", max: Math.round(userProfile.weight * 1.6) },
          { label: "Carbs", value: Math.round(todayCarbs), unit: "g", icon: TrendingUp, color: "yellow", max: Math.round(targetCalories * 0.5 / 4) },
          { label: "Chất béo", value: Math.round(todayFat), unit: "g", icon: FlaskConical, color: "red", max: Math.round(targetCalories * 0.3 / 9) },
        ].map(({ label, value, unit, icon: Icon, color, max }) => {
          const pct = Math.min(100, Math.round((value / max) * 100));
          const colors: Record<string, string> = { green: "#22c55e", blue: "#3b82f6", yellow: "#f59e0b", red: "#ef4444" };
          return (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} style={{ color: colors[color] }} />
                <span className="text-sm text-gray-500">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colors[color] }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% mục tiêu</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Score */}
        {healthAnalysis ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Điểm sức khỏe tổng thể
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={scoreData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#f0fdf4" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">{healthAnalysis.overallScore}</span>
                </div>
              </div>
              <div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                  healthAnalysis.riskLevel === "low" ? "bg-green-100 text-green-700" :
                  healthAnalysis.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  <AlertCircle size={14} />
                  {healthAnalysis.riskLevel === "low" ? "Rủi ro thấp" : healthAnalysis.riskLevel === "medium" ? "Rủi ro trung bình" : "Rủi ro cao"}
                </div>
                <p className="text-sm text-gray-600">{healthAnalysis.labAnalysis.summary}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50 flex flex-col items-center justify-center text-center gap-3">
            <FlaskConical size={48} className="text-green-200" />
            <p className="text-gray-500">Chưa có phân tích sức khỏe</p>
            <button onClick={() => setActiveTab("analysis")} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-600 transition">
              Phân tích ngay
            </button>
          </div>
        )}

        {/* Macro Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Apple size={20} className="text-green-500" />
            Dinh dưỡng hôm nay
          </h3>
          {todayCalories > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {macroData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {macroData.map(({ name, value, fill }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fill }} />
                    <span className="text-sm text-gray-600">{name}: <strong>{Math.round(value / 4)}g</strong></span>
                  </div>
                ))}
                <div className="text-sm font-semibold text-green-600 pt-1">
                  {caloriePercent}% mục tiêu calo
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
              <Apple size={36} className="text-green-200" />
              <p className="text-gray-400 text-sm">Chưa ghi nhận bữa ăn hôm nay</p>
              <button onClick={() => setActiveTab("food")} className="text-green-500 text-sm hover:underline">
                Thêm bữa ăn →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Food History */}
      {foodHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-green-500" />
            Bữa ăn gần đây
          </h3>
          <div className="space-y-3">
            {foodHistory.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-700">{entry.foods.map(f => f.name).join(", ")}</p>
                  <p className="text-sm text-gray-400">{entry.date} • {entry.meal === "breakfast" ? "Sáng" : entry.meal === "lunch" ? "Trưa" : entry.meal === "dinner" ? "Tối" : "Ăn vặt"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{entry.totalCalories} kcal</p>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${entry.nutritionScore >= 7 ? "bg-green-100 text-green-600" : entry.nutritionScore >= 5 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}>
                    {entry.nutritionScore}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {healthAnalysis?.recommendations && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Lời khuyên hàng đầu
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[...healthAnalysis.recommendations.diet.slice(0, 2), ...healthAnalysis.recommendations.lifestyle.slice(0, 2)].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
