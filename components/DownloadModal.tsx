"use client";
import { useState } from "react";

interface Props {
  onClose: () => void;
  certificateName: string;
}

export default function DownloadModal({ onClose, certificateName }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [step, setStep] = useState<"form" | "loading" | "done" | "error">("form");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");
    try {
      const res = await fetch("/api/softcopy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, certificateName }),
      });
      if (!res.ok) throw new Error("Failed");
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
      <div className="relative w-full max-w-[420px] border border-brass p-10"
        style={{ background: "var(--void-2)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 opacity-40 hover:opacity-100"
          style={{ color: "var(--starlight)", fontFamily: "EB Garamond, serif", fontSize: 18 }}>✕</button>

        {step === "form" && (
          <>
            <p className="font-fraunces text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--brass)" }}>
              Digital Certificate
            </p>
            <h2 className="font-fraunces font-semibold text-[22px] mb-1" style={{ color: "var(--starlight)" }}>
              Get the soft copy
            </h2>
            <p className="mb-6" style={{ fontFamily: "EB Garamond, serif", fontSize: 16, opacity: 0.7, lineHeight: 1.5 }}>
              We&apos;ll email you a high-resolution PDF within 24 hours. ₹599.
            </p>
            <form onSubmit={handleSubmit} className="grid gap-4">
              {[
                { label: "Name", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email", required: true },
                { label: "Phone (for UPI payment confirmation)", key: "phone", type: "tel", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="block font-fraunces text-[10px] tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--brass)" }}>{label}</label>
                  <input type={type} required={required}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-transparent outline-none py-2 px-0.5 text-[16px]"
                    style={{ borderBottom: "1px solid var(--brass)", color: "var(--starlight)", fontFamily: "EB Garamond, serif" }} />
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(173,138,77,0.25)", paddingTop: 16, marginTop: 4 }}>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
                  Pay ₹599 via UPI to <strong>guptasarthak10@okhdfcbank</strong> and share the screenshot on WhatsApp or email.
                </p>
                <button type="submit"
                  className="w-full font-fraunces text-[11.5px] tracking-[0.2em] uppercase py-[15px] cursor-pointer"
                  style={{ background: "var(--oxblood)", color: "var(--starlight)", border: "1px solid var(--oxblood)" }}>
                  Send My Details →
                </button>
              </div>
            </form>
          </>
        )}

        {step === "loading" && (
          <p className="font-fraunces text-center text-[13px] opacity-60 py-8" style={{ color: "var(--brass)" }}>Saving…</p>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <h2 className="font-fraunces font-semibold text-[22px] mb-4" style={{ color: "var(--starlight)" }}>
              Details received ✦
            </h2>
            <p style={{ fontFamily: "EB Garamond, serif", fontSize: 16, opacity: 0.75, lineHeight: 1.6 }}>
              Pay ₹599 to <strong style={{ color: "var(--brass)" }}>guptasarthak10@okhdfcbank</strong> via UPI,
              then send the screenshot to orders@skyatbirth.com. We&apos;ll email your PDF within 24 hours.
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="py-4">
            <p style={{ color: "#e88", marginBottom: 12 }}>{error}</p>
            <button onClick={() => setStep("form")} style={{ color: "var(--brass)", fontFamily: "EB Garamond, serif" }}>← Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}
