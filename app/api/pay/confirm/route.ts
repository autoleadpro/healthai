import { NextRequest, NextResponse } from "next/server";

// Records a completed payment into Google Sheets and activates the plan.
// V1 uses return-URL confirmation; production should add Stripe/PayOS webhooks for stronger guarantees.

const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
  stripe: { pro: 7.99, clinic: 49 },
  payos: { pro: 199000, clinic: 1200000 },
};

export async function POST(request: NextRequest) {
  const gasUrl = process.env.GAS_URL;
  const secret = process.env.GAS_API_SECRET;
  if (!gasUrl || !secret) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  }

  const { customerId, plan, provider } = await request.json();
  if (!customerId || !plan || !PLAN_AMOUNTS[provider]?.[plan]) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const res = await fetch(gasUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      action: "recordPayment",
      data: {
        customerId,
        provider,
        amount: PLAN_AMOUNTS[provider][plan],
        currency: provider === "payos" ? "VND" : "USD",
        plan,
        months: 1,
        status: "completed",
      },
    }),
    redirect: "follow",
  });

  return NextResponse.json(await res.json());
}
