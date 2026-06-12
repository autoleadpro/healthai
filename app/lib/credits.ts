"use client";
import { backend } from "./api";

// Deducts one AI credit for the logged-in portal customer.
// Returns true if the AI call may proceed (also true when not in portal context — personal/demo use).
export async function consumeCredit(detail: string): Promise<{ ok: boolean; message?: string }> {
  const raw = typeof window !== "undefined" ? localStorage.getItem("portal-customer") : null;
  if (!raw) return { ok: true };
  try {
    const customer = JSON.parse(raw);
    const res = await backend<{ ok: boolean; error?: string; aiCredits?: number | string }>("useCredit", {
      customerId: customer.id,
      detail,
    });
    if (res.ok === false && res.error === "no_credits") {
      return { ok: false, message: "no_credits" };
    }
    return { ok: true };
  } catch {
    // Backend unreachable — don't block the user, log nothing
    return { ok: true };
  }
}
