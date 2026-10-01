import { POST as findNearby } from "../../../../../archive/lokasi-bca/api-locations/nearby-route";

export async function POST(request: Request) {
  return findNearby(request);
}
