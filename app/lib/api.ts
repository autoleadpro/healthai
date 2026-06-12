// Client for the Google Apps Script backend.
// All calls go through /api/backend (server-side proxy) so the API secret never reaches the browser.

export async function backend<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("/api/backend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}

export interface Customer {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  language: "vi" | "en";
  plan: "free" | "pro" | "clinic";
  planExpiry: string;
  aiCredits: number | string;
  accessCode: string;
  profile: string;
  status: string;
  notes: string;
}

export interface Stats {
  totalCustomers: number;
  byPlan: Record<string, number>;
  revenue: Record<string, number>;
  paymentsCount: number;
}
