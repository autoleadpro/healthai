"use client";
import { useState, useEffect } from "react";
import { backend, Customer, Clinic } from "../lib/api";
import { Phone, MapPin } from "lucide-react";
import { useT, useLang } from "../lib/i18n";
import { HeartPulse, KeyRound, Loader2, Sparkles, Crown, LogOut } from "lucide-react";
import Dashboard from "../components/Dashboard";
import FoodTracker from "../components/FoodTracker";
import LabResults from "../components/LabResults";
import HealthAnalysis from "../components/HealthAnalysis";
import Profile from "../components/Profile";
import FamilyBar from "../components/FamilyBar";
import DailyCheckIn from "../components/DailyCheckIn";
import FamilyAlerts from "../components/FamilyAlerts";
import ClinicMessages from "../components/ClinicMessages";
import Trends from "../components/Trends";
import Medications from "../components/Medications";
import MedReminder from "../components/MedReminder";
import { TrendingUp, Pill } from "lucide-react";
import { LayoutDashboard, Apple, FlaskConical, Brain, User } from "lucide-react";
import { useHealthStore } from "../store/healthStore";

export default function PortalPage() {
  const t = useT();
  const { lang, setLang } = useLang();
  const { activeTab, setActiveTab, loginAsCustomer, clearSession, setLabResults } = useHealthStore();

  // Reset/scope local data to this customer, then pull their lab records from Sheets.
  const hydrateCustomer = async (c: Customer) => {
    loginAsCustomer(c);
    try {
      const records = await backend<Array<Record<string, unknown>>>("listRecords", { customerId: c.id });
      if (Array.isArray(records) && records.length) {
        setLabResults(records.map((r, i) => ({
          id: String(r.id || `${Date.now()}-${i}`),
          memberId: String(r.memberId || "me"),
          date: String(r.date || ""),
          category: String(r.category || "Khác"),
          name: String(r.name || ""),
          value: String(r.value ?? ""),
          unit: String(r.unit || ""),
          normalMin: r.normalMin !== "" && r.normalMin != null ? Number(r.normalMin) : undefined,
          normalMax: r.normalMax !== "" && r.normalMax != null ? Number(r.normalMax) : undefined,
        })));
      }
    } catch {}
  };
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [regType, setRegType] = useState<"individual" | "clinic">("individual");
  const [reg, setReg] = useState({ name: "", email: "", phone: "", clinicName: "" });
  const [newCode, setNewCode] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("portal-customer");
    if (saved) {
      try { setCustomer(JSON.parse(saved)); } catch {}
    }
    const savedClinic = localStorage.getItem("portal-clinic");
    if (savedClinic) {
      try { setClinic(JSON.parse(savedClinic)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (customer?.clinicId && !clinic) {
      backend<Clinic | null>("getClinic", { id: customer.clinicId })
        .then((cl) => {
          if (cl && cl.id) {
            setClinic(cl);
            localStorage.setItem("portal-clinic", JSON.stringify(cl));
          }
        })
        .catch(() => {});
    }
  }, [customer, clinic]);

  const handleLogin = async () => {
    if (code.length < 6) return;
    setLoading(true);
    setError(false);
    try {
      const found = await backend<Customer | null>("customerByCode", { code });
      if (found && found.id && found.status === "active") {
        await hydrateCustomer(found);
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

  const handleRegister = async () => {
    if (regType === "clinic" ? !reg.clinicName.trim() : !reg.name.trim()) { setError(true); return; }
    setLoading(true);
    setError(false);
    try {
      let created: Customer | null = null;
      if (regType === "clinic") {
        const res = await backend<{ customer: Customer; clinic: Clinic }>("registerClinic", {
          data: { clinicName: reg.clinicName, name: reg.name || reg.clinicName, email: reg.email, phone: reg.phone, language: lang },
        });
        if (res && res.customer && res.customer.id) {
          created = res.customer;
          if (res.clinic) localStorage.setItem("portal-clinic", JSON.stringify(res.clinic));
        }
      } else {
        created = await backend<Customer>("selfRegister", {
          data: { name: reg.name, email: reg.email, phone: reg.phone, language: lang },
        });
      }
      if (created && created.id) {
        // Fresh account — wipe any previous account's local data
        loginAsCustomer(created);
        setNewCode(created.accessCode);
        localStorage.setItem("portal-customer", JSON.stringify(created));
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
    localStorage.removeItem("portal-clinic");
    clearSession();
    setCustomer(null);
    setClinic(null);
    setCode("");
    setNewCode(null);
    setMode("login");
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <HeartPulse size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{newCode ? (lang === "vi" ? "Đăng ký thành công!" : "You're all set!") : mode === "login" ? t("portalLogin") : (lang === "vi" ? "Dùng thử miễn phí" : "Free trial")}</h1>
            <p className="text-sm text-gray-400 mt-1">{newCode ? (lang === "vi" ? "Lưu lại mã truy cập của bạn" : "Save your access code") : mode === "login" ? t("enterCode") : (lang === "vi" ? "Tạo tài khoản trong 10 giây" : "Create an account in 10 seconds")}</p>
          </div>

          {/* Success: show the generated access code */}
          {newCode ? (
            <>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center mb-4">
                <p className="text-xs text-gray-500 mb-1">{lang === "vi" ? "Mã truy cập (dùng để đăng nhập lần sau)" : "Your access code (use it to log in next time)"}</p>
                <p className="text-3xl font-mono font-bold text-green-600 tracking-[0.3em]">{newCode}</p>
              </div>
              <button onClick={() => { const r = localStorage.getItem("portal-customer"); if (r) setCustomer(JSON.parse(r)); }} className="w-full bg-green-500 text-white py-3.5 rounded-2xl font-medium hover:bg-green-600 transition">
                {lang === "vi" ? "Bắt đầu dùng ngay →" : "Start using now →"}
              </button>
            </>
          ) : mode === "login" ? (
            <>
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
              <button onClick={() => { setMode("register"); setError(false); }} className="w-full mt-3 text-sm text-green-600 font-medium hover:underline">
                {lang === "vi" ? "Chưa có tài khoản? Đăng ký dùng thử miễn phí" : "No account? Sign up for a free trial"}
              </button>
            </>
          ) : (
            <>
              {/* Account type selector */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setRegType("individual")} className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${regType === "individual" ? "border-green-400 bg-green-50 text-green-700" : "border-gray-100 text-gray-500 hover:border-green-200"}`}>
                  🧑 {lang === "vi" ? "Cá nhân" : "Individual"}
                </button>
                <button onClick={() => setRegType("clinic")} className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${regType === "clinic" ? "border-green-400 bg-green-50 text-green-700" : "border-gray-100 text-gray-500 hover:border-green-200"}`}>
                  🏥 {lang === "vi" ? "Phòng khám" : "Clinic"}
                </button>
              </div>
              <div className="space-y-3 mb-3">
                {regType === "clinic" && (
                  <input value={reg.clinicName} onChange={(e) => setReg((r) => ({ ...r, clinicName: e.target.value }))} placeholder={lang === "vi" ? "Tên phòng khám *" : "Clinic name *"} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
                )}
                <input value={reg.name} onChange={(e) => setReg((r) => ({ ...r, name: e.target.value }))} placeholder={regType === "clinic" ? (lang === "vi" ? "Tên người phụ trách" : "Contact person") : (lang === "vi" ? "Họ và tên *" : "Full name *")} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
                <input value={reg.email} onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))} placeholder="Email" className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
                <input value={reg.phone} onChange={(e) => setReg((r) => ({ ...r, phone: e.target.value }))} placeholder={lang === "vi" ? "Số điện thoại" : "Phone"} className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
              </div>
              {regType === "clinic" && (
                <p className="text-xs text-gray-400 mb-3">{lang === "vi" ? "Gói Phòng khám: quản lý nhiều bệnh nhân, 50 lượt AI dùng thử." : "Clinic plan: manage many patients, 50 trial AI credits."}</p>
              )}
              {error && <p className="text-red-500 text-sm text-center mb-3">{lang === "vi" ? (regType === "clinic" ? "Vui lòng nhập tên phòng khám" : "Vui lòng nhập họ tên") : "Please fill the required field"}</p>}
              <button onClick={handleRegister} disabled={loading} className="w-full bg-green-500 text-white py-3.5 rounded-2xl font-medium hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {lang === "vi" ? "Đăng ký miễn phí" : "Sign up free"}
              </button>
              <button onClick={() => { setMode("login"); setError(false); }} className="w-full mt-3 text-sm text-gray-500 hover:underline">
                {lang === "vi" ? "Đã có mã truy cập? Đăng nhập" : "Have an access code? Log in"}
              </button>
            </>
          )}

          {!newCode && (
            <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600">
              {lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "food", label: t("food"), icon: Apple },
    { id: "meds", label: lang === "vi" ? "Thuốc" : "Meds", icon: Pill },
    { id: "lab", label: t("lab"), icon: FlaskConical },
    { id: "trends", label: lang === "vi" ? "Xu hướng" : "Trends", icon: TrendingUp },
    { id: "analysis", label: lang === "vi" ? "AI" : "AI", icon: Brain },
    { id: "profile", label: t("profile"), icon: User },
  ];

  const isPaid = customer.plan === "pro" || customer.plan === "clinic";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clinic ? (
              clinic.logo?.startsWith("http") ? (
                <img src={clinic.logo} alt={clinic.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: (clinic.color || "#16a34a") + "1a" }}>
                  {clinic.logo || "🏥"}
                </div>
              )
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <HeartPulse size={16} className="text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-gray-800 leading-none text-sm">{clinic ? clinic.name : customer.name}</h1>
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
        {/* Clinic branding banner */}
        {clinic && activeTab === "dashboard" && (
          <div className="rounded-2xl p-5 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${clinic.color || "#16a34a"}, ${clinic.color || "#16a34a"}cc)` }}>
            <div className="flex items-center gap-4">
              {clinic.logo?.startsWith("http") ? (
                <img src={clinic.logo} alt={clinic.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">{clinic.logo || "🏥"}</div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-lg leading-tight">{clinic.name}</h2>
                {clinic.tagline && <p className="text-white/80 text-sm">{clinic.tagline}</p>}
                {clinic.specialty && <p className="text-white/60 text-xs mt-0.5">{clinic.specialty}</p>}
              </div>
            </div>
            {(clinic.phone || clinic.address) && (
              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/20 text-xs text-white/80">
                {clinic.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {clinic.phone}</span>}
                {clinic.address && <span className="flex items-center gap-1.5"><MapPin size={12} /> {clinic.address}</span>}
              </div>
            )}
            <p className="text-white/50 text-[10px] mt-2">
              {lang === "vi" ? `${customer.name} — bệnh nhân của ${clinic.name}` : `${customer.name} — patient of ${clinic.name}`}
            </p>
          </div>
        )}
        {activeTab !== "profile" && <FamilyBar />}
        {activeTab === "dashboard" && (
          <>
            <ClinicMessages />
            <FamilyAlerts />
            <MedReminder />
            <DailyCheckIn />
            <Dashboard />
          </>
        )}
        {activeTab === "food" && <FoodTracker />}
        {activeTab === "meds" && <Medications />}
        {activeTab === "lab" && <LabResults />}
        {activeTab === "trends" && <Trends />}
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
