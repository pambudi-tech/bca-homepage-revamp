import dataset from "@/data/bca-locations.json";
import {
  MAX_RADIUS_METERS,
  PIN_COUNT,
  RESULT_COUNT,
  distanceMeters,
  type BcaLocation,
  type LocationType,
  type NearbyLocation,
  type NearbyResponse,
  type Place,
} from "@/components/home/location-data";

/**
 * The ATM/branch dataset and the two queries the Lokasi BCA section runs
 * against it.
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
 * Data © OpenStreetMap contributors (ODbL), collected by
 * `scripts/fetch-bca-locations.mjs`.
 */

const LOCATIONS = dataset as BcaLocation[];

/* ------------------------------------------------------------------ nearby */

/** The three cards plus the pins to draw, in one pass over the dataset. */
export function findNearby(
  lat: number,
  lng: number,
  type: LocationType | "all" = "all",
): NearbyResponse {
  const pool = type === "all" ? LOCATIONS : LOCATIONS.filter((l) => l.type === type);

  const ranked: NearbyLocation[] = pool
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

/**
 * Search suggestions, derived from the dataset itself rather than a geocoder.
 *
 * That is the point: every suggestion is a place we can actually answer for.
 * A geocoder would happily return an address in a town where the dataset has
 * nothing, and the visitor would get three "nearest" results 40km away.
 *
 * Built once on first use and kept — the underlying JSON never changes at
 * runtime.
 */
const placeIndex: IndexedPlace[] = (() => {
  // Three granularities — kelurahan, kecamatan, kota — so both "Kelapa Gading"
  // and "Surabaya" resolve. Keyed by name + city rather than by granularity:
  // an Indonesian kelurahan very often shares its kecamatan's name (Menteng,
  // Menteng), and two identical "Menteng" rows in a dropdown read as a bug.
  // Collapsing them also makes `count` the true number of locations there.
  const buckets = new Map<
    string,
    { label: string; sub: string; latSum: number; lngSum: number; count: number }
  >();

  const add = (label: string, parents: string[], loc: BcaLocation) => {
    if (!label) return;
    const key = `${label}|${loc.city}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.latSum += loc.lat;
      bucket.lngSum += loc.lng;
      bucket.count += 1;
      return;
    }
    // The context line drops anything that just repeats the label.
    const sub = [...new Set(parents)].filter((p) => p && p !== label).join(", ");
    buckets.set(key, { label, sub, latSum: loc.lat, lngSum: loc.lng, count: 1 });
  };

  for (const loc of LOCATIONS) {
    add(loc.area, [loc.district, loc.city], loc);
    add(loc.district, [loc.city], loc);
    add(loc.city, [], loc);
  }

  return [...buckets.entries()]
    .map(([id, b]) => ({
      id,
      label: b.label,
      sub: b.sub,
      // Centroid of the matching locations — close enough to the middle of a
      // kelurahan, and guaranteed to sit among BCA locations rather than in a
      // field on the administrative boundary.
      lat: Number((b.latSum / b.count).toFixed(6)),
      lng: Number((b.lngSum / b.count).toFixed(6)),
      count: b.count,
      haystack: normalise(`${b.label} ${b.sub}`),
    }))
    .sort((a, b) => b.count - a.count);
})();

/**
 * Ranked place suggestions for `query`.
 *
 * Four tiers, best first: the name *is* the query, the name starts with it, a
 * later word in the name starts with it, or it appears anywhere (including in
 * the kecamatan/kota line, so "Jakarta Utara" surfaces its kelurahan). Ties
 * break on how many BCA locations the place has, which floats the busy areas
 * people mean.
 *
 * The exact tier exists because count alone gets it wrong: typing "Menteng"
 * would otherwise return Menteng Dalam first, purely because it has one more
 * location than the Menteng the visitor typed.
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
    .sort((a, b) => a.rank - b.rank || b.place.count - a.place.count)
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
