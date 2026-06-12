"use client";
import { useState, useMemo } from "react";
import { useActiveMemberData } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { TrendingUp, Scale, Apple, FlaskConical, Award, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, CartesianGrid } from "recharts";

export default function Trends() {
  const { member, foodHistory, labResults, dailyLogs, streak } = useActiveMemberData();
  const { lang } = useLang();
  const vi = lang === "vi";

  // ----- Weight over time (from daily logs) -----
  const weightData = useMemo(
    () =>
      [...dailyLogs]
        .filter((l) => l.weight)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((l) => ({ date: l.date.slice(5), weight: l.weight })),
    [dailyLogs]
  );

  // ----- Daily calories last 14 days -----
  const calorieData = useMemo(() => {
    const byDate: Record<string, number> = {};
    foodHistory.forEach((f) => { byDate[f.date] = (byDate[f.date] || 0) + f.totalCalories; });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, kcal]) => ({ date: date.slice(5), kcal }));
  }, [foodHistory]);

  // ----- Lab marker trend -----
  const markerNames = useMemo(() => [...new Set(labResults.map((r) => r.name))], [labResults]);
  const [selectedMarker, setSelectedMarker] = useState<string>("");
  const marker = selectedMarker || markerNames[0] || "";
  const markerData = useMemo(
    () =>
      labResults
        .filter((r) => r.name === marker && !isNaN(parseFloat(r.value)))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: r.date.slice(5), value: parseFloat(r.value), min: r.normalMin, max: r.normalMax })),
    [labResults, marker]
  );

  // ----- Weekly report -----
  const weekly = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const prevWeek = new Date(now); prevWeek.setDate(now.getDate() - 14);
    const inRange = (d: string, from: Date, to: Date) => { const x = new Date(d); return x >= from && x < to; };

    const thisWeekFood = foodHistory.filter((f) => inRange(f.date, weekAgo, now));
    const lastWeekFood = foodHistory.filter((f) => inRange(f.date, prevWeek, weekAgo));
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    const thisAvgKcal = avg(thisWeekFood.map((f) => f.totalCalories));
    const lastAvgKcal = avg(lastWeekFood.map((f) => f.totalCalories));
    const thisLogs = dailyLogs.filter((l) => inRange(l.date, weekAgo, now));
    const avgSleep = avg(thisLogs.map((l) => l.sleep).filter(Boolean));
    const avgWater = avg(thisLogs.map((l) => l.waterCups).filter(Boolean));
    const checkinDays = new Set(thisLogs.map((l) => l.date)).size;

    return { thisAvgKcal, lastAvgKcal, avgSleep, avgWater, checkinDays, mealsLogged: thisWeekFood.length };
  }, [foodHistory, dailyLogs]);

  // ----- Badges -----
  const badges = useMemo(() => {
    const list: Array<{ emoji: string; vi: string; en: string; earned: boolean }> = [
      { emoji: "🔥", vi: "Chuỗi 7 ngày", en: "7-day streak", earned: streak >= 7 },
      { emoji: "💪", vi: "Chuỗi 30 ngày", en: "30-day streak", earned: streak >= 30 },
      { emoji: "📸", vi: "10 bữa ăn đã ghi", en: "10 meals logged", earned: foodHistory.length >= 10 },
      { emoji: "🥗", vi: "5 bữa điểm 8+", en: "5 meals scored 8+", earned: foodHistory.filter((f) => f.nutritionScore >= 8).length >= 5 },
      { emoji: "🔬", vi: "Xét nghiệm đầu tiên", en: "First lab result", earned: labResults.length > 0 },
      { emoji: "💧", vi: "Đủ 8 cốc nước/ngày", en: "8 cups in a day", earned: dailyLogs.some((l) => l.waterCups >= 8) },
      { emoji: "⚖️", vi: "Theo dõi cân 7 lần", en: "7 weigh-ins", earned: dailyLogs.filter((l) => l.weight).length >= 7 },
      { emoji: "🌙", vi: "Tuần ngủ ngon", en: "Good sleep week", earned: dailyLogs.filter((l) => l.sleep >= 4).length >= 7 },
    ];
    return list;
  }, [streak, foodHistory, labResults, dailyLogs]);

  const earnedCount = badges.filter((b) => b.earned).length;
  const kcalDelta = weekly.lastAvgKcal ? Math.round(((weekly.thisAvgKcal - weekly.lastAvgKcal) / weekly.lastAvgKcal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp size={24} /> {vi ? "Xu hướng & Tiến bộ" : "Trends & Progress"}
        </h2>
        <p className="text-sky-100 mt-1">{vi ? `Theo dõi sự thay đổi của ${member.name} theo thời gian` : `Track how ${member.name} changes over time`}</p>
      </div>

      {/* Weekly report */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-50">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <CalendarCheck size={18} className="text-sky-500" /> {vi ? "Báo cáo 7 ngày qua" : "Last 7 days"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-sky-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-sky-600">{weekly.checkinDays}/7</p>
            <p className="text-xs text-gray-500">{vi ? "ngày check-in" : "days checked in"}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{weekly.thisAvgKcal || "—"}</p>
            <p className="text-xs text-gray-500">
              {vi ? "kcal TB/ngày" : "avg kcal/day"}
              {kcalDelta !== 0 && <span className={kcalDelta > 0 ? "text-red-400" : "text-green-500"}> ({kcalDelta > 0 ? "+" : ""}{kcalDelta}%)</span>}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{weekly.avgSleep ? `${weekly.avgSleep}/5` : "—"}</p>
            <p className="text-xs text-gray-500">{vi ? "giấc ngủ TB" : "avg sleep"}</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-cyan-600">{weekly.avgWater || "—"}</p>
            <p className="text-xs text-gray-500">{vi ? "cốc nước TB" : "avg water cups"}</p>
          </div>
        </div>
      </div>

      {/* Weight chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-50">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Scale size={18} className="text-sky-500" /> {vi ? "Cân nặng" : "Weight"}
        </h3>
        {weightData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
              <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} fontSize={11} stroke="#94a3b8" width={35} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">{vi ? "Ghi cân nặng ở mục Check-in mỗi ngày để thấy biểu đồ (cần ≥2 lần)" : "Log weight in daily check-in to see the chart (needs ≥2 entries)"}</p>
        )}
      </div>

      {/* Calories chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-50">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Apple size={18} className="text-green-500" /> {vi ? "Calo theo ngày (14 ngày)" : "Daily calories (14 days)"}
        </h3>
        {calorieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" width={40} />
              <Tooltip />
              <Bar dataKey="kcal" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">{vi ? "Chưa có dữ liệu bữa ăn" : "No meal data yet"}</p>
        )}
      </div>

      {/* Lab marker trend */}
      {markerNames.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-50">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FlaskConical size={18} className="text-blue-500" /> {vi ? "Chỉ số xét nghiệm theo thời gian" : "Lab marker over time"}
          </h3>
          <select value={marker} onChange={(e) => setSelectedMarker(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:border-blue-300">
            {markerNames.map((n) => <option key={n}>{n}</option>)}
          </select>
          {markerData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={markerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eff6ff" />
                <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" width={40} domain={["auto", "auto"]} />
                <Tooltip />
                {markerData[0]?.max != null && <ReferenceLine y={Number(markerData[0].max)} stroke="#f87171" strokeDasharray="4 4" label={{ value: "max", fontSize: 10, fill: "#f87171" }} />}
                {markerData[0]?.min != null && Number(markerData[0].min) > 0 && <ReferenceLine y={Number(markerData[0].min)} stroke="#60a5fa" strokeDasharray="4 4" label={{ value: "min", fontSize: 10, fill: "#60a5fa" }} />}
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">{vi ? "Cần ≥2 lần xét nghiệm cùng chỉ số để vẽ xu hướng" : "Needs ≥2 results of the same marker"}</p>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-50">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-500" /> {vi ? "Huy hiệu" : "Badges"} ({earnedCount}/{badges.length})
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map((b, i) => (
            <div key={i} className={`text-center p-3 rounded-xl border transition ${b.earned ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100 opacity-40 grayscale"}`}>
              <div className="text-2xl mb-1">{b.emoji}</div>
              <p className="text-[10px] text-gray-600 leading-tight">{vi ? b.vi : b.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
