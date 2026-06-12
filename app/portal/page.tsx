"use client";
import { useState, useEffect } from "react";
import { backend, Customer } from "../lib/api";
import { useT, useLang } from "../lib/i18n";
import { HeartPulse, KeyRound, Loader2, Sparkles, Crown, LogOut } from "lucide-react";
import Dashboard from "../components/Dashboard";
import FoodTracker from "../components/FoodTracker";
import LabResults from "../components/LabResults";
import HealthAnalysis from "../components/HealthAnalysis";
import Profile from "../components/Profile";
import { LayoutDashboard, Apple, FlaskConical, Brain, User } from "lucide-react";
import { useHealthStore } from "../store/healthStore";

export default function PortalPage() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { activeTab, setActiveTab } = useHealthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("portal-customer");
    if (saved) {
      try { setCustomer(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleLogin = async () => {
    if (code.length < 6) return;
    setLoading(true);
    setError(false);
    try {
      const found = await backend<Customer | null>("customerByCode", { code });
      if (found && found.id && found.status === "active") {
        setCustomer(found);
        localStorage.setItem("portal-customer", JSON.stringify(found));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portal-customer");
    setCustomer(null);
    setCode("");
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <HeartPulse size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{t("portalLogin")}</h1>
            <p className="text-sm text-gray-400 mt-1">{t("enterCode")}</p>
          </div>
          <div className="relative mb-3">
            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="ABC123"
              className="w-full border-2 border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-center text-lg font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-green-400 uppercase"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-3">{t("invalidCode")}</p>}
          <button onClick={handleLogin} disabled={loading || code.length < 6} className="w-full bg-green-500 text-white py-3.5 rounded-2xl font-medium hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {t("login")}
          </button>
          <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600">
            {lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "food", label: t("food"), icon: Apple },
    { id: "lab", label: t("lab"), icon: FlaskConical },
    { id: "analysis", label: t("analysis"), icon: Brain },
    { id: "profile", label: t("profile"), icon: User },
  ];

  const isPaid = customer.plan === "pro" || customer.plan === "clinic";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <HeartPulse size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 leading-none text-sm">{customer.name}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPaid ? (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><Crown size={10} /> {customer.plan.toUpperCase()}</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Sparkles size={10} /> {customer.aiCredits} {t("creditsLeft")}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPaid && (
              <a href="/pricing" className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium">
                {t("upgrade")}
              </a>
            )}
            <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
              {lang === "vi" ? "EN" : "VI"}
            </button>
            <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-gray-600" title={t("logout")}>
              <LogOut size={16} />
            </button>
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
              <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 transition ${activeTab === id ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
