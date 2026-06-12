"use client";
import { useState, useEffect, useCallback } from "react";
import { backend, Customer, Stats } from "../lib/api";
import { useT, useLang } from "../lib/i18n";
import { Users, Plus, Shield, DollarSign, Sparkles, Copy, Check, Trash2, RefreshCw, Crown, Loader2 } from "lucide-react";

function adminFetch<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const token = sessionStorage.getItem("admin-token") || "";
  return backend<T>(action, { ...payload, adminToken: token });
}

export default function AdminPage() {
  const t = useT();
  const { lang, setLang } = useLang();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "free", language: "vi" });
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([
        adminFetch<Customer[]>("listCustomers"),
        adminFetch<Stats>("stats"),
      ]);
      setCustomers(Array.isArray(list) ? list.filter((c) => c.status !== "deleted") : []);
      setStats(s);
    } catch {
      setError("Không tải được dữ liệu. Kiểm tra cấu hình GAS_URL trong .env.local");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("admin-token")) {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const handleLogin = async () => {
    setLoginError(false);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const { token } = await res.json();
      sessionStorage.setItem("admin-token", token);
      setAuthed(true);
    } else {
      setLoginError(true);
    }
  };

  const handleAdd = async () => {
    if (!form.name) return;
    await adminFetch("createCustomer", { data: form });
    setShowAdd(false);
    setForm({ name: "", email: "", phone: "", plan: "free", language: "vi" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "vi" ? "Xóa khách hàng này?" : "Delete this customer?")) return;
    await adminFetch("deleteCustomer", { id });
    load();
  };

  const handleAddCredits = async (id: string) => {
    const amount = prompt(lang === "vi" ? "Số lượt AI muốn thêm:" : "Credits to add:", "10");
    if (!amount) return;
    await adminFetch("addCredits", { customerId: id, amount: Number(amount) });
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">{t("admin")}</h1>
              <p className="text-xs text-gray-400">HealthAI Enterprise</p>
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder={t("adminPassword")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 mb-3"
          />
          {loginError && <p className="text-red-500 text-sm mb-3">{t("invalidCode")}</p>}
          <button onClick={handleLogin} className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition">
            {t("login")}
          </button>
        </div>
      </div>
    );
  }

  const planBadge = (plan: string) => {
    const map: Record<string, string> = {
      free: "bg-gray-100 text-gray-600",
      pro: "bg-blue-100 text-blue-700",
      clinic: "bg-purple-100 text-purple-700",
    };
    return map[plan] || map.free;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h1 className="font-bold text-gray-800">HealthAI {t("admin")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
              {lang === "vi" ? "EN" : "VI"}
            </button>
            <button onClick={load} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200" title="Refresh">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Users size={16} /> {t("customers")}</div>
            <p className="text-2xl font-bold">{stats?.totalCustomers ?? "—"}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Crown size={16} /> Pro / Clinic</div>
            <p className="text-2xl font-bold">{(stats?.byPlan?.pro || 0) + (stats?.byPlan?.clinic || 0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><DollarSign size={16} /> {t("revenue")}</div>
            <p className="text-lg font-bold">
              {stats?.revenue && Object.keys(stats.revenue).length > 0
                ? Object.entries(stats.revenue).map(([cur, amt]) => `${Number(amt).toLocaleString()} ${cur}`).join(" + ")
                : "0"}
            </p>
          </div>
        </div>

        {/* Add customer */}
        <button onClick={() => setShowAdd(!showAdd)} className="w-full bg-purple-600 text-white py-3 rounded-2xl font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2">
          <Plus size={18} /> {t("addCustomer")}
        </button>

        {showAdd && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={lang === "vi" ? "Họ tên *" : "Full name *"} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder={lang === "vi" ? "SĐT" : "Phone"} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="clinic">Clinic</option>
              </select>
            </div>
            <button onClick={handleAdd} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700">
              {t("save")}
            </button>
          </div>
        )}

        {/* Customer list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading && customers.length === 0 ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-purple-400" /></div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-2 text-gray-200" />
              {lang === "vi" ? "Chưa có khách hàng nào" : "No customers yet"}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {customers.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planBadge(c.plan)}`}>{c.plan}</span>
                    </div>
                    <p className="text-xs text-gray-400">{c.email || c.phone || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyCode(c.accessCode)} className="flex items-center gap-1 text-xs font-mono bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-100" title={t("accessCode")}>
                      {copied === c.accessCode ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      {c.accessCode}
                    </button>
                    <button onClick={() => handleAddCredits(c.id)} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg" title={t("credits")}>
                      <Sparkles size={12} /> {c.aiCredits}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-400 p-1.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
