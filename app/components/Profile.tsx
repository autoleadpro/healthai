"use client";
import { useHealthStore } from "../store/healthStore";
import { User, Save } from "lucide-react";
import { useState } from "react";

const HEALTH_GOALS = ["Giảm cân", "Tăng cơ", "Kiểm soát đường huyết", "Giảm cholesterol", "Cải thiện tim mạch", "Tăng cường miễn dịch", "Ngủ ngon hơn", "Giảm stress"];
const CONDITIONS = ["Tiểu đường type 2", "Tăng huyết áp", "Mỡ máu cao", "Bệnh tim mạch", "Gout", "Viêm khớp", "Gan nhiễm mỡ", "Suy thận"];

export default function Profile() {
  const { userProfile, updateProfile } = useHealthStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...userProfile });

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const bmi = form.weight / Math.pow(form.height / 100, 2);
  const bmiStatus = bmi < 18.5 ? { label: "Thiếu cân", color: "text-blue-500" } :
    bmi < 25 ? { label: "Bình thường", color: "text-green-500" } :
    bmi < 30 ? { label: "Thừa cân", color: "text-yellow-500" } :
    { label: "Béo phì", color: "text-red-500" };

  const toggleGoal = (goal: string) => {
    const goals = form.healthGoals.includes(goal)
      ? form.healthGoals.filter(g => g !== goal)
      : [...form.healthGoals, goal];
    setForm(f => ({ ...f, healthGoals: goals }));
  };

  const toggleCondition = (cond: string) => {
    const conditions = form.conditions.includes(cond)
      ? form.conditions.filter(c => c !== cond)
      : [...form.conditions, cond];
    setForm(f => ({ ...f, conditions }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User size={24} /> Hồ sơ sức khỏe
        </h2>
        <p className="text-teal-100 mt-1">Cập nhật thông tin để AI tư vấn chính xác hơn</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
        <h3 className="font-semibold text-gray-700 mb-4">Thông tin cơ bản</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Họ và tên</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Tuổi</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Giới tính</label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value as "male" | "female" }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Chiều cao (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => setForm(f => ({ ...f, height: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Cân nặng (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* BMI Display */}
          <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Chỉ số BMI của bạn</span>
            <div className="text-right">
              <span className={`text-xl font-bold ${bmiStatus.color}`}>{bmi.toFixed(1)}</span>
              <span className={`ml-2 text-sm font-medium ${bmiStatus.color}`}>({bmiStatus.label})</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Mức độ vận động</label>
            <select
              value={form.activityLevel}
              onChange={e => setForm(f => ({ ...f, activityLevel: e.target.value as typeof form.activityLevel }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="sedentary">Ít vận động (ngồi nhiều)</option>
              <option value="light">Nhẹ (1-3 buổi/tuần)</option>
              <option value="moderate">Vừa phải (3-5 buổi/tuần)</option>
              <option value="active">Tích cực (6-7 buổi/tuần)</option>
              <option value="very_active">Rất tích cực (2 lần/ngày)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health Goals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
        <h3 className="font-semibold text-gray-700 mb-4">Mục tiêu sức khỏe</h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_GOALS.map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`px-4 py-2 rounded-full text-sm transition ${form.healthGoals.includes(goal) ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-teal-50"}`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Medical Conditions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-50">
        <h3 className="font-semibold text-gray-700 mb-4">Tình trạng bệnh lý (nếu có)</h3>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(cond => (
            <button
              key={cond}
              onClick={() => toggleCondition(cond)}
              className={`px-4 py-2 rounded-full text-sm transition ${form.conditions.includes(cond) ? "bg-red-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-50"}`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${saved ? "bg-green-500 text-white" : "bg-teal-500 text-white hover:bg-teal-600"}`}
      >
        <Save size={20} />
        {saved ? "✓ Đã lưu!" : "Lưu hồ sơ"}
      </button>
    </div>
  );
}
