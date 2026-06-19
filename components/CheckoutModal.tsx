"use client";
import { useState } from "react";

interface Props {
  certificateData: Record<string, unknown>;
  onClose: () => void;
}

export default function CheckoutModal({ certificateData, onClose }: Props) {
  const [step, setStep] = useState<"address" | "loading" | "done" | "error">("address");
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");
    setError("");

    const address = [form.line1, form.line2, form.city, form.state, form.pincode]
      .filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateData, shippingAddress: address, email: form.email, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderId(data.orderId);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,16,36,0.88)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-[480px] border border-brass p-10"
        style={{ background: "var(--void-2)", maxHeight: "90vh", overflowY: "auto" }}>

        <button onClick={onClose}
          className="absolute top-4 right-4 font-mono text-[11px] tracking-widest uppercase opacity-50 hover:opacity-100"
          style={{ color: "var(--starlight)" }}>✕</button>

        {step === "address" && (
          <>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--brass)" }}>
              Frame-ready print
            </p>
            <h2 className="font-fraunces font-semibold text-[22px] mb-1" style={{ color: "var(--starlight)" }}>
              A4 · 200GSM matte
            </h2>
            <p className="font-fraunces text-[26px] mb-6" style={{ color: "var(--starlight)" }}>
              ₹999{" "}
              <span className="font-mono text-[10px] tracking-widest uppercase opacity-60 align-middle">
                incl. delivery
              </span>
            </p>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
              <Field label="Phone" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              <Field label="Address line 1" value={form.line1} onChange={v => setForm(f => ({ ...f, line1: v }))} required />
              <Field label="Flat / area / landmark" value={form.line2} onChange={v => setForm(f => ({ ...f, line2: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} required />
                <Field label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} required />
              </div>
              <Field label="PIN code" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} required />
              <button type="submit"
                className="w-full mt-2 font-mono text-[11px] tracking-[0.18em] uppercase py-[14px] cursor-pointer transition-colors"
                style={{ background: "#B8860B", color: "#fff", border: "1.5px solid #B8860B", marginTop: "6px", borderRadius: 6, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#8a6408")}
                onMouseLeave={e => (e.currentTarget.style.background = "#B8860B")}>
                Place Order →
              </button>
            </form>
          </>
        )}

        {step === "loading" && (
          <p className="font-mono text-[12px] tracking-widest uppercase text-center opacity-60 py-8"
            style={{ color: "var(--brass)" }}>Saving your order…</p>
        )}

        {step === "error" && (
          <div className="py-4">
            <p className="text-[15px] mb-4" style={{ color: "#e88" }}>{error}</p>
            <button onClick={() => setStep("address")}
              className="font-mono text-[11px] tracking-widest uppercase underline"
              style={{ color: "var(--brass)" }}>← Try again</button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="mb-6" style={{ color: "var(--brass)" }}>
              <svg viewBox="0 0 60 60" width="52" height="52" style={{ display: "block", margin: "0 auto" }}>
                <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M18 31l8 8 16-16" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-fraunces font-semibold text-[22px] mb-3" style={{ color: "var(--starlight)" }}>
              Order received ✦
            </h2>
            <p className="text-[15px] opacity-75 mb-6" style={{ lineHeight: 1.6 }}>
              Pay ₹999 via UPI to complete your order:
            </p>

            <div className="border border-brass p-5 mb-6 text-left">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--brass-dark)" }}>
                UPI ID
              </p>
              <p className="font-fraunces text-[20px]" style={{ color: "var(--starlight)" }}>
                guptasarthak10@okhdfcbank
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase mt-3 opacity-50">
                Amount: ₹999 · Ref: {orderId}
              </p>
            </div>

            <p className="text-[13px] opacity-60" style={{ lineHeight: 1.6 }}>
              Once we confirm payment we&apos;ll print and ship within 5–7 working days.
              Send your payment screenshot to{" "}
              <span style={{ color: "var(--brass)" }}>orders@bornhere.in</span>{" "}
              with your order ID.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-1.5"
        style={{ color: "var(--brass)" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-transparent outline-none py-2 px-0.5 text-[16px]"
        style={{ borderBottom: "1px solid var(--brass)", color: "var(--starlight)", fontFamily: "'EB Garamond', serif" }} />
    </div>
  );
}
