/** Shapes shared by the Lokasi BCA section's server and client halves.
 *  The dataset itself lives in `src/data/bca-locations.json` (built by
 *  `scripts/fetch-bca-locations.mjs`) and is only ever read on the server —
 *  see `src/lib/locations.ts`. */

export type LocationType = "cabang" | "atm";

export type BcaLocation = {
  id: string;
  type: LocationType;
  lat: number;
  lng: number;
  /** Street line from OSM. Frequently empty — the UI falls back to `area`. */
  street: string;
  /** Kelurahan / neighbourhood. */
  area: string;
  /** Kecamatan / city district. */
  district: string;
  city: string;
  /** Raw OSM `opening_hours`, e.g. "Mo-Fr 08:00-15:00". Often empty. */
  hours: string;
};

/** A location with its straight-line distance, in metres, from the origin. */
export type NearbyLocation = BcaLocation & { distance: number };

/** A searchable place — a kelurahan, kecamatan or kota derived from the
 *  dataset, so every suggestion is guaranteed to have BCA locations near it. */
export type Place = {
  id: string;
  /** "Kelapa Gading Barat" */
  label: string;
  /** "Kelapa Gading, Jakarta Utara" */
  sub: string;
  lat: number;
  lng: number;
  count: number;
};

export type NearbyResponse = {
  origin: { lat: number; lng: number };
  /** The three cards. */
  results: NearbyLocation[];
  /** Everything worth drawing on the map around the origin, cards included. */
  pins: NearbyLocation[];
};

/** How many cards the homepage section shows. This is a quick finder, not a
 *  directory — anything more belongs on bca.co.id/id/lokasi-bca. */
export const RESULT_COUNT = 3;

/** Upper bound on map pins. Enough to make the area read as "covered" without
 *  shipping a payload the section doesn't need. */
export const PIN_COUNT = 60;

/**
 * How far out "terdekat" is still a meaningful claim, in metres.
 *
 * The dataset covers major cities, not the whole country. Without a cutoff, a
 * visitor outside that coverage gets three cards that are genuinely the nearest
 * and also 300km away — and the map zooms out to a third of Java to frame them,
 * which reads as broken rather than as "we don't have anything near you". Past
 * this radius the section says so instead.
 */
export const MAX_RADIUS_METERS = 50_000;

/** Bundaran HI. The section renders around this before the visitor shares a
 *  location or picks a place, so it is never an empty map with an empty list. */
export const DEFAULT_ORIGIN = { lat: -6.1944, lng: 106.8229, label: "Jakarta Pusat" };

/** Metres between two coordinates (haversine). Straight-line, not driving
 *  distance — the cards label it as such. */
export function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "350 m" under a kilometre, "1,2 km" above it — decimal comma in Indonesian,
 *  which `Intl` handles per locale. */
export function formatDistance(meters: number, locale: string): string {
  // A picked place resolves to the centroid of its locations, so a place with
  // exactly one lands on top of it. Rounding would print "0 m", which reads as
  // a broken calculation rather than "very close".
  if (meters < 10) return "<10 m";
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  const fractionDigits = km < 10 ? 1 : 0;
  return `${km.toLocaleString(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} km`;
}

/** Title / subtitle for a card. OSM names every one of these "BCA" or "ATM
 *  BCA", so the type badge carries that and the heading has to come from the
 *  address instead — street when we have one, otherwise the area. */
export function locationLines(loc: BcaLocation): { title: string; sub: string } {
  const parts = [loc.area, loc.district, loc.city].filter(Boolean);
  // Kelurahan and kecamatan are often the same word ("Cakung, Cakung").
  const place = [...new Set(parts)];

  if (loc.street) {
    return { title: loc.street, sub: place.join(", ") };
  }
  return { title: place[0] ?? loc.city, sub: place.slice(1).join(", ") };
}

/**
 * Kelurahan-level label/sub for "your location", in the same {label, sub}
 * shape as a search suggestion — so the confirmation reads as one more row in
 * the same visual language, not a different kind of information.
 *
 * There is no reverse-geocoding call behind this: it reads the area/district/
 * city off the nearest BCA location already returned by `/api/locations/nearby`
 * (see `LocationFinder.tsx`), which is accurate at the kelurahan the visitor is
 * actually in for anything within ordinary walking distance of that location,
 * and never sends the visitor's coordinates to a third-party geocoder.
 */
export function areaLine(loc: Pick<BcaLocation, "area" | "district" | "city">): {
  label: string;
  sub: string;
} {
  const label = loc.area || loc.district || loc.city;
  const parents = [loc.district, loc.city].filter(Boolean);
  const sub = [...new Set(parents)].filter((p) => p !== label).join(", ");
  return { label, sub };
}

/** Google Maps directions, which is what "Rute" opens. Coordinates rather than
 *  a place query: these POIs have no distinctive names to search for. */
export function directionsUrl(loc: BcaLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
}

/** OSM weekday keys in `opening_hours`, in ISO order starting Monday. */
const OSM_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** 2024-01-01 was a Monday, so index 0..6 lands on Mon..Sun. */
const dayName = (index: number, locale: string) =>
  new Date(Date.UTC(2024, 0, 1 + index)).toLocaleDateString(locale, {
    weekday: "short",
    timeZone: "UTC",
  });

/**
 * Renders an OSM `opening_hours` value in the page's language, e.g.
 * "Mo-Fr 08:00-15:00" → "Sen–Jum 08.00–15.00".
 *
 * Only the two shapes that actually occur in this dataset are handled — a
 * single day range with a single time range, and "24/7". `opening_hours` is a
 * whole grammar (holidays, seasons, exceptions), and a card with room for one
 * line is the wrong place to attempt the rest: anything else returns "" and the
 * card simply omits the line rather than showing a half-parsed string.
 */
export function formatHours(raw: string, locale: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (value === "24/7") return locale.startsWith("id") ? "Buka 24 jam" : "Open 24 hours";

  const match = /^([A-Za-z]{2}(?:-[A-Za-z]{2})?) (\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(value);
  if (!match) return "";

  const [, days, from, to] = match;
  const names = days.split("-").map((day) => {
    const index = OSM_DAYS.indexOf(day);
    return index === -1 ? null : dayName(index, locale);
  });
  if (names.some((name) => name === null)) return "";

  // Indonesian writes clock times with a dot; en/zh keep the colon.
  const time = (t: string) => (locale.startsWith("id") ? t.replace(":", ".") : t);
  return `${names.join("–")} ${time(from)}–${time(to)}`;
}
