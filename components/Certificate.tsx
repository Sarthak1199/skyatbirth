"use client";
import { Suspense, lazy } from "react";
import type { CertificateFacts } from "@/lib/facts";
import { getZodiacSign } from "@/lib/astronomy";

const ZODIAC_PATHS: Record<string, string> = {
  Aries:       "M12 20 Q12 10 8 8 M12 20 Q12 10 16 8 M8 14 Q12 16 16 14",
  Taurus:      "M8 12 Q12 7 16 12 M8 12 Q12 17 16 12 M10 8 L10 6 M14 8 L14 6",
  Gemini:      "M9 7 L9 21 M15 7 L15 21 M9 11 L15 11 M9 17 L15 17",
  Cancer:      "M7 13 Q12 8 17 13 M7 15 Q12 20 17 15 M7 13 A1.5 1.5 0 1 0 7 14 M17 15 A1.5 1.5 0 1 0 17 16",
  Leo:         "M8 18 Q8 8 14 8 Q18 8 18 13 Q18 18 12 18 M12 18 Q14 21 16 20",
  Virgo:       "M8 8 L8 18 M8 13 Q12 10 12 14 Q12 18 16 18 Q20 18 20 14",
  Libra:       "M7 15 L17 15 M12 15 L12 10 M7 10 Q12 7 17 10",
  Scorpio:     "M8 10 L8 18 Q12 21 16 18 L16 14 M8 10 Q10 7 12 10",
  Sagittarius: "M8 20 L18 10 M14 10 L18 10 L18 14",
  Capricorn:   "M8 16 Q8 8 12 8 Q16 8 16 12 Q16 16 12 18 Q8 20 8 20 L8 22",
  Aquarius:    "M7 12 Q9 9 12 12 Q15 15 17 12 M7 17 Q9 14 12 17 Q15 20 17 17",
  Pisces:      "M9 7 Q9 14 9 21 M15 7 Q15 14 15 21 M9 10 Q12 13 15 10 M9 18 Q12 15 15 18",
};

const Astrolabe = lazy(() => import("./Astrolabe"));

interface CertData {
  name: string;
  formattedDate: string;
  place: string;
  lat: number;
  lon: number;
  utcOffsetH: number;
  dob: string;
  time?: string;
  facts: CertificateFacts;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

export default function Certificate({ data, onDownload }: { data: CertData; onDownload?: () => void }) {
  const [y, m, d] = data.dob.split("-").map(Number);
  const { facts } = data;
  const zodiac = getZodiacSign(m, d);

  const birthHour = data.time
    ? parseInt(data.time.split(":")[0]) + parseInt(data.time.split(":")[1] ?? "0") / 60
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Certificate parchment */}
      <div className="relative w-full max-w-[580px]"
        style={{ background: "var(--parchment)", color: "var(--ink)", border: "1px solid var(--brass)" }}>

        <div className="px-10 pt-10 pb-8" style={{ position: "relative" }}>

          {/* Header label */}
          <p className="text-center font-fraunces text-[9px] tracking-[0.32em] uppercase mb-5"
            style={{ color: "var(--brass-dark)" }}>
            A Certificate of Arrival
          </p>

          {/* Name + zodiac icon inline */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 4 }}>
            {ZODIAC_PATHS[zodiac.sign] && (
              <svg width="22" height="22" viewBox="6 6 16 16" fill="none" stroke="var(--brass-dark)"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
                <path d={ZODIAC_PATHS[zodiac.sign]} />
              </svg>
            )}
            <h1 className="font-fraunces font-semibold text-center"
              style={{ fontSize: "clamp(22px, 3.5vw, 32px)", lineHeight: 1.2, color: "var(--ink)", letterSpacing: "0.01em", margin: 0 }}>
              {data.name}
            </h1>
          </div>

          {/* Date line — no zodiac emoji */}
          <p className="text-center mb-5"
            style={{ fontFamily: "EB Garamond, serif", fontSize: "14px", opacity: 0.6, color: "var(--ink)" }}>
            {zodiac.sign} · {data.formattedDate}
          </p>

          {/* Place */}
          <p className="text-center mb-6"
            style={{ fontFamily: "EB Garamond, serif", fontSize: "13px", opacity: 0.55, color: "var(--ink)" }}>
            {data.place}
          </p>

          {/* Astrolabe */}
          <div className="flex flex-col items-center mb-2">
            <Suspense fallback={
              <div style={{ width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="font-fraunces text-[9px] tracking-widest uppercase" style={{ color: "var(--brass-dark)", opacity: 0.5 }}>
                  charting the sky…
                </span>
              </div>
            }>
              <Astrolabe
                lat={data.lat} lon={data.lon}
                year={y} month={m} day={d}
                utcOffsetH={data.utcOffsetH}
                birthHour={birthHour}
              />
            </Suspense>

            <div className="text-center mt-1">
              <span className="block font-fraunces text-[9px] tracking-[0.2em] uppercase"
                style={{ color: "var(--brass-dark)", opacity: 0.7 }}>
                Sky at Birth
              </span>
              <span className="block text-[8px] tracking-[0.1em] mt-0.5"
                style={{ fontFamily: "EB Garamond, serif", color: "var(--ink)", opacity: 0.45 }}>
                {Math.abs(data.lat).toFixed(2)}°{data.lat >= 0 ? "N" : "S"}{" "}
                {Math.abs(data.lon).toFixed(2)}°{data.lon >= 0 ? "E" : "W"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <Divider label="The World That Day" />

          {/* Fact rows */}
          <Row label="NO. 1 SONG"
            value={facts.song
              ? <><span style={{ fontSize: 15, fontFamily: "EB Garamond, serif" }}>&ldquo;{facts.song.title}&rdquo;</span><Meta>{facts.song.artist}</Meta></>
              : <Unavailable />} />

          <Row label="THAT DAY"
            value={facts.headline
              ? <span style={{ fontSize: 14, fontFamily: "EB Garamond, serif", lineHeight: 1.5 }}>{facts.headline}</span>
              : <Unavailable />} />

          <Row label="BORN ALONGSIDE"
            value={facts.bornAlongside
              ? <span style={{ fontSize: 14, fontFamily: "EB Garamond, serif" }}>{facts.bornAlongside}</span>
              : <Unavailable />} />

          <Row label="SKY THAT DAY"
            value={facts.weather
              ? <><span style={{ fontSize: 15, fontFamily: "EB Garamond, serif" }}>{facts.weather.condition}, {facts.weather.tempC}°C</span><Meta>{facts.weather.wind}</Meta></>
              : <Unavailable />} />

          <Row label="TOP BOLLYWOOD FILM"
            value={facts.bollywood
              ? <><span style={{ fontSize: 15, fontFamily: "EB Garamond, serif" }}>{facts.bollywood.title}</span><Meta>{facts.bollywood.year}</Meta></>
              : <Unavailable />} />

          <Row label="GOLD (24K)"
            value={facts.goldPrice
              ? <><span style={{ fontSize: 15, fontFamily: "EB Garamond, serif" }}>₹{fmt(facts.goldPrice.inrPerGram, 0)} per gram</span></>
              : <Unavailable />} />

          <Row label="USD → INR"
            value={facts.exchangeRate
              ? <><span style={{ fontSize: 15, fontFamily: "EB Garamond, serif" }}>₹{fmt(facts.exchangeRate.inrPerUsd)} = 1 US Dollar</span>{facts.exchangeRate.annual && <Meta>annual average</Meta>}</>
              : <Unavailable />} />

          {/* Footer inside parchment */}
          <p className="text-center font-fraunces mt-7"
            style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.35, color: "var(--ink)" }}>
            Issued by skyatbirth.com
          </p>
        </div>
      </div>

      {/* Download link — outside parchment */}
      {onDownload && (
        <button onClick={onDownload}
          style={{
            background: "none", border: "none", cursor: "pointer", marginTop: 14,
            fontFamily: "EB Garamond, serif", fontSize: 14, color: "var(--brass)",
            opacity: 0.8, letterSpacing: "0.04em", textDecoration: "underline",
            textUnderlineOffset: 3,
          }}>
          Download digital copy (₹599)
        </button>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "block", fontSize: 12, fontStyle: "italic", fontFamily: "EB Garamond, serif", opacity: 0.6, marginTop: 2 }}>
      {children}
    </span>
  );
}

function Unavailable() {
  return <span style={{ fontSize: 13, fontStyle: "italic", fontFamily: "EB Garamond, serif", opacity: 0.35 }}>data unavailable</span>;
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: "var(--brass)", opacity: 0.4 }} />
      <span className="font-fraunces" style={{ fontSize: 9, fontStyle: "italic", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--brass-dark)", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--brass)", opacity: 0.4 }} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "110px 1fr", gap: "10px",
      padding: "11px 0", borderBottom: "1px solid rgba(173,138,77,0.25)", alignItems: "start",
    }}>
      <div className="font-fraunces" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--brass-dark)", paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.4, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}
