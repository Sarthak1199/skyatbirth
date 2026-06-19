import { NextRequest, NextResponse } from "next/server";
import { geocodePlace } from "@/lib/geocode";
import { fetchAllFacts } from "@/lib/facts";
import { formatOrdinalDate } from "@/lib/astronomy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, dob, time, place } = body;

    if (!dob || !place) {
      return NextResponse.json({ error: "dob and place are required" }, { status: 400 });
    }

    const geo = await geocodePlace(place, dob);
    const facts = await fetchAllFacts(dob, geo.lat, geo.lon);

    const [y, m, d] = dob.split("-").map(Number);
    const formattedDate = formatOrdinalDate(y, m, d);

    return NextResponse.json({
      name: name || "Friend",
      dob,
      time: time || null,
      place: geo.label,
      lat: geo.lat,
      lon: geo.lon,
      timezone: geo.timezone,
      utcOffsetH: geo.utcOffsetH,
      formattedDate,
      facts,
    });
  } catch (err: any) {
    console.error("certificate error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate certificate" }, { status: 500 });
  }
}
