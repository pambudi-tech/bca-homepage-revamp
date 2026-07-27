import { findNearby } from "@/lib/locations";
import type { LocationType } from "@/components/home/location-data";

/**
 * The three nearest ATMs/branches to a point, plus the pins to draw around it.
 *
 * POST rather than GET, even though this only reads: the body carries the
 * visitor's coordinates, and a query string would put them in the URL — where
 * they end up in access logs, proxy caches and the Referer header. The client
 * rounds to 4 decimals (~11m) before sending, which is far finer than "which
 * ATM is closest" needs and coarser than a precise fix.
 *
 * The trade-off is no HTTP caching for this route. That costs nothing here —
 * the query is a linear scan of a ~1k-row in-memory array.
 */

const TYPES = new Set<string>(["all", "cabang", "atm"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { lat, lng, type } = (body ?? {}) as {
    lat?: unknown;
    lng?: unknown;
    type?: unknown;
  };

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

  const filter = typeof type === "string" && TYPES.has(type) ? type : "all";

  return Response.json(findNearby(lat, lng, filter as LocationType | "all"), {
    // Coordinates in, results out — nothing in between should hold onto it.
    headers: { "Cache-Control": "no-store" },
  });
}
