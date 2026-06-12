"use client";
import { useState, useMemo } from "react";
import { useHealthStore, useActiveMemberData, Medication } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { Pill, Plus, Trash2, X, Check, Clock, Coffee, CircleSlash, Calendar } from "lucide-react";

const MED_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function Medications() {
  const { addMedication, updateMedication, removeMedication, logDose, activeMemberId } = useHealthStore();
  const { member, medications, doseLogs } = useActiveMemberData();
  const { lang } = useLang();
  const vi = lang === "vi";
  const today = new Date().toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const blank = { name: "", dosage: "", times: ["08:00"], withFood: "any" as const, startDate: today, endDate: "", notes: "", color: MED_COLORS[0] };
  const [form, setForm] = useState<Omit<Medication, "id" | "memberId">>(blank);

  const isActive = (m: Medication) => (!m.endDate || m.endDate >= today) && m.startDate <= today;

  // Today's dose schedule across all active meds, sorted by time
  const todaySchedule = useMemo(() => {
    const items: Array<{ med: Medication; time: string }> = [];
    medications.filter(isActive).forEach((m) => m.times.forEach((time) => items.push({ med: m, time })));
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [medications, today]);

  const doseStatus = (medId: string, time: string) =>
    doseLogs.find((d) => d.medId === medId && d.date === today && d.time === time)?.status;

  const handleSave = () => {
    if (!form.name.trim() || form.times.length === 0) return;
    if (editingId) {
      updateMedication(editingId, form);
    } else {
      addMedication({ ...form, id: Date.now().toString(36), memberId: activeMemberId });
    }
    setForm(blank);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (m: Medication) => {
    setEditingId(m.id);
    setForm({ name: m.name, dosage: m.dosage, times: m.times, withFood: m.withFood, startDate: m.startDate, endDate: m.endDate, notes: m.notes, color: m.color });
    setShowForm(true);
  };

  const addTime = () => setForm((f) => ({ ...f, times: [...f.times, "12:00"] }));
  const setTime = (i: number, v: string) => setForm((f) => ({ ...f, times: f.times.map((t, idx) => (idx === i ? v : t)) }));
  const removeTime = (i: number) => setForm((f) => ({ ...f, times: f.times.filter((_, idx) => idx !== i) }));

  const foodLabel = (w: Medication["withFood"]) =>
    w === "before" ? (vi ? "Trước ăn" : "Before food") : w === "after" ? (vi ? "Sau ăn" : "After food") : (vi ? "Bất kỳ" : "Anytime");

  const takenCount = todaySchedule.filter((s) => doseStatus(s.med.id, s.time) === "taken").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Pill size={24} /> {vi ? "Lịch uống thuốc" : "Medication schedule"}
        </h2>
        <p className="text-rose-100 mt-1">{vi ? `Quản lý thuốc của ${member.name}` : `Manage ${member.name}'s medications`}</p>
        {todaySchedule.length > 0 && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 inline-flex items-center gap-2 text-sm">
            <Check size={14} /> {vi ? `Hôm nay: ${takenCount}/${todaySchedule.length} liều đã uống` : `Today: ${takenCount}/${todaySchedule.length} doses taken`}
          </div>
        )}
      </div>

      {/* Today's doses */}
      {todaySchedule.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-rose-500" /> {vi ? "Liều hôm nay" : "Today's doses"}
          </h3>
          <div className="space-y-2">
            {todaySchedule.map(({ med, time }, i) => {
              const status = doseStatus(med.id, time);
              return (
                <div key={`${med.id}-${time}-${i}`} className={`flex items-center gap-3 p-3 rounded-xl border transition ${status === "taken" ? "bg-green-50 border-green-100" : status === "skipped" ? "bg-gray-50 border-gray-100 opacity-60" : "border-gray-100"}`}>
                  <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: med.color }} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${status === "taken" ? "text-green-700 line-through" : "text-gray-800"}`}>{med.name} <span className="text-gray-400 font-normal">{med.dosage}</span></p>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <Clock size={10} /> {time}
                      <span className="flex items-center gap-0.5"><Coffee size={10} /> {foodLabel(med.withFood)}</span>
                    </p>
                  </div>
                  {status === "taken" ? (
                    <button onClick={() => logDose({ memberId: activeMemberId, medId: med.id, date: today, time, status: "skipped" })} className="text-xs text-green-600 font-medium px-2 py-1">✓ {vi ? "Đã uống" : "Taken"}</button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button onClick={() => logDose({ memberId: activeMemberId, medId: med.id, date: today, time, status: "taken" })} className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center gap-1">
                        <Check size={12} /> {vi ? "Uống" : "Take"}
                      </button>
                      <button onClick={() => logDose({ memberId: activeMemberId, medId: med.id, date: today, time, status: "skipped" })} className="bg-gray-100 text-gray-500 text-xs px-2 py-1.5 rounded-lg hover:bg-gray-200" title={vi ? "Bỏ qua" : "Skip"}>
                        <CircleSlash size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(blank); }} className="w-full bg-rose-500 text-white py-3 rounded-2xl font-medium hover:bg-rose-600 transition flex items-center justify-center gap-2">
        <Plus size={18} /> {vi ? "Thêm thuốc" : "Add medication"}
      </button>

      {/* Add/edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">{editingId ? (vi ? "Sửa thuốc" : "Edit medication") : (vi ? "Thuốc mới" : "New medication")}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={vi ? "Tên thuốc *" : "Name *"} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" />
            <input value={form.dosage} onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))} placeholder={vi ? "Liều (VD: 500mg, 1 viên)" : "Dosage (e.g. 500mg)"} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" />
          </div>

          {/* Times */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">{vi ? "Giờ uống" : "Dose times"}</p>
            <div className="flex flex-wrap gap-2">
              {form.times.map((t, i) => (
                <div key={i} className="flex items-center gap-1 bg-rose-50 rounded-xl px-2 py-1">
                  <input type="time" value={t} onChange={(e) => setTime(i, e.target.value)} className="bg-transparent text-sm focus:outline-none" />
                  {form.times.length > 1 && <button onClick={() => removeTime(i)} className="text-rose-300 hover:text-rose-500"><X size={12} /></button>}
                </div>
              ))}
              <button onClick={addTime} className="text-rose-500 border border-dashed border-rose-200 rounded-xl px-3 py-1 text-xs hover:bg-rose-50">+ {vi ? "giờ" : "time"}</button>
            </div>
          </div>

          {/* With food + color */}
          <div className="grid grid-cols-2 gap-3">
            <select value={form.withFood} onChange={(e) => setForm((f) => ({ ...f, withFood: e.target.value as Medication["withFood"] }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300">
              <option value="any">{vi ? "Uống bất kỳ" : "Anytime"}</option>
              <option value="before">{vi ? "Trước ăn" : "Before food"}</option>
              <option value="after">{vi ? "Sau ăn" : "After food"}</option>
            </select>
            <div className="flex items-center gap-1.5">
              {MED_COLORS.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} className={`w-6 h-6 rounded-full transition ${form.color === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-0.5">{vi ? "Bắt đầu" : "Start date"}</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-0.5">{vi ? "Kết thúc (trống = lâu dài)" : "End (blank = ongoing)"}</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300" />
            </div>
          </div>

          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder={vi ? "Ghi chú (VD: uống nhiều nước)" : "Notes"} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" />

          <button onClick={handleSave} className="w-full bg-rose-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-600">{vi ? "Lưu" : "Save"}</button>
        </div>
      )}

      {/* Medication list */}
      <div className="space-y-2">
        {medications.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-rose-50">
            <Pill size={40} className="text-rose-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">{vi ? "Chưa có thuốc nào. Thêm thuốc để nhận lịch nhắc hàng ngày." : "No medications yet. Add one to get daily reminders."}</p>
          </div>
        )}
        {medications.map((m) => (
          <div key={m.id} className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 ${isActive(m) ? "border-rose-50" : "border-gray-100 opacity-50"}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color + "1a" }}>
              <Pill size={18} style={{ color: m.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 text-sm">{m.name} <span className="text-gray-400 font-normal">{m.dosage}</span></p>
              <p className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-0.5"><Clock size={10} /> {m.times.join(", ")}</span>
                <span className="flex items-center gap-0.5"><Coffee size={10} /> {foodLabel(m.withFood)}</span>
                {m.endDate && <span className="flex items-center gap-0.5"><Calendar size={10} /> {vi ? "đến" : "until"} {m.endDate}</span>}
              </p>
              {m.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{m.notes}</p>}
            </div>
            <button onClick={() => openEdit(m)} className="text-xs text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-lg">{vi ? "Sửa" : "Edit"}</button>
            <button onClick={() => { if (confirm(vi ? "Xóa thuốc này?" : "Delete?")) removeMedication(m.id); }} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
