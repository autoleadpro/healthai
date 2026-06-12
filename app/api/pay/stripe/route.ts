import { NextRequest, NextResponse } from "next/server";

// Creates a Stripe Checkout session (international cards, Apple/Google Pay).
// Uses the REST API directly — no SDK dependency.

const PRICES_USD: Record<string, { amount: number; name: string }> = {
  pro: { amount: 799, name: "HealthAI Pro — 1 month" },
  clinic: { amount: 4900, name: "HealthAI Clinic — 1 month" },
};

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env.local" }, { status: 503 });
  }

  const { plan, customerId, email } = await request.json();
  const price = PRICES_USD[plan];
  if (!price) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": price.name,
    "line_items[0][price_data][unit_amount]": String(price.amount),
    "line_items[0][quantity]": "1",
    success_url: `${origin}/pricing?status=success&plan=${plan}&customerId=${customerId || ""}&provider=stripe`,
    cancel_url: `${origin}/pricing?status=cancelled`,
    "metadata[customerId]": customerId || "",
    "metadata[plan]": plan,
  });
  if (email) params.set("customer_email", email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: session.error?.message || "Stripe error" }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
