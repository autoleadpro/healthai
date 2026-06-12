"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "vi" | "en";

const dict = {
  vi: {
    appName: "HealthAI",
    tagline: "Theo dõi sức khỏe thông minh",
    // nav
    dashboard: "Tổng quan", food: "Bữa ăn", lab: "Xét nghiệm", analysis: "Phân tích AI", profile: "Hồ sơ", pricing: "Bảng giá", admin: "Quản trị",
    // common
    save: "Lưu", saved: "Đã lưu!", delete: "Xóa", cancel: "Hủy", loading: "Đang xử lý...", login: "Đăng nhập", logout: "Đăng xuất", search: "Tìm kiếm",
    // dashboard
    greeting: "Xin chào", todayCalories: "Calo hôm nay", protein: "Protein", carbs: "Carbs", fat: "Chất béo", target: "mục tiêu",
    healthScore: "Điểm sức khỏe tổng thể", noAnalysis: "Chưa có phân tích sức khỏe", analyzeNow: "Phân tích ngay",
    todayNutrition: "Dinh dưỡng hôm nay", recentMeals: "Bữa ăn gần đây", topAdvice: "Lời khuyên hàng đầu",
    riskLow: "Rủi ro thấp", riskMedium: "Rủi ro trung bình", riskHigh: "Rủi ro cao",
    // food
    foodTitle: "Theo dõi khẩu phần ăn", foodSubtitle: "Chụp hoặc tải ảnh bữa ăn để phân tích dinh dưỡng bằng AI",
    breakfast: "Bữa sáng", lunch: "Bữa trưa", dinner: "Bữa tối", snack: "Ăn vặt",
    dropImage: "Kéo thả ảnh vào đây", orClick: "hoặc click để chọn ảnh từ thiết bị",
    analyzeFood: "Phân tích dinh dưỡng", analyzing: "Đang phân tích với AI...",
    // lab
    labTitle: "Kết quả xét nghiệm", labSubtitle: "Nhập kết quả xét nghiệm để AI phân tích và tư vấn sức khỏe",
    addLab: "Thêm kết quả xét nghiệm", abnormal: "Bất thường", totalMarkers: "Tổng chỉ số", high: "Cao", low: "Thấp",
    // analysis
    aiTitle: "Phân tích & Tư vấn AI", aiSubtitle: "AI tổng hợp dữ liệu xét nghiệm và dinh dưỡng để đưa ra tư vấn toàn diện",
    analyzeAll: "Phân tích sức khỏe toàn diện", weeklyPlan: "Kế hoạch tuần",
    creditsLeft: "lượt AI còn lại", noCredits: "Hết lượt AI. Vui lòng nâng cấp gói hoặc mua thêm.",
    // pricing
    pricingTitle: "Chọn gói phù hợp với bạn", monthly: "/tháng", forever: "/mãi mãi",
    planFree: "Miễn phí", planPro: "Pro", planClinic: "Phòng khám",
    payWithCard: "Thanh toán thẻ quốc tế", payWithQR: "Quét VietQR (VN)", currentPlan: "Gói hiện tại", upgrade: "Nâng cấp",
    // portal
    portalLogin: "Cổng khách hàng", enterCode: "Nhập mã truy cập 6 ký tự", invalidCode: "Mã không đúng, thử lại",
    // admin
    customers: "Khách hàng", addCustomer: "Thêm khách hàng", revenue: "Doanh thu", plan: "Gói", credits: "Lượt AI", accessCode: "Mã truy cập",
    adminPassword: "Mật khẩu quản trị",
  },
  en: {
    appName: "HealthAI",
    tagline: "Smart health tracking",
    dashboard: "Dashboard", food: "Meals", lab: "Lab Tests", analysis: "AI Analysis", profile: "Profile", pricing: "Pricing", admin: "Admin",
    save: "Save", saved: "Saved!", delete: "Delete", cancel: "Cancel", loading: "Processing...", login: "Log in", logout: "Log out", search: "Search",
    greeting: "Hello", todayCalories: "Calories today", protein: "Protein", carbs: "Carbs", fat: "Fat", target: "of target",
    healthScore: "Overall health score", noAnalysis: "No health analysis yet", analyzeNow: "Analyze now",
    todayNutrition: "Today's nutrition", recentMeals: "Recent meals", topAdvice: "Top advice",
    riskLow: "Low risk", riskMedium: "Medium risk", riskHigh: "High risk",
    foodTitle: "Meal tracking", foodSubtitle: "Snap or upload a meal photo for AI nutrition analysis",
    breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
    dropImage: "Drop an image here", orClick: "or click to choose from your device",
    analyzeFood: "Analyze nutrition", analyzing: "Analyzing with AI...",
    labTitle: "Lab results", labSubtitle: "Enter lab results for AI health analysis and advice",
    addLab: "Add lab result", abnormal: "Abnormal", totalMarkers: "Total markers", high: "High", low: "Low",
    aiTitle: "AI Analysis & Advice", aiSubtitle: "AI combines lab and nutrition data into comprehensive guidance",
    analyzeAll: "Run full health analysis", weeklyPlan: "Weekly plan",
    creditsLeft: "AI credits left", noCredits: "Out of AI credits. Please upgrade or top up.",
    pricingTitle: "Pick the plan that fits you", monthly: "/month", forever: "/forever",
    planFree: "Free", planPro: "Pro", planClinic: "Clinic",
    payWithCard: "Pay with card", payWithQR: "VietQR (Vietnam)", currentPlan: "Current plan", upgrade: "Upgrade",
    portalLogin: "Customer portal", enterCode: "Enter your 6-character access code", invalidCode: "Invalid code, try again",
    customers: "Customers", addCustomer: "Add customer", revenue: "Revenue", plan: "Plan", credits: "AI credits", accessCode: "Access code",
    adminPassword: "Admin password",
  },
} as const;

export type TKey = keyof typeof dict.vi;

interface LangStore {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLang = create<LangStore>()(
  persist((set) => ({ lang: "vi", setLang: (lang) => set({ lang }) }), { name: "healthai-lang" })
);

export function useT() {
  const { lang } = useLang();
  return (key: TKey): string => dict[lang][key] ?? dict.vi[key] ?? key;
}
