import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, token: process.env.ADMIN_SESSION_TOKEN });
}
