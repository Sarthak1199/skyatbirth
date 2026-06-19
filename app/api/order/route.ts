import { NextRequest, NextResponse } from "next/server";
import { appendOrderToSheet } from "@/lib/sheets";
import { sendFulfillmentEmail } from "@/lib/email";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { certificateData, shippingAddress, email, phone } = body;

    if (!certificateData || !shippingAddress || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = `BH-${nanoid(8).toUpperCase()}`;

    // Fire and forget — don't block the response on external services
    appendOrderToSheet({
      id: orderId,
      name: certificateData.name,
      dob: certificateData.dob,
      place: certificateData.place,
      email,
      phone: phone || "",
      address: shippingAddress,
      amount: 999,
      status: "pending_payment",
      razorpayLinkId: "",
      createdAt: new Date().toISOString(),
    }).catch(e => console.error("sheets error:", e));

    // Notify founder (optional — skipped if RESEND_API_KEY not set)
    sendFulfillmentEmail({
      id: orderId,
      name: certificateData.name,
      dob: certificateData.dob,
      time: certificateData.time || "",
      place: certificateData.place,
      email,
      phone: phone || "",
      address: shippingAddress,
    }).catch(e => console.error("email error:", e));

    return NextResponse.json({ orderId });
  } catch (err: any) {
    console.error("order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
