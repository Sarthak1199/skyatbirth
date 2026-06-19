"use client";
import { useMemo, useId } from "react";
import { computeSky, getZodiacSign } from "@/lib/astronomy";

interface Props {
  lat: number;
  lon: number;
  year: number;
  month: number;
  day: number;
  utcOffsetH: number;
  birthHour?: number;
}

const CX = 150, CY = 150, R = 130;
const MOON_R = 38;

export default function Astrolabe({ lat, lon, year, month, day, utcOffsetH, birthHour }: Props) {
  const uid = useId().replace(/:/g, "");
  const { stars, lines, moon } = useMemo(
    () => computeSky(lat, lon, year, month, day, utcOffsetH, birthHour),
    [lat, lon, year, month, day, utcOffsetH, birthHour]
  );
  const zodiac = useMemo(() => getZodiacSign(month, day), [month, day]);

  // Tick marks around outer ring
  const ticks = useMemo(() => {
    const result = [];
    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * 2 * Math.PI - Math.PI / 2;
      const major = i % 6 === 0;
      const r1 = major ? R - 14 : R - 8;
      result.push({
        x1: CX + r1 * Math.cos(angle), y1: CY + r1 * Math.sin(angle),
        x2: CX + R * Math.cos(angle), y2: CY + R * Math.sin(angle),
        major,
      });
    }
    return result;
  }, []);

  // Moon crescent using clipPath + shadow overlay technique
  const moonCrescent = useMemo(() => {
    const { frac } = moon;
    const waxing = frac < 0.5;
    const actualFrac = waxing ? frac : 1 - frac; // 0=new → 0.5=full
    const terminatorRx = Math.abs(Math.cos(actualFrac * Math.PI * 2)) * MOON_R;
    const isGibbous = actualFrac > 0.25;
    const shadowLeft = waxing;
    const shadowRectX = shadowLeft ? CX - MOON_R : CX;
    const terminatorFill = isGibbous ? "#f0e8d0" : "#090e1e";
    return { shadowRectX, terminatorRx, terminatorFill, shadowLeft };
  }, [moon]);

  const starOpacity = (mag: number) => {
    if (mag < 0) return 1;
    if (mag < 1) return 0.95;
    if (mag < 2) return 0.78;
    if (mag < 3) return 0.58;
    return 0.38;
  };

  const starRadius = (mag: number) => Math.max(1, 3.8 - mag * 0.65);

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" style={{ display: "block" }}>
      <defs>
        {/* Sky mask — clips everything to inside the outer ring */}
        <clipPath id={`sky-${uid}`}>
          <circle cx={CX} cy={CY} r={R - 1} />
        </clipPath>
        {/* Moon mask */}
        <clipPath id={`moon-${uid}`}>
          <circle cx={CX} cy={CY} r={MOON_R} />
        </clipPath>
        {/* Star glow */}
        <filter id={`glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Bright star glow */}
        <filter id={`glow2-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial gradient for sky depth */}
        <radialGradient id={`skyGrad-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f1a35" />
          <stop offset="100%" stopColor="#050a18" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <circle cx={CX} cy={CY} r={R - 1} fill={`url(#skyGrad-${uid})`} />

      {/* Outer decorative rings */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ad8a4d" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={R - 18} fill="none" stroke="#ad8a4d" strokeWidth="0.4" opacity="0.3" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="#ad8a4d" strokeWidth={t.major ? 1 : 0.4} opacity={t.major ? 0.8 : 0.4} />
      ))}

      {/* Cardinal labels */}
      {[
        { label: "N", x: 150, y: 12 },
        { label: "S", x: 150, y: 291 },
        { label: "E", x: 289, y: 153 },
        { label: "W", x: 11, y: 153 },
      ].map(({ label, x, y }) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#ad8a4d" opacity="0.7">
          {label}
        </text>
      ))}

      {/* Constellation lines (clipped to sky) */}
      <g clipPath={`url(#sky-${uid})`}>
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#c4a05a" strokeWidth="0.7" opacity="0.45" />
        ))}

        {/* Stars */}
        {stars
          .filter(s => !(Math.abs(s.x - CX) < MOON_R + 6 && Math.abs(s.y - CY) < MOON_R + 6))
          .map((s, i) => {
            const bright = s.mag < 1;
            return (
              <circle key={i} cx={s.x} cy={s.y}
                r={starRadius(s.mag)}
                fill="#f0ead8"
                opacity={starOpacity(s.mag)}
                filter={bright ? `url(#glow2-${uid})` : `url(#glow-${uid})`}
              />
            );
          })}
      </g>

      {/* Moon frame */}
      <circle cx={CX} cy={CY} r={MOON_R + 6} fill="#050a18" />
      <circle cx={CX} cy={CY} r={MOON_R + 6} fill="none" stroke="#ad8a4d" strokeWidth="0.8" opacity="0.6" />
      <circle cx={CX} cy={CY} r={MOON_R + 3} fill="none" stroke="#ad8a4d" strokeWidth="0.3" opacity="0.3" />

      {/* Moon surface (bright base) */}
      <circle cx={CX} cy={CY} r={MOON_R} fill="#f0e8d0" />

      {/* Moon shadow overlay using clipPath */}
      <g clipPath={`url(#moon-${uid})`}>
        {/* Shadow half */}
        <rect
          x={moonCrescent.shadowRectX}
          y={CY - MOON_R}
          width={MOON_R}
          height={MOON_R * 2}
          fill="#090e1e"
        />
        {/* Terminator ellipse */}
        <ellipse
          cx={CX} cy={CY}
          rx={moonCrescent.terminatorRx}
          ry={MOON_R}
          fill={moonCrescent.terminatorFill}
        />
      </g>

      {/* Moon border */}
      <circle cx={CX} cy={CY} r={MOON_R} fill="none" stroke="#ad8a4d" strokeWidth="0.6" opacity="0.5" />

      {/* Moon phase label inside frame ring */}
      <text x={CX} y={CY + MOON_R + 14} textAnchor="middle"
        fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#ad8a4d" opacity="0.65">
        {moon.phaseName.toUpperCase()}
      </text>

      {/* Zodiac sign — bottom of chart */}
      <text x={CX} y={292} textAnchor="middle"
        fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ad8a4d" opacity="0.55">
        {zodiac.symbol} {zodiac.sign.toUpperCase()}
      </text>

      {/* If no stars visible, show a message */}
      {stars.length === 0 && (
        <text x={CX} y={CY - MOON_R - 20} textAnchor="middle"
          fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#ad8a4d" opacity="0.5">
          DAYTIME SKY
        </text>
      )}
    </svg>
  );
}

;
