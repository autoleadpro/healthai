import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the Google Apps Script backend.
// Keeps GAS_API_SECRET out of the browser; admin-only actions require the admin session header.

const ADMIN_ACTIONS = new Set([
  "listCustomers", "createCustomer", "updateCustomer", "deleteCustomer",
  "addCredits", "recordPayment", "listPayments", "stats",
  "listClinics", "createClinic", "updateClinic", "deleteClinic",
]);

export async function POST(request: NextRequest) {
  const gasUrl = process.env.GAS_URL;
  const secret = process.env.GAS_API_SECRET;
  if (!gasUrl || !secret) {
    return NextResponse.json({ error: "Backend not configured. Set GAS_URL and GAS_API_SECRET in .env.local" }, { status: 503 });
  }

  const body = await request.json();

  if (ADMIN_ACTIONS.has(body.action)) {
    const adminToken = request.headers.get("x-admin-token") || body.adminToken;
    if (adminToken !== process.env.ADMIN_SESSION_TOKEN) {
      return NextResponse.json({ error: "admin auth required" }, { status: 403 });
    }
    delete body.adminToken;
  }

  const res = await fetch(gasUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, secret }),
    redirect: "follow",
  });

  const data = await res.json();
  return NextResponse.json(data);
}
