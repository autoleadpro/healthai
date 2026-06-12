"use client";
import { useState } from "react";
import { useHealthStore, LabResult } from "../store/healthStore";
import { FlaskConical, Plus, Trash2, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

const LAB_CATEGORIES = {
  "Huyết học": [
    { name: "Hồng cầu (RBC)", unit: "T/L", normalMin: 4.2, normalMax: 5.4 },
    { name: "Bạch cầu (WBC)", unit: "G/L", normalMin: 4.0, normalMax: 10.0 },
    { name: "Tiểu cầu (PLT)", unit: "G/L", normalMin: 150, normalMax: 400 },
    { name: "Hemoglobin (Hb)", unit: "g/dL", normalMin: 12.0, normalMax: 17.5 },
    { name: "Hematocrit (Hct)", unit: "%", normalMin: 36, normalMax: 52 },
  ],
  "Sinh hóa máu": [
    { name: "Glucose máu", unit: "mmol/L", normalMin: 3.9, normalMax: 6.1 },
    { name: "HbA1c", unit: "%", normalMin: 4.0, normalMax: 5.7 },
    { name: "Cholesterol toàn phần", unit: "mmol/L", normalMin: 0, normalMax: 5.2 },
    { name: "LDL-Cholesterol", unit: "mmol/L", normalMin: 0, normalMax: 3.4 },
    { name: "HDL-Cholesterol", unit: "mmol/L", normalMin: 1.0, normalMax: 10.0 },
    { name: "Triglyceride", unit: "mmol/L", normalMin: 0, normalMax: 1.7 },
    { name: "Ure", unit: "mmol/L", normalMin: 2.5, normalMax: 7.5 },
    { name: "Creatinine", unit: "µmol/L", normalMin: 62, normalMax: 115 },
    { name: "Axit uric", unit: "µmol/L", normalMin: 202, normalMax: 416 },
  ],
  "Chức năng gan": [
    { name: "ALT (SGPT)", unit: "U/L", normalMin: 0, normalMax: 40 },
    { name: "AST (SGOT)", unit: "U/L", normalMin: 0, normalMax: 40 },
    { name: "GGT", unit: "U/L", normalMin: 0, normalMax: 50 },
    { name: "Bilirubin toàn phần", unit: "µmol/L", normalMin: 0, normalMax: 21 },
    { name: "Albumin", unit: "g/L", normalMin: 35, normalMax: 52 },
  ],
  "Tuyến giáp": [
    { name: "TSH", unit: "µIU/mL", normalMin: 0.4, normalMax: 4.0 },
    { name: "FT4", unit: "pmol/L", normalMin: 12, normalMax: 22 },
    { name: "FT3", unit: "pmol/L", normalMin: 4.0, normalMax: 8.3 },
  ],
  "Vi chất": [
    { name: "Sắt huyết thanh", unit: "µmol/L", normalMin: 9.0, normalMax: 30.0 },
    { name: "Ferritin", unit: "ng/mL", normalMin: 12, normalMax: 300 },
    { name: "Vitamin D", unit: "ng/mL", normalMin: 30, normalMax: 100 },
    { name: "Vitamin B12", unit: "pg/mL", normalMin: 200, normalMax: 900 },
    { name: "Canxi", unit: "mmol/L", normalMin: 2.1, normalMax: 2.6 },
    { name: "Magie", unit: "mmol/L", normalMin: 0.7, normalMax: 1.0 },
  ],
};

export default function LabResults() {
  const { labResults, addLabResult, removeLabResult } = useHealthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: "Sinh hóa máu",
    name: "",
    value: "",
    unit: "",
    normalMin: "",
    normalMax: "",
    date: new Date().toISOString().split("T")[0],
  });

  const selectedCategoryTests = LAB_CATEGORIES[form.category as keyof typeof LAB_CATEGORIES] || [];

  const handleTestSelect = (test: { name: string; unit: string; normalMin: number; normalMax: number }) => {
    setForm((f) => ({ ...f, name: test.name, unit: test.unit, normalMin: String(test.normalMin), normalMax: String(test.normalMax) }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.value) return;
    const result: LabResult = {
      id: Date.now().toString(),
      date: form.date,
      category: form.category,
      name: form.name,
      value: form.value,
      unit: form.unit,
      normalMin: form.normalMin ? Number(form.normalMin) : undefined,
      normalMax: form.normalMax ? Number(form.normalMax) : undefined,
    };
    addLabResult(result);
    setForm({ ...form, name: "", value: "", unit: "", normalMin: "", normalMax: "" });
    setShowForm(false);
  };

  const getStatus = (result: LabResult) => {
    const val = parseFloat(result.value);
    if (isNaN(val)) return "normal";
    if (result.normalMax && val > result.normalMax) return "high";
    if (result.normalMin && val < result.normalMin) return "low";
    return "normal";
  };

  const grouped = labResults.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, LabResult[]>);

  const abnormalCount = labResults.filter((r) => getStatus(r) !== "normal").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FlaskConical size={24} /> Kết quả xét nghiệm
        </h2>
        <p className="text-blue-100 mt-1">Nhập kết quả xét nghiệm để AI phân tích và tư vấn sức khỏe</p>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-blue-200 text-sm">Tổng chỉ số</p>
            <p className="text-2xl font-bold">{labResults.length}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Bất thường</p>
            <p className="text-2xl font-bold text-yellow-300">{abnormalCount}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-blue-500 text-white py-3 rounded-2xl font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Thêm kết quả xét nghiệm
      </button>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
          <h3 className="font-semibold text-gray-700 mb-4">Nhập kết quả xét nghiệm</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Ngày xét nghiệm</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Nhóm xét nghiệm</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, name: "", unit: "", normalMin: "", normalMax: "" }))} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400">
                {Object.keys(LAB_CATEGORIES).map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-2 block">Chọn chỉ số</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {selectedCategoryTests.map((test) => (
                  <button
                    key={test.name}
                    onClick={() => handleTestSelect(test)}
                    className={`text-left p-2 rounded-lg text-xs border transition ${form.name === test.name ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-100 hover:border-blue-200 text-gray-600"}`}
                  >
                    {test.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Hoặc nhập tên chỉ số tùy chỉnh</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Tên xét nghiệm" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Kết quả</label>
                <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Giá trị" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Đơn vị</label>
                <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="mmol/L" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Khoảng bình thường (thấp)</label>
                <input value={form.normalMin} onChange={(e) => setForm((f) => ({ ...f, normalMin: e.target.value }))} placeholder="Giá trị min" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Khoảng bình thường (cao)</label>
                <input value={form.normalMax} onChange={(e) => setForm((f) => ({ ...f, normalMax: e.target.value }))} placeholder="Giá trị max" className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition">
              Lưu kết quả
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {Object.entries(grouped).map(([category, results]) => (
        <div key={category} className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
          <div className="px-5 py-3 bg-blue-50 flex items-center gap-2">
            <FlaskConical size={16} className="text-blue-500" />
            <span className="font-medium text-gray-700">{category}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((result) => {
              const status = getStatus(result);
              return (
                <div key={result.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {status === "high" ? <TrendingUp size={18} className="text-red-500" /> :
                      status === "low" ? <TrendingDown size={18} className="text-blue-500" /> :
                      <CheckCircle size={18} className="text-green-500" />}
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{result.name}</p>
                      <p className="text-xs text-gray-400">{result.date} {result.normalMin !== undefined && `• Bình thường: ${result.normalMin}–${result.normalMax} ${result.unit}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`font-bold text-lg ${status === "high" ? "text-red-500" : status === "low" ? "text-blue-500" : "text-green-600"}`}>
                        {result.value}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">{result.unit}</span>
                      {status !== "normal" && (
                        <div className="flex items-center gap-1 justify-end">
                          <AlertTriangle size={12} className="text-yellow-500" />
                          <span className="text-xs text-yellow-600">{status === "high" ? "Cao" : "Thấp"}</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeLabResult(result.id)} className="text-gray-200 hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {labResults.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-blue-50">
          <FlaskConical size={48} className="text-blue-200 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có kết quả xét nghiệm</p>
          <p className="text-gray-400 text-sm mt-1">Thêm kết quả xét nghiệm để AI phân tích sức khỏe của bạn</p>
        </div>
      )}
    </div>
  );
}
