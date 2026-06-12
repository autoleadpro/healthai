"use client";
import { useHealthStore } from "./store/healthStore";
import Dashboard from "./components/Dashboard";
import FoodTracker from "./components/FoodTracker";
import LabResults from "./components/LabResults";
import HealthAnalysis from "./components/HealthAnalysis";
import Profile from "./components/Profile";
import { LayoutDashboard, Apple, FlaskConical, Brain, User } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "food", label: "Bữa ăn", icon: Apple },
  { id: "lab", label: "Xét nghiệm", icon: FlaskConical },
  { id: "analysis", label: "Phân tích AI", icon: Brain },
  { id: "profile", label: "Hồ sơ", icon: User },
];

export default function Home() {
  const { activeTab, setActiveTab } = useHealthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">HealthAI</h1>
            <p className="text-xs text-gray-400">Theo dõi sức khỏe thông minh</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "food" && <FoodTracker />}
        {activeTab === "lab" && <LabResults />}
        {activeTab === "analysis" && <HealthAnalysis />}
        {activeTab === "profile" && <Profile />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-10">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 transition ${activeTab === id ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
                <span className="text-xs font-medium">{label}</span>
                {activeTab === id && <div className="w-1 h-1 rounded-full bg-green-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
