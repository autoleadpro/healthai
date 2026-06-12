import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Creates a PayOS payment link (VietQR — Vietnamese bank transfer via QR, zero gateway fee).
// Docs: https://payos.vn/docs

const PRICES_VND: Record<string, { amount: number; name: string }> = {
  pro: { amount: 199000, name: "HealthAI Pro 1 thang" },
  clinic: { amount: 1200000, name: "HealthAI Clinic 1 thang" },
};

export async function POST(request: NextRequest) {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    return NextResponse.json({ error: "PayOS not configured. Set PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY in .env.local" }, { status: 503 });
  }

  const { plan, customerId } = await request.json();
  const price = PRICES_VND[plan];
  if (!price) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const orderCode = Number(String(Date.now()).slice(-10));
  const returnUrl = `${origin}/pricing?status=success&plan=${plan}&customerId=${customerId || ""}&provider=payos`;
  const cancelUrl = `${origin}/pricing?status=cancelled`;

  // PayOS signature: HMAC-SHA256 over sorted key=value string
  const data = `amount=${price.amount}&cancelUrl=${cancelUrl}&description=${price.name}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const signature = crypto.createHmac("sha256", checksumKey).update(data).digest("hex");

  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "x-client-id": clientId,
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderCode,
      amount: price.amount,
      description: price.name,
      returnUrl,
      cancelUrl,
      signature,
    }),
  });

  const result = await res.json();
  if (result.code !== "00") {
    return NextResponse.json({ error: result.desc || "PayOS error" }, { status: 500 });
  }
  return NextResponse.json({ url: result.data.checkoutUrl });
}
