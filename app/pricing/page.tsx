"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useT, useLang } from "../lib/i18n";
import { Check, X, CreditCard, QrCode, Loader2, HeartPulse, PartyPopper } from "lucide-react";

const PLANS = [
  {
    id: "free",
    nameVi: "Miễn phí", nameEn: "Free",
    priceUsd: "$0", priceVnd: "0đ",
    featured: false,
    features: [
      { vi: "1 hồ sơ cá nhân", en: "1 personal profile", ok: true },
      { vi: "Phân tích ảnh bữa ăn", en: "Meal photo analysis", ok: true },
      { vi: "5 lượt AI / tháng", en: "5 AI credits / month", ok: true },
      { vi: "Nhập xét nghiệm thủ công", en: "Manual lab entry", ok: true },
      { vi: "Biểu đồ xu hướng", en: "Trend charts", ok: false },
      { vi: "AI không giới hạn", en: "Unlimited AI", ok: false },
    ],
  },
  {
    id: "pro",
    nameVi: "Pro", nameEn: "Pro",
    priceUsd: "$7.99", priceVnd: "199.000đ",
    featured: true,
    features: [
      { vi: "Tất cả tính năng Free", en: "Everything in Free", ok: true },
      { vi: "AI không giới hạn", en: "Unlimited AI analysis", ok: true },
      { vi: "Biểu đồ xu hướng sức khỏe", en: "Health trend charts", ok: true },
      { vi: "Kế hoạch tuần cá nhân hóa", en: "Personalized weekly plans", ok: true },
      { vi: "Xuất báo cáo PDF", en: "PDF report export", ok: true },
      { vi: "Quản lý nhiều khách hàng", en: "Multi-customer management", ok: false },
    ],
  },
  {
    id: "clinic",
    nameVi: "Phòng khám", nameEn: "Clinic",
    priceUsd: "$49", priceVnd: "1.200.000đ",
    featured: false,
    features: [
      { vi: "Tất cả tính năng Pro", en: "Everything in Pro", ok: true },
      { vi: "Không giới hạn bệnh nhân", en: "Unlimited patients", ok: true },
      { vi: "Dashboard bác sĩ tổng hợp", en: "Practitioner dashboard", ok: true },
      { vi: "Mã truy cập cho từng khách", en: "Per-patient access codes", ok: true },
      { vi: "Cảnh báo ca cần chú ý", en: "At-risk patient alerts", ok: true },
      { vi: "Hỗ trợ ưu tiên", en: "Priority support", ok: true },
    ],
  },
];

function PricingContent() {
  const t = useT();
  const { lang, setLang } = useLang();
  const searchParams = useSearchParams();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Handle return from payment gateway
  useEffect(() => {
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");
    const customerId = searchParams.get("customerId");
    const provider = searchParams.get("provider");
    if (status === "success" && plan && provider && !confirmed) {
      setConfirmed(true);
      if (customerId) {
        fetch("/api/pay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, plan, provider }),
        }).catch(() => {});
      }
    }
  }, [searchParams, confirmed]);

  const pay = async (planId: string, provider: "stripe" | "payos") => {
    setPaying(`${planId}-${provider}`);
    setError(null);
    try {
      const customer = localStorage.getItem("portal-customer");
      const customerId = customer ? JSON.parse(customer).id : "";
      const email = customer ? JSON.parse(customer).email : "";
      const res = await fetch(`/api/pay/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, customerId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Payment error");
      }
    } catch {
      setError(lang === "vi" ? "Lỗi kết nối, thử lại sau" : "Connection error, try again");
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <HeartPulse size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">HealthAI</span>
          </a>
          <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
            {lang === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
          </button>
        </div>

        {confirmed && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 mb-8 flex items-center gap-3">
            <PartyPopper className="text-green-500" size={28} />
            <div>
              <p className="font-bold text-green-700">{lang === "vi" ? "Thanh toán thành công!" : "Payment successful!"}</p>
              <p className="text-sm text-green-600">{lang === "vi" ? "Gói của bạn đã được kích hoạt. Quay lại cổng khách hàng để sử dụng." : "Your plan is now active. Return to the portal to start using it."}</p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{t("pricingTitle")}</h1>
        <p className="text-center text-gray-400 mb-10">
          {lang === "vi" ? "Thanh toán quốc tế qua thẻ • Việt Nam quét VietQR miễn phí" : "International cards via Stripe • VietQR for Vietnam"}
        </p>

        {error && <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 text-center">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`rounded-3xl p-6 bg-white ${plan.featured ? "border-2 border-green-400 shadow-xl shadow-green-100 relative" : "border border-gray-100 shadow-sm"}`}>
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {lang === "vi" ? "PHỔ BIẾN NHẤT" : "MOST POPULAR"}
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-800">{lang === "vi" ? plan.nameVi : plan.nameEn}</h3>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-gray-900">{lang === "vi" ? plan.priceVnd : plan.priceUsd}</span>
                <span className="text-gray-400 text-sm">{plan.id === "free" ? t("forever") : t("monthly")}</span>
                {plan.id !== "free" && (
                  <p className="text-xs text-gray-400 mt-1">{lang === "vi" ? `≈ ${plan.priceUsd} quốc tế` : `≈ ${plan.priceVnd} in Vietnam`}</p>
                )}
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${f.ok ? "text-gray-600" : "text-gray-300"}`}>
                    {f.ok ? <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> : <X size={16} className="text-gray-200 mt-0.5 flex-shrink-0" />}
                    {lang === "vi" ? f.vi : f.en}
                  </li>
                ))}
              </ul>
              {plan.id === "free" ? (
                <a href="/portal" className="block w-full text-center border-2 border-gray-200 text-gray-600 py-3 rounded-2xl font-medium hover:bg-gray-50 transition">
                  {lang === "vi" ? "Bắt đầu miễn phí" : "Start free"}
                </a>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => pay(plan.id, "stripe")}
                    disabled={paying !== null}
                    className={`w-full py-3 rounded-2xl font-medium transition flex items-center justify-center gap-2 ${plan.featured ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-800 text-white hover:bg-gray-900"} disabled:opacity-50`}
                  >
                    {paying === `${plan.id}-stripe` ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                    {t("payWithCard")}
                  </button>
                  <button
                    onClick={() => pay(plan.id, "payos")}
                    disabled={paying !== null}
                    className="w-full py-3 rounded-2xl font-medium transition flex items-center justify-center gap-2 border-2 border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                  >
                    {paying === `${plan.id}-payos` ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                    {t("payWithQR")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-300 mt-10">
          {lang === "vi"
            ? "Hủy bất cứ lúc nào • Dữ liệu của bạn luôn thuộc về bạn • Hỗ trợ 24/7"
            : "Cancel anytime • Your data stays yours • 24/7 support"}
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-400" /></div>}>
      <PricingContent />
    </Suspense>
  );
}
