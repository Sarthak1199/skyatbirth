// Razorpay webhook — not used in v1 (manual payment flow)
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true });
}
