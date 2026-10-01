import type { NextRequest } from "next/server";
import { POST as findNearby } from "../../../../archive/lokasi-bca/api-locations/nearby-route";
import { GET as searchPlaces } from "../../../../archive/lokasi-bca/api-locations/places-route";
import { POST as reverseGeocode } from "../../../../archive/lokasi-bca/api-locations/reverse-route";

export async function GET(request: NextRequest) {
  return searchPlaces(request);
}

export async function POST(request: NextRequest) {
  switch (new URL(request.url).searchParams.get("action")) {
    case "nearby":
      return findNearby(request);
    case "reverse":
      return reverseGeocode(request);
    default:
      return Response.json({ error: "unsupported action" }, { status: 400 });
  }
}
