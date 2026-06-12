"use client";
import { useState, useRef, useCallback } from "react";
import { useHealthStore, FoodEntry } from "../store/healthStore";
import { Camera, Upload, Loader2, Trash2, Apple, Clock } from "lucide-react";

export default function FoodTracker() {
  const { foodHistory, addFoodEntry, removeFoodEntry } = useHealthStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<FoodEntry["meal"]>("lunch");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!pendingFile) return;
    setAnalyzing(true);
    setError(null);
    try {
      const { consumeCredit } = await import("../lib/credits");
      const credit = await consumeCredit("food_analysis");
      if (!credit.ok) {
        setError("Hết lượt AI. Vui lòng nâng cấp gói. / Out of AI credits — please upgrade.");
        setAnalyzing(false);
        return;
      }
      const form = new FormData();
      form.append("image", pendingFile);
      const res = await fetch("/api/analyze-food", { method: "POST", body: form });
      if (!res.ok) throw new Error("Phân tích thất bại");
      const data = await res.json();
      const entry: FoodEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        meal: selectedMeal,
        imageUrl: previewUrl || undefined,
        ...data,
      };
      addFoodEntry(entry);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch {
      setError("Không thể phân tích ảnh. Vui lòng thử lại.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const mealLabels: Record<FoodEntry["meal"], string> = {
    breakfast: "🌅 Bữa sáng",
    lunch: "☀️ Bữa trưa",
    dinner: "🌙 Bữa tối",
    snack: "🍎 Ăn vặt",
  };

  const groupedHistory = foodHistory.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Apple size={24} /> Theo dõi khẩu phần ăn
        </h2>
        <p className="text-green-100 mt-1">Chụp hoặc tải ảnh bữa ăn để phân tích dinh dưỡng bằng AI</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-50">
        <div className="flex gap-2 mb-4">
          {(Object.keys(mealLabels) as FoodEntry["meal"][]).map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition ${selectedMeal === meal ? "bg-green-500 text-white" : "bg-green-50 text-gray-600 hover:bg-green-100"}`}
            >
              {mealLabels[meal]}
            </button>
          ))}
        </div>

        {!previewUrl ? (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragOver ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-green-300 hover:bg-green-50"}`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Camera size={32} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Kéo thả ảnh vào đây</p>
                <p className="text-sm text-gray-400">hoặc click để chọn ảnh từ thiết bị</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Upload size={14} />
                JPG, PNG, WEBP hỗ trợ
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover" />
              <button onClick={() => { setPreviewUrl(null); setPendingFile(null); }} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full p-1.5 hover:bg-white">
                <Trash2 size={16} />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
            <button
              onClick={analyzeImage}
              disabled={analyzing}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {analyzing ? <><Loader2 size={20} className="animate-spin" /> Đang phân tích với AI...</> : <><Apple size={20} /> Phân tích dinh dưỡng</>}
            </button>
          </div>
        )}
        {error && !previewUrl && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Food History */}
      <div className="space-y-4">
        {Object.entries(groupedHistory).map(([date, entries]) => {
          const dayTotal = entries.reduce((sum, e) => sum + e.totalCalories, 0);
          return (
            <div key={date} className="bg-white rounded-2xl shadow-sm border border-green-50 overflow-hidden">
              <div className="px-5 py-3 bg-green-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-500" />
                  <span className="font-medium text-gray-700">{date === new Date().toISOString().split("T")[0] ? "Hôm nay" : date}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{dayTotal} kcal tổng</span>
              </div>
              <div className="divide-y divide-gray-50">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{mealLabels[entry.meal]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.nutritionScore >= 7 ? "bg-green-100 text-green-700" : entry.nutritionScore >= 5 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                          ⭐ {entry.nutritionScore}/10
                        </span>
                      </div>
                      <button onClick={() => removeFoodEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {entry.imageUrl && (
                      <img src={entry.imageUrl} alt="Food" className="w-full max-h-40 object-cover rounded-xl mb-3" />
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.foods.map((food, i) => (
                        <span key={i} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                          {food.name} ({food.portion})
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: "Calo", value: `${entry.totalCalories}`, unit: "kcal", color: "green" },
                        { label: "Protein", value: `${Math.round(entry.totalProtein)}`, unit: "g", color: "blue" },
                        { label: "Carbs", value: `${Math.round(entry.totalCarbs)}`, unit: "g", color: "yellow" },
                        { label: "Fat", value: `${Math.round(entry.totalFat)}`, unit: "g", color: "red" },
                      ].map(({ label, value, unit, color }) => {
                        const colors: Record<string, string> = { green: "bg-green-50 text-green-700", blue: "bg-blue-50 text-blue-700", yellow: "bg-yellow-50 text-yellow-700", red: "bg-red-50 text-red-700" };
                        return (
                          <div key={label} className={`${colors[color]} rounded-xl p-2 text-center`}>
                            <p className="text-xs opacity-70">{label}</p>
                            <p className="font-bold">{value}<span className="text-xs font-normal"> {unit}</span></p>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2">{entry.assessment}</p>

                    {entry.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {entry.suggestions.map((s, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-1">
                            <span className="text-green-400 mt-0.5">•</span> {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
