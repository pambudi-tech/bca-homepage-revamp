import type { NextRequest } from "next/server";
import { searchPlaces } from "@/lib/locations";

/**
 * Place suggestions for the section's search box — kelurahan, kecamatan and
 * kota names taken from the location dataset itself, so every suggestion is
 * somewhere we can actually list BCA locations for.
 *
 * A plain GET: the query is a place name the visitor typed, not a position, so
 * unlike `../nearby` there is nothing here worth keeping out of a URL. The
 * answers only change when the dataset does, hence the long cache.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  return Response.json(
    { places: searchPlaces(query) },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
