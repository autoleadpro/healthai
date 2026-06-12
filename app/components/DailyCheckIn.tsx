"use client";
import { useState, useEffect, useCallback } from "react";
import { useHealthStore, useActiveMemberData } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { Flame, Droplets, Scale, Moon, Smile, Sparkles, Loader2, Check } from "lucide-react";

const SLEEP_EMOJI = ["😫", "😴", "😐", "🙂", "😌"];
const MOOD_EMOJI = ["😞", "🙁", "😐", "🙂", "😄"];

export default function DailyCheckIn() {
  const { upsertDailyLog, activeMemberId, userProfile, dailyTips, setDailyTip } = useHealthStore();
  const { member, dailyLogs, foodHistory, labResults, streak } = useActiveMemberData();
  const { lang } = useLang();
  const today = new Date().toISOString().split("T")[0];
  const todayLog = dailyLogs.find((l) => l.date === today);
  const [weightInput, setWeightInput] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  const tipKey = `${today}:${activeMemberId}`;
  const tip = dailyTips[tipKey];
  const done = !!todayLog && todayLog.sleep > 0 && todayLog.mood > 0;

  const setField = (field: "sleep" | "mood" | "waterCups" | "weight", value: number) => {
    upsertDailyLog({ memberId: activeMemberId, date: today, [field]: value });
  };

  const fetchTip = useCallback(async () => {
    if (tip || tipLoading) return;
    setTipLoading(true);
    try {
      const abnormal = labResults.filter((r) => {
        const v = parseFloat(r.value);
        return !isNaN(v) && ((r.normalMax != null && v > r.normalMax) || (r.normalMin != null && v < r.normalMin));
      }).slice(0, 5).map((r) => `${r.name}: ${r.value} ${r.unit}`);
      const res = await fetch("/api/daily-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: member.id === "me" ? userProfile : member,
          recentFood: foodHistory.slice(0, 6).map((f) => ({ date: f.date, foods: f.foods.map((x) => x.name).join(", "), kcal: f.totalCalories, score: f.nutritionScore })),
          recentLogs: dailyLogs.slice(0, 5),
          abnormalLabs: abnormal,
          lang,
        }),
      });
      const data = await res.json();
      if (data.tip) setDailyTip(tipKey, data.tip);
    } catch {
      // silent — tip is a nice-to-have
    } finally {
      setTipLoading(false);
    }
  }, [tip, tipLoading, labResults, member, userProfile, foodHistory, dailyLogs, lang, tipKey, setDailyTip]);

  useEffect(() => {
    if (done && !tip) fetchTip();
  }, [done, tip, fetchTip]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden mb-5">
      {/* Streak header */}
      <div className="px-5 py-3 bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Flame size={20} className={streak > 0 ? "animate-pulse" : "opacity-50"} />
          <span className="font-bold">
            {streak > 0
              ? (lang === "vi" ? `Chuỗi ${streak} ngày!` : `${streak}-day streak!`)
              : (lang === "vi" ? "Bắt đầu chuỗi hôm nay" : "Start your streak today")}
          </span>
        </div>
        {done && (
          <span className="flex items-center gap-1 bg-white/25 text-white text-xs font-medium px-3 py-1 rounded-full">
            <Check size={12} /> {lang === "vi" ? "Đã check-in" : "Checked in"}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Sleep & Mood */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Moon size={12} /> {lang === "vi" ? "Ngủ đêm qua?" : "Last night's sleep?"}</p>
            <div className="flex gap-1">
              {SLEEP_EMOJI.map((e, i) => (
                <button key={i} onClick={() => setField("sleep", i + 1)} className={`text-xl p-1 rounded-lg transition ${todayLog?.sleep === i + 1 ? "bg-orange-100 ring-2 ring-orange-300 scale-110" : "hover:bg-gray-50 opacity-60"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Smile size={12} /> {lang === "vi" ? "Tâm trạng?" : "Mood?"}</p>
            <div className="flex gap-1">
              {MOOD_EMOJI.map((e, i) => (
                <button key={i} onClick={() => setField("mood", i + 1)} className={`text-xl p-1 rounded-lg transition ${todayLog?.mood === i + 1 ? "bg-orange-100 ring-2 ring-orange-300 scale-110" : "hover:bg-gray-50 opacity-60"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Water & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Droplets size={12} /> {lang === "vi" ? "Nước hôm nay" : "Water today"} ({todayLog?.waterCups || 0}/8)</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setField("waterCups", (todayLog?.waterCups || 0) === i + 1 ? i : i + 1)}
                  className={`text-lg transition ${i < (todayLog?.waterCups || 0) ? "" : "opacity-25 grayscale"}`}
                >
                  💧
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Scale size={12} /> {lang === "vi" ? "Cân nặng (kg)" : "Weight (kg)"}</p>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={weightInput || todayLog?.weight || ""}
                onChange={(e) => setWeightInput(e.target.value)}
                onBlur={() => { const w = parseFloat(weightInput); if (!isNaN(w) && w > 0) setField("weight", w); }}
                placeholder={String(member.weight || "")}
                className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-orange-300"
              />
            </div>
          </div>
        </div>

        {/* AI tip of the day */}
        {(tip || tipLoading) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            {tipLoading ? (
              <span className="flex items-center gap-2 text-sm text-amber-600"><Loader2 size={14} className="animate-spin" /> {lang === "vi" ? "AI đang viết lời khuyên cho bạn..." : "AI is writing your tip..."}</span>
            ) : (
              <p className="text-sm text-amber-800">{tip}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
