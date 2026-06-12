"use client";
import { useT, useLang } from "./lib/i18n";
import { HeartPulse, Camera, FlaskConical, Brain, Users, ArrowRight, Globe, ShieldCheck, Sparkles } from "lucide-react";

export default function LandingPage() {
  const t = useT();
  const { lang, setLang } = useLang();

  const features = [
    {
      icon: Camera,
      vi: ["Chụp ảnh là biết calo", "AI nhận diện món ăn, tính calo, protein, carbs trong 5 giây"],
      en: ["Snap a photo, know your macros", "AI identifies dishes and counts calories, protein, carbs in 5 seconds"],
    },
    {
      icon: FlaskConical,
      vi: ["Hiểu kết quả xét nghiệm", "30+ chỉ số máu được giải thích bằng ngôn ngữ dễ hiểu"],
      en: ["Understand your lab results", "30+ blood markers explained in plain language"],
    },
    {
      icon: Brain,
      vi: ["Tư vấn lối sống bằng AI", "Kế hoạch ăn uống & tập luyện cá nhân hóa từng tuần"],
      en: ["AI lifestyle coaching", "Personalized weekly meal & exercise plans"],
    },
    {
      icon: Users,
      vi: ["Cho bác sĩ & phòng khám", "Quản lý hàng trăm bệnh nhân, mỗi người một mã truy cập riêng"],
      en: ["For doctors & clinics", "Manage hundreds of patients, each with their own access code"],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <HeartPulse size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">HealthAI</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/pricing" className="text-sm text-gray-500 hover:text-gray-800">{t("pricing")}</a>
            <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
              {lang === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
            </button>
            <a href="/portal" className="text-sm bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition">
              {t("login")}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          {lang === "vi" ? "Được hỗ trợ bởi Claude AI" : "Powered by Claude AI"}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          {lang === "vi" ? (
            <>Sức khỏe của bạn,<br /><span className="text-green-500">được AI thấu hiểu</span></>
          ) : (
            <>Your health,<br /><span className="text-green-500">understood by AI</span></>
          )}
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          {lang === "vi"
            ? "Chụp ảnh bữa ăn, nhập kết quả xét nghiệm — nhận tư vấn sức khỏe cá nhân hóa từ AI trong vài giây."
            : "Snap your meals, enter your lab results — get personalized AI health guidance in seconds."}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="/portal" className="bg-green-500 text-white px-6 py-3.5 rounded-2xl font-medium hover:bg-green-600 transition flex items-center gap-2">
            {lang === "vi" ? "Dùng thử miễn phí" : "Try for free"} <ArrowRight size={16} />
          </a>
          <a href="/pricing" className="border-2 border-gray-200 text-gray-600 px-6 py-3.5 rounded-2xl font-medium hover:bg-gray-50 transition">
            {lang === "vi" ? "Xem bảng giá" : "See pricing"}
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-300">
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> {lang === "vi" ? "Dữ liệu riêng tư" : "Private data"}</span>
          <span className="flex items-center gap-1"><Globe size={14} /> {lang === "vi" ? "Tiếng Việt + English" : "English + Vietnamese"}</span>
          <span className="flex items-center gap-1"><Sparkles size={14} /> {lang === "vi" ? "5 lượt AI miễn phí" : "5 free AI credits"}</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => {
            const [title, desc] = lang === "vi" ? f.vi : f.en;
            const Icon = f.icon;
            return (
              <div key={i} className="border border-gray-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-green-50 transition">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-green-500" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {lang === "vi" ? "Bắt đầu hành trình sức khỏe hôm nay" : "Start your health journey today"}
          </h2>
          <p className="text-green-100 mb-6">
            {lang === "vi" ? "Miễn phí mãi mãi cho cá nhân. Không cần thẻ tín dụng." : "Free forever for individuals. No credit card required."}
          </p>
          <a href="/portal" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-green-50 transition">
            {lang === "vi" ? "Dùng thử ngay" : "Get started"} <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-50 py-8 text-center text-xs text-gray-300">
        © 2026 HealthAI • <a href="/admin" className="hover:text-gray-500">{t("admin")}</a>
      </footer>
    </div>
  );
}
