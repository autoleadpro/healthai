"use client";
import { useMemo } from "react";
import { useHealthStore, useActiveMemberData } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { Pill, Check, Clock } from "lucide-react";

// Compact "next doses today" reminder for the dashboard — taps through to the Meds tab.
export default function MedReminder() {
  const { logDose, activeMemberId, setActiveTab } = useHealthStore();
  const { medications, doseLogs } = useActiveMemberData();
  const { lang } = useLang();
  const vi = lang === "vi";
  const today = new Date().toISOString().split("T")[0];

  const schedule = useMemo(() => {
    const items: Array<{ medId: string; name: string; dosage: string; time: string; color: string }> = [];
    medications
      .filter((m) => (!m.endDate || m.endDate >= today) && m.startDate <= today)
      .forEach((m) => m.times.forEach((time) => items.push({ medId: m.id, name: m.name, dosage: m.dosage, time, color: m.color })));
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, today]);

  if (schedule.length === 0) return null;

  const status = (medId: string, time: string) =>
    doseLogs.find((d) => d.medId === medId && d.date === today && d.time === time)?.status;
  const pending = schedule.filter((s) => !status(s.medId, s.time));
  const taken = schedule.length - pending.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden mb-5">
      <button onClick={() => setActiveTab("meds")} className="w-full px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 flex items-center gap-2 text-white">
        <Pill size={18} />
        <span className="font-bold text-sm">{vi ? "Thuốc hôm nay" : "Today's meds"}</span>
        <span className="ml-auto bg-white/25 text-xs font-medium px-2 py-0.5 rounded-full">{taken}/{schedule.length}</span>
      </button>
      <div className="divide-y divide-rose-50">
        {(pending.length > 0 ? pending : schedule).slice(0, 3).map((s, i) => {
          const st = status(s.medId, s.time);
          return (
            <div key={`${s.medId}-${s.time}-${i}`} className="px-4 py-2.5 flex items-center gap-3">
              <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${st === "taken" ? "text-green-600 line-through" : "text-gray-800"}`}>{s.name} <span className="text-gray-400 font-normal text-xs">{s.dosage}</span></p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {s.time}</p>
              </div>
              {st === "taken" ? (
                <span className="text-green-500"><Check size={16} /></span>
              ) : (
                <button onClick={() => logDose({ memberId: activeMemberId, medId: s.medId, date: today, time: s.time, status: "taken" })} className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
                  <Check size={12} /> {vi ? "Uống" : "Take"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
