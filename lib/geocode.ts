export interface GeoResult {
  lat: number;
  lon: number;
  label: string;
  timezone: string;
  utcOffsetH: number;
}

// Geocode a place string using Google Geocoding + Time Zone APIs
export async function geocodePlace(place: string, date: string): Promise<GeoResult> {
  const apiKey = process.env.GEOCODING_API_KEY;
  if (!apiKey) throw new Error("GEOCODING_API_KEY not set");

  const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (geoData.status !== "OK" || !geoData.results?.[0]) {
    throw new Error(`Geocoding failed: ${geoData.status}`);
  }

  const result = geoData.results[0];
  const { lat, lng: lon } = result.geometry.location;
  const label = result.formatted_address;

  // Timestamp: noon UTC on the given date
  const [y, m, d] = date.split("-").map(Number);
  const timestamp = Math.floor(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getTime() / 1000);

  const tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${apiKey}`;
  const tzRes = await fetch(tzUrl);
  const tzData = await tzRes.json();

  // Fallback: estimate UTC offset from longitude (±15° per hour)
  let utcOffsetH = Math.round(lon / 15);
  let timezone = "UTC";

  if (tzData.status === "OK") {
    const utcOffsetSeconds = tzData.rawOffset + tzData.dstOffset;
    utcOffsetH = utcOffsetSeconds / 3600;
    timezone = tzData.timeZoneId;
  }

  return { lat, lon, label, timezone, utcOffsetH };
}
