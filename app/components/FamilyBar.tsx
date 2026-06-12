"use client";
import { useState } from "react";
import { useHealthStore, FamilyMember, RELATION_LABELS } from "../store/healthStore";
import { useLang } from "../lib/i18n";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

const AVATARS = ["😊", "👩", "👨", "👵", "👴", "👧", "👦", "👶", "🧑", "👱‍♀️"];

export default function FamilyBar() {
  const { members, activeMemberId, setActiveMember, addMember, updateMember, removeMember } = useHealthStore();
  const { lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<FamilyMember, "id" | "conditions">>({
    name: "", relation: "child", age: 10, gender: "male", height: 140, weight: 35, avatar: "👧",
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", relation: "child", age: 10, gender: "male", height: 140, weight: 35, avatar: "👧" });
    setShowForm(true);
  };

  const openEdit = (m: FamilyMember) => {
    setEditingId(m.id);
    setForm({ name: m.name, relation: m.relation, age: m.age, gender: m.gender, height: m.height, weight: m.weight, avatar: m.avatar });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateMember(editingId, form);
    } else {
      const id = Date.now().toString(36);
      addMember({ ...form, id, conditions: [] });
      setActiveMember(id);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm(lang === "vi" ? "Xóa thành viên này? Toàn bộ dữ liệu của họ sẽ bị xóa." : "Remove this member? All their data will be deleted.")) return;
    removeMember(id);
    setShowForm(false);
  };

  return (
    <div className="mb-5">
      {/* Member chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 items-center">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMember(m.id)}
            onDoubleClick={() => openEdit(m)}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition flex-shrink-0 ${
              activeMemberId === m.id
                ? "border-green-400 bg-green-50 shadow-sm"
                : "border-gray-100 bg-white hover:border-green-200"
            }`}
          >
            <span className="text-xl leading-none">{m.avatar}</span>
            <span className="text-left">
              <span className={`block text-sm font-semibold leading-tight ${activeMemberId === m.id ? "text-green-700" : "text-gray-700"}`}>{m.name}</span>
              <span className="block text-[10px] text-gray-400 leading-tight">
                {RELATION_LABELS[m.relation]?.[lang] || m.relation}
              </span>
            </span>
            {activeMemberId === m.id && m.id !== "me" && (
              <Pencil size={12} className="text-green-400 ml-1" onClick={(e) => { e.stopPropagation(); openEdit(m); }} />
            )}
          </button>
        ))}
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-500 transition flex-shrink-0 text-sm"
        >
          <Plus size={16} />
          {lang === "vi" ? "Thành viên" : "Member"}
        </button>
      </div>

      {/* Add/edit form */}
      {showForm && (
        <div className="mt-3 bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">
              {editingId
                ? (lang === "vi" ? "Sửa thành viên" : "Edit member")
                : (lang === "vi" ? "Thêm thành viên gia đình" : "Add family member")}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500"><X size={18} /></button>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setForm((f) => ({ ...f, avatar: a }))} className={`text-2xl p-1.5 rounded-xl transition ${form.avatar === a ? "bg-green-100 ring-2 ring-green-300" : "hover:bg-gray-50"}`}>
                {a}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={lang === "vi" ? "Tên (VD: Mẹ, Bé Na...)" : "Name (e.g. Mom, Lily...)"}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 col-span-2"
            />
            <select value={form.relation} onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value as FamilyMember["relation"] }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400">
              {(Object.keys(RELATION_LABELS) as FamilyMember["relation"][]).filter((r) => r !== "self").map((r) => (
                <option key={r} value={r}>{RELATION_LABELS[r][lang]}</option>
              ))}
            </select>
            <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as "male" | "female" }))} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400">
              <option value="male">{lang === "vi" ? "Nam" : "Male"}</option>
              <option value="female">{lang === "vi" ? "Nữ" : "Female"}</option>
            </select>
            <div>
              <label className="text-[10px] text-gray-400 block mb-0.5">{lang === "vi" ? "Tuổi" : "Age"}</label>
              <input type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">{lang === "vi" ? "Cao (cm)" : "Height"}</label>
                <input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">{lang === "vi" ? "Nặng (kg)" : "Weight"}</label>
                <input type="number" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition">
              {lang === "vi" ? "Lưu" : "Save"}
            </button>
            {editingId && editingId !== "me" && (
              <button onClick={() => handleDelete(editingId)} className="px-4 py-2.5 rounded-xl text-sm text-red-500 bg-red-50 hover:bg-red-100 transition">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
