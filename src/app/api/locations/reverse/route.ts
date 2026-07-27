import type { NextRequest } from "next/server";

/**
 * Turns the visitor's GPS coordinates into the kelurahan/kecamatan they're
 * actually standing in, via OSM's Nominatim reverse-geocoder.
 *
 * Proxied through our own server rather than called from the browser so the
 * visitor's coordinates go server-to-server instead of straight from their
 * IP to a third party, and so Nominatim's usage policy (a descriptive
 * `User-Agent`, no client-side hammering) is satisfied in one place.
 *
 * POST, matching `../nearby`: the body carries a position, and a query
 * string would put it in access logs and the Referer header.
 */

type NominatimAddress = {
  suburb?: string;
  village?: string;
  neighbourhood?: string;
  city_district?: string;
  subdistrict?: string;
  town?: string;
  city?: string;
  county?: string;
  regency?: string;
  state?: string;
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { lat, lng } = (body ?? {}) as { lat?: unknown; lng?: unknown };

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return Response.json({ error: "lat/lng must be valid coordinates" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "16");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "id");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "bca.co.id-homepage/1.0 (+https://www.bca.co.id)",
        Referer: "https://www.bca.co.id",
      },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return Response.json({ area: null }, { headers: { "Cache-Control": "no-store" } });
  }

  if (!response.ok) {
    return Response.json({ area: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const json = (await response.json()) as { address?: NominatimAddress };
  const address = json.address ?? {};

  // Kelurahan-ish first, then kecamatan-ish, then city — the finest name
  // Nominatim actually gave us for this point.
  const label =
    address.suburb ||
    address.village ||
    address.neighbourhood ||
    address.city_district ||
    address.subdistrict ||
    address.town ||
    address.city ||
    address.regency ||
    address.county ||
    null;

  const sub = [address.city || address.regency, address.state]
    .filter((part): part is string => Boolean(part) && part !== label)
    .filter((part, index, arr) => arr.indexOf(part) === index)
    .join(", ");

  return Response.json(
    { area: label ? { label, sub } : null },
    // Coordinates in, name out — same no-store stance as `../nearby`.
    { headers: { "Cache-Control": "no-store" } },
  );
}
