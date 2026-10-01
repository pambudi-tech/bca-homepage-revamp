import type { NextRequest } from "next/server";
import { POST as reverseGeocode } from "../../../../../archive/lokasi-bca/api-locations/reverse-route";

export async function POST(request: NextRequest) {
  return reverseGeocode(request);
}
