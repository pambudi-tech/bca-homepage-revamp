import type { NextRequest } from "next/server";
import { GET as searchPlaces } from "../../../../../archive/lokasi-bca/api-locations/places-route";

export async function GET(request: NextRequest) {
  return searchPlaces(request);
}
