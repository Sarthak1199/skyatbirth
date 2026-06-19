import { NextRequest, NextResponse } from "next/server";
import { appendOrderToSheet } from "@/lib/sheets";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, certificateName } = body;
    const id = `SC-${nanoid(8).toUpperCase()}`;
    // Log to same sheet, different status
    await appendOrderToSheet({
      id, name, dob: certificateName || "", place: "Digital", email,
      phone: phone || "", address: "Email delivery", amount: 599,
      status: "softcopy_pending", razorpayLinkId: "", createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    // Don't fail the user if sheets errors
    console.error("softcopy error:", err);
    return NextResponse.json({ ok: true });
  }
}
