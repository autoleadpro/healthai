"use client";
import { useMemo } from "react";
import { useHealthStore } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { AlertTriangle, TrendingUp, TrendingDown, HeartPulse } from "lucide-react";

interface Alert {
  memberName: string;
  avatar: string;
  severity: "warn" | "danger";
  textVi: string;
  textEn: string;
}

// Scans ALL family members for worrying trends — the reason caregivers open the app daily.
export default function FamilyAlerts() {
  const { members, labResults, dailyLogs, setActiveMember, setActiveTab } = useHealthStore();
  const { lang } = useLang();

  const alerts = useMemo(() => {
    const out: Array<Alert & { memberId: string }> = [];

    members.forEach((m) => {
      const memberLabs = labResults.filter((r) => (r.memberId || "me") === m.id);
      const memberLogs = dailyLogs.filter((l) => l.memberId === m.id);

      // 1. Lab marker rising/falling 3+ consecutive times
      const byName: Record<string, Array<{ date: string; value: number; max?: number; min?: number }>> = {};
      memberLabs.forEach((r) => {
        const v = parseFloat(r.value);
        if (isNaN(v)) return;
        (byName[r.name] = byName[r.name] || []).push({ date: r.date, value: v, max: r.normalMax, min: r.normalMin });
      });
      Object.entries(byName).forEach(([name, vals]) => {
        const sorted = vals.sort((a, b) => a.date.localeCompare(b.date));
        const latest = sorted[sorted.length - 1];
        // out of range now
        if (latest.max != null && latest.value > latest.max) {
          out.push({
            memberId: m.id, memberName: m.name, avatar: m.avatar, severity: "danger",
            textVi: `${name} đang cao hơn ngưỡng bình thường (${latest.value})`,
            textEn: `${name} is above the normal range (${latest.value})`,
          });
        } else if (sorted.length >= 3) {
          const lastThree = sorted.slice(-3);
          const rising = lastThree[0].value < lastThree[1].value && lastThree[1].value < lastThree[2].value;
          if (rising && latest.max != null && latest.value > latest.max * 0.85) {
            out.push({
              memberId: m.id, memberName: m.name, avatar: m.avatar, severity: "warn",
              textVi: `${name} tăng 3 lần liên tiếp, đang tiến gần ngưỡng cao`,
              textEn: `${name} has risen 3 times in a row, nearing the upper limit`,
            });
          }
        }
      });

      // 2. Weight trend over recent logs
      const weights = memberLogs.filter((l) => l.weight).sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
      if (weights.length >= 4) {
        const first = weights[0].weight!, last = weights[weights.length - 1].weight!;
        const change = ((last - first) / first) * 100;
        if (Math.abs(change) >= 3) {
          out.push({
            memberId: m.id, memberName: m.name, avatar: m.avatar, severity: "warn",
            textVi: `Cân nặng ${change > 0 ? "tăng" : "giảm"} ${Math.abs(change).toFixed(1)}% gần đây`,
            textEn: `Weight ${change > 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% recently`,
          });
        }
      }

      // 3. Poor sleep streak
      const recentSleep = memberLogs.filter((l) => l.sleep > 0).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
      if (recentSleep.length >= 4 && recentSleep.every((l) => l.sleep <= 2)) {
        out.push({
          memberId: m.id, memberName: m.name, avatar: m.avatar, severity: "warn",
          textVi: "Ngủ kém 4 ngày liên tiếp",
          textEn: "Poor sleep 4 days in a row",
        });
      }
    });

    return out.slice(0, 5);
  }, [members, labResults, dailyLogs]);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mb-5">
      <div className="px-5 py-3 bg-gradient-to-r from-rose-500 to-red-400 flex items-center gap-2 text-white">
        <HeartPulse size={18} />
        <span className="font-bold text-sm">{lang === "vi" ? "Cảnh báo gia đình" : "Family alerts"}</span>
        <span className="ml-auto bg-white/25 text-xs font-medium px-2 py-0.5 rounded-full">{alerts.length}</span>
      </div>
      <div className="divide-y divide-red-50">
        {alerts.map((a, i) => (
          <button
            key={i}
            onClick={() => { setActiveMember(a.memberId); setActiveTab("lab"); }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50/50 transition text-left"
          >
            <span className="text-xl">{a.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700">{a.memberName}</p>
              <p className="text-xs text-gray-500">{lang === "vi" ? a.textVi : a.textEn}</p>
            </div>
            {a.severity === "danger"
              ? <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              : <TrendingUp size={16} className="text-amber-500 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
