"use client";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import StarField from "@/components/StarField";

const FUN_FACTS = [
  "Every atom in your body was forged inside a dying star.",
  "Light from stars you see tonight left them years — sometimes centuries — ago.",
  "The Milky Way contains an estimated 100–400 billion stars.",
  "A billion seconds ago, it was 1993. A billion minutes ago, Rome was still rising.",
  "The human eye can detect a single candle flame from 48 km away on a clear night.",
  "Neptune's winds reach 2,100 km/h — the fastest in the solar system.",
  "There are more possible chess games than atoms in the observable universe.",
  "On the night you were born, every star in this map was exactly where it appears.",
  "Saturn's rings would fit between Earth and the Moon.",
  "The Voyager 1 probe, launched in 1977, is still sending data from 23 billion km away.",
];

const REVIEWS = [
  { initials: "RA", name: "Rohan Agarwal", location: "Bengaluru", photo: null as string | null, text: "Framed it for my dad's 60th. He cried. The headline from the day he was born was spot on — I had no idea that event happened." },
  { initials: "MK", name: "Meera Kapoor", location: "Mumbai", photo: null as string | null, text: "Got this for my best friend's birthday. She's kept it on her desk at work. Way more personal than any other gift I've given." },
  { initials: "SP", name: "Siddharth Patel", location: "Delhi", photo: null as string | null, text: "The star map is stunning. Never thought a piece of paper could feel this meaningful." },
];

function useFunFact(active: boolean) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % FUN_FACTS.length);
        setFade(true);
      }, 400);
    }, 2800);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active]);

  return { fact: FUN_FACTS[idx], fade };
}

const Certificate = lazy(() => import("@/components/Certificate"));
const CheckoutModal = lazy(() => import("@/components/CheckoutModal"));
const DownloadModal = lazy(() => import("@/components/DownloadModal"));

interface CertData {
  name: string;
  formattedDate: string;
  place: string;
  lat: number;
  lon: number;
  utcOffsetH: number;
  dob: string;
  facts: Record<string, unknown>;
  [key: string]: unknown;
}

export default function Home() {
  const [form, setForm] = useState({ name: "", dob: "", time: "", place: "" });
  const [certData, setCertData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const { fact, fade } = useFunFact(loading);

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate certificate");
      setCertData(data);
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StarField />

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 20px 0", maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <StarburstIcon size={30} color="var(--brass)" />
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 17, letterSpacing: "0.06em", color: "var(--starlight)" }}>
            sky<span style={{ opacity: 0.45 }}>·</span>at<span style={{ opacity: 0.45 }}>·</span>birth
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "60px 0 44px" }}>
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-[18px]" style={{ color: "var(--brass)" }}>
            A keepsake, not a gift card
          </p>
          <h1 className="font-fraunces font-semibold mb-[18px]"
            style={{ fontSize: "clamp(32px,6vw,50px)", lineHeight: 1.14 }}>
            Give them the sky<br />the day they arrived.
          </h1>
          <p className="italic text-[18px] mb-[38px] mx-auto opacity-[0.78]"
            style={{ maxWidth: "460px", lineHeight: 1.55 }}>
            Stop gifting chocolates and flowers. Recreate the real stars, the song, and the headline from the day someone you love was born.
          </p>

          <form onSubmit={handleReveal} style={{ display: "grid", gap: "18px", maxWidth: "420px", margin: "0 auto", textAlign: "left" }}>
            <FormField label="Name" id="name" type="text" value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Their name" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <FormField label="Date of birth" id="dob" type="date" value={form.dob}
                onChange={v => setForm(f => ({ ...f, dob: v }))} required />
              <FormField label="Time of birth" id="time" type="time" value={form.time}
                onChange={v => setForm(f => ({ ...f, time: v }))} />
            </div>
            <FormField label="Place of birth" id="place" type="text" value={form.place}
              onChange={v => setForm(f => ({ ...f, place: v }))} placeholder="City, Country" required />
            {error && (
              <p className="font-mono text-[11px] tracking-wide" style={{ color: "#e88" }}>{error}</p>
            )}
            <SealButton type="submit" wide disabled={loading}>
              {loading ? "Reading the stars…" : "Reveal Their Sky"}
            </SealButton>
          </form>
        </section>

        {/* Certificate Preview */}
        <section id="preview" style={{ position: "relative", margin: "18px 0 70px", display: "flex", justifyContent: "center" }}>
          {loading ? (
            <div style={{ width: "100%", maxWidth: "560px", minHeight: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ marginBottom: 32, animation: "spin 8s linear infinite" }}>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <circle cx="32" cy="32" r="30" fill="none" stroke="var(--brass)" strokeWidth="1" opacity="0.4" />
                <circle cx="32" cy="32" r="20" fill="none" stroke="var(--brass)" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.3" />
                <circle cx="32" cy="32" r="4" fill="var(--brass)" opacity="0.6" />
                <line x1="32" y1="2" x2="32" y2="10" stroke="var(--brass)" strokeWidth="1.2" opacity="0.7" />
                <line x1="32" y1="54" x2="32" y2="62" stroke="var(--brass)" strokeWidth="1.2" opacity="0.7" />
                <line x1="2" y1="32" x2="10" y2="32" stroke="var(--brass)" strokeWidth="1.2" opacity="0.7" />
                <line x1="54" y1="32" x2="62" y2="32" stroke="var(--brass)" strokeWidth="1.2" opacity="0.7" />
              </svg>
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-6" style={{ color: "var(--brass)", opacity: 0.7 }}>
                Reading the stars…
              </p>
              <p className="italic text-center"
                style={{
                  fontSize: 16, maxWidth: 380, lineHeight: 1.65, opacity: fade ? 0.75 : 0,
                  transition: "opacity 0.4s ease", color: "var(--starlight)",
                }}>
                {fact}
              </p>
            </div>
          ) : !certData ? (
            <div style={{ position: "relative", width: "100%", maxWidth: "560px" }}>
              <div style={{
                filter: "blur(10px)", pointerEvents: "none", userSelect: "none",
                background: "var(--parchment)", border: "1px solid var(--brass)",
                padding: "48px 40px 36px", color: "var(--ink)", position: "relative",
              }}>
                <p className="font-fraunces text-[11px] tracking-[0.28em] uppercase text-center mb-4" style={{ color: "var(--brass-dark)" }}>
                  A Certificate of Arrival
                </p>
                <h1 className="font-fraunces font-semibold text-[30px] text-center mb-1.5" style={{ color: "var(--ink)" }}>Your Name</h1>
                <p className="italic text-[15px] text-center opacity-70 mb-8" style={{ color: "var(--ink)" }}>
                  The day you arrived — Your city
                </p>
                <div className="w-[240px] h-[240px] mx-auto rounded-full border opacity-40" style={{ borderColor: "var(--brass)" }} />
                <div style={{ height: "200px" }} />
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-center" style={{ color: "var(--brass)" }}>
                  Enter details above to reveal ✦
                </p>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="w-full border border-brass opacity-20 h-[400px]" />}>
              <div style={{ animation: "fadeIn 0.5s ease", width: "100%" }}>
                <Certificate data={certData as any} onDownload={() => setShowDownload(true)} />
              </div>
            </Suspense>
          )}
        </section>

        {/* Pricing section — always visible */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "70px" }}
          className="max-[520px]:grid-cols-1">
          <PricingCard
            label="Digital copy"
            price="₹599"
            desc="High-res PDF delivered to your inbox within 24 hours"
            buttonLabel="Get Digital Copy"
            onOrder={() => setShowDownload(true)}
          />
          <PricingCard
            label="Framed print"
            price="₹999"
            desc="A4 · 200GSM matte · delivered to your door"
            buttonLabel="Order the Print"
            onOrder={() => certData ? setShowCheckout(true) : document.getElementById("name")?.focus()}
            highlighted
          />
        </section>

        {/* Use cases */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "70px" }}
          className="max-[520px]:grid-cols-1">
          <UseCase icon={<EyeIcon />} title="See for yourself"
            desc="Look up the exact sky, song, and headline from your own arrival." />
          <UseCase icon={<GiftIcon />} title="Gift it to someone"
            desc="A framed certificate that means more than another bouquet." />
        </section>

        {/* Reviews section */}
        <section style={{ marginBottom: "70px" }}>
          <Divider label="Trusted For Gifting" />
          <p className="font-fraunces text-[24px] mb-[28px] text-center">100+ keepsakes gifted so far</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
            className="max-[620px]:grid-cols-1">
            {REVIEWS.map(r => (
              <div key={r.name} style={{
                background: "var(--parchment)", border: "1px solid var(--brass)",
                padding: "24px 20px", color: "var(--ink)",
              }}>
                {/* Photo + name row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  {/* Avatar — 56px, prominent photo slot */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                    border: r.photo ? "2px solid var(--brass)" : "1.5px dashed rgba(173,138,77,0.5)",
                    flexShrink: 0, background: "rgba(173,138,77,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {r.photo
                      ? <img src={r.photo} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 15, fontFamily: "Fraunces, serif", color: "var(--brass-dark)", fontWeight: 600, letterSpacing: "0.02em" }}>{r.initials}</span>
                    }
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <p style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, margin: "0 0 2px", letterSpacing: "0.01em" }}>{r.name}</p>
                    <p style={{ fontFamily: "EB Garamond, serif", fontSize: 13, opacity: 0.5, margin: 0 }}>{r.location}</p>
                  </div>
                </div>
                {/* Opening quote mark */}
                <p style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--brass)", opacity: 0.4, margin: "0 0 -6px", lineHeight: 1 }}>&ldquo;</p>
                <p style={{ fontFamily: "EB Garamond, serif", fontSize: 15, lineHeight: 1.65, opacity: 0.82, margin: 0 }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </section>


      </main>

      <footer style={{ borderTop: "1px solid rgba(173,138,77,0.15)", padding: "48px 20px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 18 }}>
            <StarburstIcon size={22} color="var(--brass)" />
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: 16, letterSpacing: "0.06em", color: "var(--starlight)", opacity: 0.8 }}>
              sky<span style={{ opacity: 0.4 }}>·</span>at<span style={{ opacity: 0.4 }}>·</span>birth<span style={{ opacity: 0.4, fontSize: 13, marginLeft: 1 }}>.com</span>
            </span>
          </div>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: 15, opacity: 0.45, marginBottom: 20, lineHeight: 1.65 }}>
            Every star map is unique — just like the person it was made for.<br />
            Handcrafted in India.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 22, flexWrap: "wrap" }}>
            <a href="mailto:guptasarthak10@gmail.com"
              style={{ fontFamily: "EB Garamond, serif", fontSize: 14, opacity: 0.5, textDecoration: "none", color: "var(--starlight)" }}>
              guptasarthak10@gmail.com
            </a>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: 14, opacity: 0.3 }}>·</span>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: 14, opacity: 0.4 }}>Gift ideas</span>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: 14, opacity: 0.3 }}>·</span>
            <span style={{ fontFamily: "EB Garamond, serif", fontSize: 14, opacity: 0.4 }}>How it works</span>
          </div>
          <p style={{ fontFamily: "EB Garamond, serif", fontSize: 12, opacity: 0.25 }}>
            © {new Date().getFullYear()} skyatbirth.com · All rights reserved
          </p>
        </div>
      </footer>

      {showCheckout && certData && (
        <Suspense fallback={null}>
          <CheckoutModal certificateData={certData} onClose={() => setShowCheckout(false)} />
        </Suspense>
      )}

      {showDownload && (
        <Suspense fallback={null}>
          <DownloadModal certificateName={certData?.name || ""} onClose={() => setShowDownload(false)} />
        </Suspense>
      )}
    </>
  );
}

/* ── Sub-components ── */

function PricingCard({ label, price, desc, buttonLabel, onOrder, highlighted }: {
  label: string; price: string; desc: string; buttonLabel: string; onOrder: () => void; highlighted?: boolean;
}) {
  return (
    <div style={{
      background: highlighted ? "var(--parchment)" : "rgba(239,230,210,0.06)",
      border: highlighted ? `1.5px solid ${MUSTARD}` : "1px solid rgba(173,138,77,0.35)",
      padding: "28px 24px", textAlign: "center", color: highlighted ? "var(--ink)" : "var(--starlight)",
      position: "relative",
    }}>
      {highlighted && (
        <span style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          background: MUSTARD, color: "#fff", fontFamily: "EB Garamond, serif",
          fontSize: 11, letterSpacing: "0.14em", padding: "2px 12px", borderRadius: 4,
        }}>Most popular</span>
      )}
      <p className="font-fraunces text-[10px] tracking-[0.2em] uppercase mb-2"
        style={{ color: highlighted ? "var(--brass-dark)" : "var(--brass)", opacity: highlighted ? 1 : 0.7 }}>{label}</p>
      <p className="font-fraunces text-[32px] mb-1" style={{ color: highlighted ? "var(--ink)" : "var(--starlight)" }}>{price}</p>
      <p style={{ fontFamily: "EB Garamond, serif", fontSize: 13, opacity: 0.65, marginBottom: 20, lineHeight: 1.5 }}>{desc}</p>
      <SealButton wide onClick={onOrder} variant={highlighted ? "primary" : "secondary"}>{buttonLabel}</SealButton>
    </div>
  );
}

function PrintCard({ onOrder, orderLabel = "Order the Print" }: { onOrder: () => void; orderLabel?: string }) {
  return (
    <div style={{
      background: "var(--parchment)", border: "1px solid var(--brass)",
      padding: "40px 36px", textAlign: "center", maxWidth: "380px", color: "var(--ink)"
    }}>
      <div style={{ color: "var(--brass-dark)", margin: "0 auto 14px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" style={{ display: "block", margin: "0 auto" }}>
          <rect x="6" y="3" width="12" height="6" />
          <path d="M5 9h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2z" />
          <rect x="8" y="15" width="8" height="5" />
        </svg>
      </div>
      <h3 className="font-fraunces text-[22px] mb-2">Frame-ready print</h3>
      <p className="text-[15px] opacity-75 mb-0">A4 · 200GSM matte · delivered to your door</p>
      <p className="font-fraunces text-[30px] my-5">
        ₹999
        <span className="block font-mono text-[10px] tracking-[0.12em] uppercase opacity-60 mt-1">Incl. print + delivery</span>
      </p>
      <SealButton wide onClick={onOrder}>{orderLabel}</SealButton>
    </div>
  );
}

const MUSTARD = "#B8860B";
const MUSTARD_DARK = "#8a6408";

function SealButton({ children, wide, type = "button", disabled, onClick, variant = "primary" }: {
  children: React.ReactNode; wide?: boolean; type?: "button" | "submit";
  disabled?: boolean; onClick?: () => void; variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className="font-mono text-[11px] tracking-[0.18em] uppercase py-[14px] cursor-pointer transition-all disabled:opacity-40"
      style={{
        width: wide ? "100%" : "auto", paddingLeft: "32px", paddingRight: "32px",
        marginTop: wide ? "6px" : 0,
        background: isPrimary ? MUSTARD : "transparent",
        color: isPrimary ? "#fff" : MUSTARD,
        border: `1.5px solid ${MUSTARD}`,
        borderRadius: "6px",
        fontWeight: 600,
        letterSpacing: "0.18em",
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.background = isPrimary ? MUSTARD_DARK : "rgba(184,134,11,0.1)";
        e.currentTarget.style.borderColor = MUSTARD_DARK;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isPrimary ? MUSTARD : "transparent";
        e.currentTarget.style.borderColor = MUSTARD;
      }}>
      {children}
    </button>
  );
}

function StarburstIcon({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={{ flexShrink: 0, display: "block" }} aria-hidden>
      {/* 4-pointed star with thin diamond rays */}
      <path
        d="M14 1 L15.1 12.9 L28 14 L15.1 15.1 L14 27 L12.9 15.1 L0 14 L12.9 12.9 Z"
        fill={color}
      />
      {/* subtle diagonal rays, thinner */}
      <path
        d="M14 4 L14.5 13.5 L24 4 L14.5 14.5 L24 24 L13.5 14.5 L14 24 L13.5 13.5 L4 24 L13.5 13.5 L4 4 L14.5 13.5 Z"
        fill={color} opacity="0.2"
      />
      {/* center */}
      <circle cx="14" cy="14" r="1.6" fill={color} opacity="0.9" />
    </svg>
  );
}

function FormField({ label, id, type, value, onChange, placeholder, required }: {
  label: string; id: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[7px]"
        style={{ color: "var(--brass)" }}>{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-transparent outline-none py-2 px-0.5 text-[16px]"
        style={{
          borderBottom: "1px solid var(--brass)", color: "var(--starlight)",
          fontFamily: "'EB Garamond', serif",
        }}
      />
    </div>
  );
}

function UseCase({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center p-[18px]">
      <div style={{ color: "var(--brass)", margin: "0 auto 12px", display: "flex", justifyContent: "center" }}>{icon}</div>
      <h3 className="font-fraunces text-[20px] mb-2">{title}</h3>
      <p className="text-[15px] opacity-70 leading-[1.5]">{desc}</p>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "34px 0 18px" }}>
      <div style={{ flex: 1, height: "1px", background: "var(--brass)", opacity: 0.5 }} />
      <span className="font-mono text-[11px] tracking-[0.22em] uppercase whitespace-nowrap"
        style={{ color: "var(--brass-dark)" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "var(--brass)", opacity: 0.5 }} />
    </div>
  );
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="30" height="30">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
  </svg>;
}
function GiftIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="30" height="30">
    <rect x="3" y="9" width="18" height="11" /><line x1="3" y1="13" x2="21" y2="13" /><line x1="12" y1="9" x2="12" y2="20" />
    <path d="M12 9c-1.2-3-4-4.5-5.5-3S6 9 6 9" /><path d="M12 9c1.2-3 4-4.5 5.5-3S18 9 18 9" />
  </svg>;
}
