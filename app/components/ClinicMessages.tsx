"use client";
import { useState, useEffect } from "react";
import { backend } from "../lib/api";
import { useLang } from "../lib/i18n";
import { Mail, MailOpen, Stethoscope } from "lucide-react";

interface ClinicMessage {
  id: string;
  customerId: string;
  from: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean | string;
}

export default function ClinicMessages() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<ClinicMessage[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("portal-customer");
    if (!raw) return;
    try {
      const customer = JSON.parse(raw);
      backend<ClinicMessage[]>("listMessages", { customerId: customer.id })
        .then((list) => { if (Array.isArray(list)) setMessages(list.reverse()); })
        .catch(() => {});
    } catch {}
  }, []);

  const open = (m: ClinicMessage) => {
    setExpanded(expanded === m.id ? null : m.id);
    if (m.read !== true && m.read !== "TRUE" && m.read !== "true") {
      backend("markMessageRead", { id: m.id }).catch(() => {});
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    }
  };

  if (messages.length === 0) return null;

  const isUnread = (m: ClinicMessage) => m.read !== true && m.read !== "TRUE" && m.read !== "true";
  const unread = messages.filter(isUnread).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-5">
      <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-sky-400 flex items-center gap-2 text-white">
        <Stethoscope size={18} />
        <span className="font-bold text-sm">{lang === "vi" ? "Tin nhắn từ phòng khám" : "Messages from your clinic"}</span>
        {unread > 0 && <span className="ml-auto bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{unread} {lang === "vi" ? "mới" : "new"}</span>}
      </div>
      <div className="divide-y divide-blue-50">
        {messages.slice(0, 5).map((m) => (
          <button key={m.id} onClick={() => open(m)} className="w-full px-4 py-3 text-left hover:bg-blue-50/50 transition">
            <div className="flex items-center gap-2.5">
              {isUnread(m)
                ? <Mail size={16} className="text-blue-500 flex-shrink-0" />
                : <MailOpen size={16} className="text-gray-300 flex-shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className={`text-sm truncate ${isUnread(m) ? "font-bold text-gray-800" : "font-medium text-gray-600"}`}>{m.title}</p>
                <p className="text-xs text-gray-400">{m.from} • {String(m.createdAt).slice(0, 10)}</p>
              </div>
            </div>
            {expanded === m.id && (
              <p className="text-sm text-gray-600 mt-2 pl-7 whitespace-pre-wrap">{m.body}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
