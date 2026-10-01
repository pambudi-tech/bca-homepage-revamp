import data from "../../src/components/prioritas/temukan-cabang-data.json";
import {
  MAX_RADIUS_METERS,
  PIN_COUNT,
  RESULT_COUNT,
  distanceMeters,
  type BcaLocation,
  type NearbyLocation,
  type NearbyResponse,
  type Place,
} from "./location-data";

/**
 * The Prioritas branch dataset and the queries used by the archived
 * Lokasi BCA map interface.
 *
 * Import this from server code only. The dataset is a few hundred kilobytes of
 * JSON — fine to hold in the server process, absurd to ship to a browser that
 * only ever needs three cards and sixty pins. Both queries are exposed through
 * `/api/locations/*` (see `src/app/api/locations/`), which is what the client
 * component calls; nothing under `src/components/` may import this file.
 *
 * Everything here is a plain in-memory scan. At this size (~1k rows) a linear
 * pass is well under a millisecond, and a spatial index would be more code to
 * maintain than it saves.
 *
 * Branch locations come from the Prioritas locator dataset.
 */

const LOCATIONS: BcaLocation[] = data.locations.map((location) => ({
  id: `${location.latitude},${location.longitude}`,
  type: "cabang",
  lat: location.latitude,
  lng: location.longitude,
  street: location.name,
  area: location.address,
  district: "",
  city: "",
  hours: "",
}));

/* ------------------------------------------------------------------ nearby */

/** The three cards plus the pins to draw, in one pass over the dataset. */
export function findNearby(lat: number, lng: number): NearbyResponse {
  const ranked: NearbyLocation[] = LOCATIONS
    .map((loc) => ({ ...loc, distance: distanceMeters(lat, lng, loc.lat, loc.lng) }))
    // Outside the coverage radius there is no useful answer to give, and
    // pretending otherwise produces a map zoomed out to half of Java.
    .filter((loc) => loc.distance <= MAX_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance);

  return {
    origin: { lat, lng },
    results: ranked.slice(0, RESULT_COUNT),
    pins: ranked.slice(0, PIN_COUNT),
  };
}

/* ------------------------------------------------------------------ places */

/** Strips accents and case so "Kelapa Gading" and "kelapa  gading" match. */
function normalise(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

type IndexedPlace = Place & { haystack: string };

/** Suggestions match branch names and addresses, plus a small locality index
 * for common search areas that are not named in the branch address records. */
const placeIndex: IndexedPlace[] = (() => {
  const branches = LOCATIONS.map((location) => ({
    id: location.id,
    label: location.street,
    sub: location.area,
    lat: location.lat,
    lng: location.lng,
    count: 1,
    haystack: normalise(`${location.street} ${location.area}`),
  }));

  // These nearby residential areas are commonly searched by name, but are
  // not always present in BCA's branch address text. Their coordinates are
  // search origins; the results still come from the official branch dataset.
  const areas: IndexedPlace[] = [
    { id: "area:bintaro", label: "Bintaro", sub: "Tangerang Selatan", lat: -6.276, lng: 106.733, count: 0, haystack: "bintaro tangerang selatan" },
    { id: "area:bsd", label: "BSD City", sub: "Tangerang Selatan", lat: -6.301, lng: 106.652, count: 0, haystack: "bsd city serpong tangerang selatan" },
    { id: "area:serpong", label: "Serpong", sub: "Tangerang Selatan", lat: -6.312, lng: 106.683, count: 0, haystack: "serpong tangerang selatan" },
    { id: "area:alam-sutera", label: "Alam Sutera", sub: "Tangerang", lat: -6.241, lng: 106.626, count: 0, haystack: "alam sutera tangerang" },
    { id: "area:pondok-aren", label: "Pondok Aren", sub: "Tangerang Selatan", lat: -6.269, lng: 106.713, count: 0, haystack: "pondok aren tangerang selatan" },
  ];

  return [...branches, ...areas].sort((a, b) => a.label.localeCompare(b.label));
})();

/**
 * Ranked branch or locality suggestions for `query`.
 *
 * Exact branch names rank first, followed by names beginning with the query,
 * later words, and then address matches.
 */
export function searchPlaces(query: string, limit = 6): Place[] {
  const q = normalise(query);
  if (q.length < 2) return [];

  const scored: { place: IndexedPlace; rank: number }[] = [];

  for (const place of placeIndex) {
    const label = normalise(place.label);
    let rank: number;

    if (label === q) rank = 0;
    else if (label.startsWith(q)) rank = 1;
    else if (label.includes(` ${q}`)) rank = 2;
    else if (place.haystack.includes(q)) rank = 3;
    else continue;

    scored.push({ place, rank });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.place.label.localeCompare(b.place.label))
    .slice(0, limit)
    // `haystack` is an index-building detail; it never leaves the server.
    .map(({ place }) => ({
      id: place.id,
      label: place.label,
      sub: place.sub,
      lat: place.lat,
      lng: place.lng,
      count: place.count,
    }));
}
