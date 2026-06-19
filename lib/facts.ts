export interface CertificateFacts {
  song: { title: string; artist: string } | null;
  headline: string | null;
  bollywood: { title: string; year: string } | null;
  bornAlongside: string | null;
  weather: { condition: string; tempC: number; wind: string } | null;
  exchangeRate: { inrPerUsd: number; annual?: boolean } | null;
  goldPrice: { inrPerGram: number } | null;
}

function fetchWithTimeout(url: string, options: RequestInit, ms = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchWithRetry(url: string, options: RequestInit, ms = 8000, retries = 4): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options, ms);
    } catch (e: any) {
      if (i === retries) throw e;
      if (e?.cause?.code === "ECONNRESET" || e?.name === "AbortError" || e?.cause?.code === "ECONNREFUSED") {
        await new Promise(r => setTimeout(r, 800 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("unreachable");
}

// In-memory cache for TMDB results — survives across requests in the same server process
const tmdbFilmCache = new Map<number, any[]>();

// ─── TMDB + iTunes — top Bollywood film and a song from its soundtrack ───────
// Tries up to 3 top films; picks the first whose iTunes catalog has era-matched tracks.
// vote_count threshold relaxed for older years where fewer ratings exist.
async function fetchBollywoodAndSong(dob: string): Promise<{
  bollywood: CertificateFacts["bollywood"];
  song: CertificateFacts["song"];
}> {
  try {
    const [y] = dob.split("-").map(Number);
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return { bollywood: null, song: null };

    const minVotes = y < 1970 ? 1 : y < 1990 ? 5 : y < 2000 ? 10 : 20;

    let films: any[] = tmdbFilmCache.get(y) ?? [];
    if (!films.length) {
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=hi&primary_release_year=${y}&sort_by=vote_count.desc&vote_count.gte=${minVotes}`;
      const res = await fetchWithRetry(url, {});
      if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
      const data = await res.json();
      films = (data.results ?? []).slice(0, 5);
      if (films.length) tmdbFilmCache.set(y, films);
    }
    if (!films.length) throw new Error("no films");

    const topFilm = { title: films[0].title as string, year: films[0].release_date?.slice(0, 4) as string };
    console.log("[facts] bollywood:", topFilm.title, topFilm.year);

    // Try each film in order until we find one with era-matching iTunes tracks
    for (const film of films) {
      const filmTitle = film.title as string;
      const filmYear = parseInt(film.release_date?.slice(0, 4) ?? String(y));
      try {
        const query = encodeURIComponent(filmTitle);
        const itunesUrl = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&country=in&limit=15&lang=en_us`;
        const itunesRes = await fetchWithRetry(itunesUrl, {});
        if (!itunesRes.ok) continue;
        const itunesData = await itunesRes.json();
        const tracks: any[] = itunesData.results ?? [];

        // Must be tagged Bollywood genre AND from within ±5 years of the film
        const BOLLYWOOD_GENRES = ["Bollywood", "Indian Pop", "Indian Classical", "Filmi", "Ghazals", "Devotional & Spiritual"];
        const yearTracks = tracks.filter(t => {
          const ry = t.releaseDate ? parseInt(t.releaseDate.slice(0, 4)) : 0;
          const isBollywood = BOLLYWOOD_GENRES.some(g => t.primaryGenreName?.includes(g));
          return isBollywood && Math.abs(ry - filmYear) <= 5;
        });
        if (!yearTracks.length) continue;

        console.log("[facts] song:", yearTracks[0].trackName, "from", filmTitle);
        return {
          bollywood: topFilm,
          song: { title: yearTracks[0].trackName as string, artist: yearTracks[0].artistName as string },
        };
      } catch { continue; }
    }

    // Return the top film even if no song found
    return { bollywood: topFilm, song: null };
  } catch (e) {
    console.error("[facts] bollywood/song error:", e);
    return { bollywood: null, song: null };
  }
}

// ─── Wikipedia On This Day (India-first, positive events only) ───────────────
const NEGATIVE_WORDS = [
  "kill", "killed", "killing", "kills", "murder", "murdered", "murderer",
  "death", "deaths", "dead", "die", "died", "dies", "dying",
  "crash", "crashes", "crashed", "disaster", "catastrophe", "tragedy", "tragic",
  "war", "warfare", "battle", "massacre", "bombing", "bombed", "bomb", "explosion",
  "attack", "attacked", "terrorist", "terrorism", "genocide", "holocaust",
  "assassin", "assassination", "assassinated", "execution", "executed",
  "sinking", "sank", "drowned", "drowning", "flood", "earthquake", "tsunami",
  "hurricane", "famine", "plague", "epidemic", "coup", "revolt", "riot",
  "collapse", "collapsed", "hostage", "kidnap", "shooting", "shot", "suicide",
];
function isNegative(text: string) {
  const l = text.toLowerCase();
  return NEGATIVE_WORDS.some(w => new RegExp(`\\b${w}\\b`).test(l));
}

async function fetchHeadline(dob: string): Promise<string | null> {
  try {
    const [y, m, d] = dob.split("-").map(Number);
    const res = await fetchWithTimeout(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${m}/${d}`,
      { headers: { "User-Agent": "SkyAtBirth/1.0 (skyatbirth.com)" } }
    );
    if (!res.ok) throw new Error("wikipedia failed");
    const { events = [] }: { events: any[] } = await res.json();

    const safe = events.filter(e => !isNegative(e.text ?? ""));
    if (!safe.length) return null;

    const INDIA_RE = /\bindia\b|\bindian\b|\bmumbai\b|\bdelhi\b|\bkolkata\b|\bchennai\b|\bbengaluru\b|\bhyderabad\b/i;
    const indiaEvents = safe.filter(e => INDIA_RE.test(e.text ?? ""));
    const pool = indiaEvents.length > 0 ? indiaEvents : safe;

    const pick = [...pool].sort((a, b) => Math.abs(a.year - y) - Math.abs(b.year - y))[0];
    console.log("[facts] headline:", pick.text?.slice(0, 80));
    return `${pick.text} (${pick.year})`;
  } catch (e) {
    console.error("[facts] headline error:", e);
    return null;
  }
}

// ─── Wikipedia births — India-first, then very famous international ──────────
const INDIA_PERSON_RE = /\bindian\b/i;

async function fetchBornAlongside(dob: string): Promise<string | null> {
  try {
    const [, m, d] = dob.split("-").map(Number);
    const res = await fetchWithTimeout(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${m}/${d}`,
      { headers: { "User-Agent": "SkyAtBirth/1.0 (skyatbirth.com)" } }
    );
    if (!res.ok) throw new Error("wiki births failed");
    const { births = [] }: { births: any[] } = await res.json();
    if (!births.length) return null;

    const withPhoto = births.filter(b => b.pages?.[0]?.thumbnail?.source);
    const pool = withPhoto.length >= 3 ? withPhoto : births;

    const indianPeople = pool.filter(b =>
      INDIA_PERSON_RE.test(b.pages?.[0]?.description ?? "")
    );

    const sortByFame = (arr: any[]) =>
      [...arr].sort((a, b) =>
        (b.pages?.[0]?.extract?.length ?? 0) - (a.pages?.[0]?.extract?.length ?? 0)
      );

    const sorted = indianPeople.length >= 2
      ? sortByFame(indianPeople)
      : sortByFame(pool);

    const names = sorted.slice(0, 5)
      .map(b => b.text?.split(",")[0]?.trim())
      .filter(Boolean).slice(0, 3);

    if (!names.length) return null;
    console.log("[facts] bornAlongside:", names);
    return `Shares this birthday with ${names.join(", ")}`;
  } catch (e) {
    console.error("[facts] bornAlongside error:", e);
    return null;
  }
}

// ─── Open-Meteo historical weather (available from 1940-01-01) ──────────────
async function fetchWeather(lat: number, lon: number, dob: string): Promise<CertificateFacts["weather"]> {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&start_date=${dob}&end_date=${dob}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=UTC`;
    const res = await fetchWithTimeout(url, {});
    if (!res.ok) throw new Error("open-meteo failed");
    const data = await res.json();
    if (data.error) throw new Error(data.reason ?? "open-meteo error");

    const maxT: number = data.daily?.temperature_2m_max?.[0];
    const minT: number = data.daily?.temperature_2m_min?.[0];
    const code: number = data.daily?.weathercode?.[0];
    const wind: number = data.daily?.windspeed_10m_max?.[0];
    if (maxT == null || minT == null) throw new Error("no data");

    return {
      condition: wmoCodeToText(code),
      tempC: Math.round((maxT + minT) / 2),
      wind: wind != null ? `${Math.round(wind)} km/h max winds` : "calm winds",
    };
  } catch (e) {
    console.error("[facts] weather error:", e);
    return null;
  }
}

function wmoCodeToText(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 9) return "Foggy";
  if (code <= 29) return "Rainy";
  if (code <= 39) return "Snowy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rainy";
  if (code <= 79) return "Snowy";
  if (code <= 84) return "Rain showers";
  if (code <= 94) return "Thunderstorms";
  return "Stormy";
}

// ─── USD/INR helper (used by exchange rate row AND gold price calculation) ───
// 1999+ : Frankfurter.dev daily
// 1973–1998: FRED DEXINUS daily (key required)
// 1960–1972: World Bank PA.NUS.FCRF annual average
// Pre-1960: null
async function getUsdToInr(dob: string): Promise<{ rate: number; annual?: boolean } | null> {
  const [y] = dob.split("-").map(Number);

  if (y >= 1999) {
    try {
      const res = await fetchWithTimeout(`https://api.frankfurter.dev/v1/${dob}?from=USD&to=INR`, {});
      if (res.ok) {
        const data = await res.json();
        const rate: number = data?.rates?.INR;
        if (rate) return { rate: Math.round(rate * 100) / 100 };
      }
    } catch { /* fall through */ }
  }

  if (y >= 1973) {
    try {
      const fredKey = process.env.FRED_API_KEY;
      if (fredKey) {
        // Walk up to 7 days forward to find a trading day (FRED returns "." for non-trading days)
        const base = new Date(dob + "T00:00:00Z");
        const end = new Date(base);
        end.setUTCDate(base.getUTCDate() + 7);
        const endStr = end.toISOString().split("T")[0];
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DEXINUS&observation_start=${dob}&observation_end=${endStr}&sort_order=asc&limit=5&api_key=${fredKey}&file_type=json`;
        const res = await fetchWithTimeout(url, {});
        if (res.ok) {
          const data = await res.json();
          const obs = (data.observations ?? []).find((o: any) => o.value !== ".");
          if (obs) {
            const rate = parseFloat(obs.value);
            if (!isNaN(rate)) return { rate: Math.round(rate * 100) / 100 };
          }
        }
      }
    } catch { /* fall through */ }
  }

  if (y >= 1960) {
    try {
      const res = await fetchWithTimeout(
        `https://api.worldbank.org/v2/country/IND/indicator/PA.NUS.FCRF?format=json&date=${y}`,
        {}
      );
      if (res.ok) {
        const data = await res.json();
        const rate: number = data?.[1]?.[0]?.value;
        if (rate) return { rate: Math.round(rate * 100) / 100, annual: true };
      }
    } catch { /* fall through */ }
  }

  return null;
}

async function fetchExchangeRate(dob: string): Promise<CertificateFacts["exchangeRate"]> {
  try {
    const result = await getUsdToInr(dob);
    if (!result) return null;
    console.log("[facts] USD/INR:", result.rate, result.annual ? "(annual)" : "(daily)");
    return { inrPerUsd: result.rate, annual: result.annual };
  } catch (e) {
    console.error("[facts] exchangeRate error:", e);
    return null;
  }
}

// ─── Gold price in INR/gram ──────────────────────────────────────────────────
// 2013+  : fxratesapi (XAU+INR) primary, NBP+Frankfurter fallback
// 1979–2012: Bank of England XUDLGPD (USD/troy oz) + getUsdToInr()
// Pre-1979: null (BOE series starts 1979-01-02)
const TROY_OZ_TO_GRAM = 31.1035;

// Format date as "DD/Mon/YYYY" for BOE API
function toBoeDate(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mon}/${yyyy}`;
}

async function fetchGoldPrice(dob: string): Promise<CertificateFacts["goldPrice"]> {
  try {
    const [y] = dob.split("-").map(Number);
    if (y < 1979) return null;

    // ── 1979–2012: Bank of England XUDLGPD (USD/troy oz) ──
    if (y < 2013) {
      const base = new Date(dob + "T00:00:00Z");
      // Walk back up to 7 days to find a trading day
      for (let i = 0; i <= 7; i++) {
        const d = new Date(base);
        d.setUTCDate(base.getUTCDate() - i);
        const dateFrom = toBoeDate(d);
        // request a 5-day window forward so we get the nearest trading day
        const dTo = new Date(d);
        dTo.setUTCDate(d.getUTCDate() + 4);
        const dateTo = toBoeDate(dTo);

        try {
          const url = `https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp?csv.x=yes&Datefrom=${dateFrom}&Dateto=${dateTo}&SeriesCodes=XUDLGPD&CSVF=TN&UsingCodes=Y`;
          const res = await fetchWithTimeout(url, { headers: { "User-Agent": "SkyAtBirth/1.0" } }, 10000);
          if (!res.ok) continue;
          const text = await res.text();
          // CSV: "DATE,XUDLGPD\n01 Apr 1982,327\n..."
          const lines = text.trim().split("\n").slice(1);
          const firstLine = lines.find(l => l.trim() && !l.startsWith("DATE"));
          if (!firstLine) continue;
          const parts = firstLine.split(",");
          const usdPerOz = parseFloat(parts[1]);
          if (isNaN(usdPerOz) || usdPerOz <= 0) continue;

          const fx = await getUsdToInr(dob);
          if (!fx) continue;

          const inrPerGram = Math.round((usdPerOz * fx.rate) / TROY_OZ_TO_GRAM);
          console.log("[facts] gold INR/gram:", inrPerGram, "from", dateFrom, "(BOE)");
          return { inrPerGram };
        } catch { continue; }
      }
      return null;
    }

    const base = new Date(dob + "T00:00:00Z");
    for (let i = 0; i <= 7; i++) {
      const d = new Date(base);
      d.setUTCDate(base.getUTCDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      // Primary: fxratesapi (single call, XAU = gold oz per USD, INR = rupees per USD)
      try {
        const res = await fetchWithTimeout(
          `https://api.fxratesapi.com/historical?date=${dateStr}&base=USD&currencies=XAU,INR`,
          {}
        );
        if (res.ok) {
          const data = await res.json();
          const xauPerUsd: number = data?.rates?.XAU;
          const inrPerUsd: number = data?.rates?.INR;
          if (xauPerUsd && inrPerUsd) {
            const inrPerGram = Math.round(inrPerUsd / (xauPerUsd * TROY_OZ_TO_GRAM));
            console.log("[facts] gold INR/gram:", inrPerGram, "from", dateStr, "(fxratesapi)");
            return { inrPerGram };
          }
        }
      } catch { /* try fallback */ }

      // Fallback: NBP PLN/gram + Frankfurter PLN→INR
      const [nbpRes, fxRes] = await Promise.all([
        fetchWithTimeout(`https://api.nbp.pl/api/cenyzlota/${dateStr}/?format=json`, {}),
        fetchWithTimeout(`https://api.frankfurter.dev/v1/${dateStr}?from=PLN&to=INR`, {}),
      ]);
      if (!nbpRes.ok || !fxRes.ok) {
        console.log(`[facts] gold: no data for ${dateStr}, trying previous day`);
        continue;
      }
      const nbp: { data: string; cena: number }[] = await nbpRes.json();
      const fx = await fxRes.json();
      const plnPerGram: number = nbp[0]?.cena;
      const inrPerPln: number = fx?.rates?.INR;
      if (!plnPerGram || !inrPerPln) continue;
      const inrPerGram = Math.round(plnPerGram * inrPerPln);
      console.log("[facts] gold INR/gram:", inrPerGram, "from", dateStr, "(NBP+Frankfurter)");
      return { inrPerGram };
    }

    console.log("[facts] gold: no trading day found near", dob);
    return null;
  } catch (e) {
    console.error("[facts] goldPrice error:", e);
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function fetchAllFacts(dob: string, lat: number, lon: number): Promise<CertificateFacts> {
  const bollywoodAndSongPromise = fetchBollywoodAndSong(dob);

  const [bwAndSong, headline, bornAlongside, weather, exchangeRate, goldPrice] =
    await Promise.allSettled([
      bollywoodAndSongPromise,
      fetchHeadline(dob),
      fetchBornAlongside(dob),
      fetchWeather(lat, lon, dob),
      fetchExchangeRate(dob),
      fetchGoldPrice(dob),
    ]);

  const get = <T>(r: PromiseSettledResult<T>) => r.status === "fulfilled" ? r.value : null;
  const bwResult = get(bwAndSong);
  const bollywood = bwResult?.bollywood ?? null;
  const song = bwResult?.song ?? null;

  console.log("[facts] summary:", {
    song: song ? "✓" : "✗",
    headline: get(headline) ? "✓" : "✗",
    bollywood: bollywood ? "✓" : "✗",
    bornAlongside: get(bornAlongside) ? "✓" : "✗",
    weather: get(weather) ? "✓" : "✗",
    exchangeRate: get(exchangeRate) ? "✓" : "✗",
    goldPrice: get(goldPrice) ? "✓" : "✗",
  });

  return {
    song,
    headline: get(headline),
    bollywood,
    bornAlongside: get(bornAlongside),
    weather: get(weather),
    exchangeRate: get(exchangeRate),
    goldPrice: get(goldPrice),
  };
}
