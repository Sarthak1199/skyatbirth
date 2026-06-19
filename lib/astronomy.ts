// Star/moon math ported from bornhere-landing-proto.html — core math unchanged

export const STARS = [
  ["Betelgeuse", 5.9195, 7.407, 0.42],
  ["Rigel", 5.2423, -8.202, 0.18],
  ["Bellatrix", 5.4188, 6.35, 1.64],
  ["Mintaka", 5.5334, -0.299, 2.23],
  ["Alnilam", 5.6036, -1.202, 1.69],
  ["Alnitak", 5.6793, -1.943, 1.74],
  ["Saiph", 5.7959, -9.67, 2.07],
  ["Sirius", 6.7525, -16.716, -1.46],
  ["Adhara", 6.9771, -28.972, 1.5],
  ["Wezen", 7.1397, -26.393, 1.83],
  ["Mirzam", 6.3782, -17.956, 1.98],
  ["Aldebaran", 4.5987, 16.509, 0.86],
  ["Elnath", 5.4382, 28.608, 1.65],
  ["Castor", 7.5766, 31.888, 1.58],
  ["Pollux", 7.7553, 28.026, 1.14],
  ["Regulus", 10.1395, 11.967, 1.4],
  ["Denebola", 11.8177, 14.572, 2.14],
  ["Algieba", 10.332, 19.842, 2.28],
  ["Dubhe", 11.0621, 61.751, 1.79],
  ["Merak", 11.0307, 56.382, 2.37],
  ["Phecda", 11.8972, 53.695, 2.44],
  ["Megrez", 12.257, 57.033, 3.32],
  ["Alioth", 12.9005, 55.96, 1.77],
  ["Mizar", 13.3988, 54.925, 2.23],
  ["Alkaid", 13.7923, 49.313, 1.86],
  ["Schedar", 0.6751, 56.537, 2.24],
  ["Caph", 0.1529, 59.15, 2.28],
  ["GammaCas", 0.9456, 60.717, 2.47],
  ["Ruchbah", 1.4303, 60.235, 2.68],
  ["Segin", 1.9067, 63.67, 3.38],
  ["Polaris", 2.5303, 89.264, 1.98],
  ["Kochab", 14.8451, 74.155, 2.07],
  ["Capella", 5.2782, 45.998, 0.08],
  ["Antares", 16.4901, -26.432, 0.96],
  ["Shaula", 17.5601, -37.104, 1.62],
  ["Procyon", 7.655, 5.225, 0.34],
  ["Spica", 13.4199, -11.161, 0.97],
  ["Arcturus", 14.261, 19.182, -0.05],
  ["Vega", 18.6156, 38.784, 0.03],
  ["Deneb", 20.6905, 45.28, 1.25],
  ["Altair", 19.8464, 8.868, 0.76],
  ["Fomalhaut", 22.9608, -29.622, 1.16],
  ["Achernar", 1.6286, -57.237, 0.46],
  ["Acrux", 12.4433, -63.099, 0.76],
  ["Mimosa", 12.7953, -59.689, 1.25],
  ["Hadar", 14.0637, -60.373, 0.61],
  ["Rigil Kentaurus", 14.6600, -60.835, -0.27],
] as const;

export const CONSTELLATION_LINES: [string, string][] = [
  ["Betelgeuse", "Bellatrix"],
  ["Bellatrix", "Mintaka"],
  ["Mintaka", "Alnilam"],
  ["Alnilam", "Alnitak"],
  ["Alnitak", "Saiph"],
  ["Betelgeuse", "Alnitak"],
  ["Rigel", "Mintaka"],
  ["Sirius", "Mirzam"],
  ["Sirius", "Adhara"],
  ["Adhara", "Wezen"],
  ["Castor", "Pollux"],
  ["Regulus", "Algieba"],
  ["Algieba", "Denebola"],
  ["Dubhe", "Merak"],
  ["Merak", "Phecda"],
  ["Phecda", "Megrez"],
  ["Megrez", "Dubhe"],
  ["Megrez", "Alioth"],
  ["Alioth", "Mizar"],
  ["Mizar", "Alkaid"],
  ["Schedar", "Caph"],
  ["Schedar", "GammaCas"],
  ["GammaCas", "Ruchbah"],
  ["Ruchbah", "Segin"],
  ["Antares", "Shaula"],
  ["Vega", "Deneb"],
  ["Deneb", "Altair"],
  ["Altair", "Vega"],
  ["Rigil Kentaurus", "Hadar"],
  ["Acrux", "Mimosa"],
];

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

function julianDate(y: number, m: number, d: number, hUT: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hUT / 24;
}

function gmstDeg(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let g = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  g = g % 360; if (g < 0) g += 360; return g;
}

function equatorialToHorizontal(raH: number, decD: number, latD: number, lstD: number) {
  const raD = raH * 15;
  let H = lstD - raD; H = ((H + 180) % 360 + 360) % 360 - 180;
  const Hr = toRad(H), decR = toRad(decD), latR = toRad(latD);
  const sinAlt = Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(Hr);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  let cosAz = (Math.sin(decR) - Math.sin(alt) * Math.sin(latR)) / (Math.cos(alt) * Math.cos(latR));
  cosAz = Math.max(-1, Math.min(1, cosAz));
  let az = Math.acos(cosAz);
  if (Math.sin(Hr) > 0) az = 2 * Math.PI - az;
  return { alt: toDeg(alt), az: toDeg(az) };
}

export interface StarPosition {
  name: string;
  x: number;
  y: number;
  mag: number;
}

export interface MoonData {
  phaseName: string;
  illumination: number;
  frac: number;
}

export interface SkyData {
  stars: StarPosition[];
  lines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  moon: MoonData;
}

export function computeSky(
  lat: number, lon: number,
  y: number, m: number, d: number,
  utcOffsetH: number,
  birthHour = 22 // default to 10pm local if no time given
): SkyData {
  const hourUT = birthHour - utcOffsetH;
  const jd = julianDate(y, m, d, hourUT);
  const lst = (gmstDeg(jd) + lon + 360) % 360;
  const cx = 150, cy = 150, R = 130;

  const pos: Record<string, StarPosition> = {};
  for (const [name, ra, dec, mag] of STARS) {
    const h = equatorialToHorizontal(ra as number, dec as number, lat, lst);
    if (h.alt > 0) {
      const r = (90 - h.alt) / 90 * R;
      const a = toRad(h.az);
      pos[name as string] = {
        name: name as string,
        x: cx + r * Math.sin(a),
        y: cy - r * Math.cos(a),
        mag: mag as number,
      };
    }
  }

  const lines: SkyData["lines"] = [];
  for (const [a, b] of CONSTELLATION_LINES) {
    if (pos[a] && pos[b]) {
      lines.push({ x1: pos[a].x, y1: pos[a].y, x2: pos[b].x, y2: pos[b].y });
    }
  }

  // Moon phase
  const synMonth = 29.530588853, newMoonJD = 2451550.1;
  let days = (jd - newMoonJD) % synMonth; if (days < 0) days += synMonth;
  const frac = days / synMonth;
  const illum = (1 - Math.cos(2 * Math.PI * frac)) / 2 * 100;

  let phaseName: string;
  if (frac < 0.03 || frac > 0.97) phaseName = "New Moon";
  else if (frac < 0.25) phaseName = "Waxing Crescent";
  else if (frac < 0.27) phaseName = "First Quarter";
  else if (frac < 0.5) phaseName = "Waxing Gibbous";
  else if (frac < 0.53) phaseName = "Full Moon";
  else if (frac < 0.75) phaseName = "Waning Gibbous";
  else if (frac < 0.77) phaseName = "Last Quarter";
  else phaseName = "Waning Crescent";

  return { stars: Object.values(pos), lines, moon: { phaseName, illumination: Math.round(illum), frac } };
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatOrdinalDate(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = dt.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const month = dt.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return `${weekday}, the ${ordinal(d)} of ${month}, ${y}`;
}

export function getZodiacSign(month: number, day: number): { sign: string; symbol: string } {
  const z = [
    { sign: "Capricorn", symbol: "♑" },
    { sign: "Aquarius", symbol: "♒" },
    { sign: "Pisces", symbol: "♓" },
    { sign: "Aries", symbol: "♈" },
    { sign: "Taurus", symbol: "♉" },
    { sign: "Gemini", symbol: "♊" },
    { sign: "Cancer", symbol: "♋" },
    { sign: "Leo", symbol: "♌" },
    { sign: "Virgo", symbol: "♍" },
    { sign: "Libra", symbol: "♎" },
    { sign: "Scorpio", symbol: "♏" },
    { sign: "Sagittarius", symbol: "♐" },
  ];
  const cutoffs = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
  const idx = day <= cutoffs[month - 1] ? (month - 1) : month % 12;
  return z[idx];
}
