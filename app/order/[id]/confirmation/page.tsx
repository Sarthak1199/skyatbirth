import StarField from "@/components/StarField";

interface Props {
  params: { id: string };
  searchParams: { razorpay_payment_id?: string; razorpay_payment_link_id?: string };
}

export default function ConfirmationPage({ params, searchParams }: Props) {
  const paid = !!searchParams.razorpay_payment_id;

  return (
    <>
      <StarField />

      <header style={{ display: "flex", alignItems: "center", gap: "9px", padding: "28px 20px 0", maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <svg width="26" height="26" viewBox="0 0 40 40" style={{ color: "var(--brass)", flexShrink: 0 }}>
          <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
          <line x1="20" y1="3" x2="20" y2="9" stroke="currentColor" strokeWidth="1.2" />
          <line x1="20" y1="31" x2="20" y2="37" stroke="currentColor" strokeWidth="1.2" />
          <line x1="3" y1="20" x2="9" y2="20" stroke="currentColor" strokeWidth="1.2" />
          <line x1="31" y1="20" x2="37" y2="20" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="font-fraunces font-semibold text-[18px] tracking-[0.02em]">BornHere</span>
      </header>

      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 20px", position: "relative", zIndex: 1, textAlign: "center" }}>
        {paid ? (
          <>
            <div style={{ marginBottom: "32px" }}>
              <svg viewBox="0 0 60 60" width="60" height="60" style={{ display: "block", margin: "0 auto 20px", color: "var(--brass)" }}>
                <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M18 31l8 8 16-16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--brass)" }}>
              Order confirmed
            </p>
            <h1 className="font-fraunces font-semibold mb-4" style={{ fontSize: "clamp(28px,5vw,40px)", lineHeight: 1.2 }}>
              It&apos;s going to print.
            </h1>
            <p className="italic text-[18px] mb-6 opacity-80" style={{ maxWidth: "420px", margin: "0 auto 24px", lineHeight: 1.6 }}>
              We print each certificate by hand on 200GSM matte paper and ship it in a protective mailer.
            </p>

            <div style={{ border: "1px solid var(--brass)", padding: "32px", marginBottom: "40px" }}>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--brass-dark)" }}>
                Delivery estimate
              </p>
              <p className="font-fraunces text-[22px] mb-2">5–7 working days</p>
              <p className="text-[15px] opacity-60">You&apos;ll receive an email when it ships.</p>
            </div>

            <p className="font-mono text-[10px] tracking-[0.14em] uppercase opacity-40">
              Order reference: {params.id}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-fraunces font-semibold text-[32px] mb-4">Something went wrong</h1>
            <p className="text-[17px] italic opacity-70 mb-6">
              Payment may not have completed. Please check your email or try again.
            </p>
            <a href="/" className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--brass)" }}>
              ← Back to home
            </a>
          </>
        )}
      </main>

      <footer className="text-center font-mono text-[9.5px] tracking-[0.12em] uppercase pb-[34px] opacity-40">
        bornhere.in
      </footer>
    </>
  );
}
