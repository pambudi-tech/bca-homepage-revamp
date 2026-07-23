/**
 * Builds `src/data/bca-locations.json` — the ATM/branch dataset behind the
 * "Lokasi BCA" homepage section.
 *
 * Run it by hand (`node scripts/fetch-bca-locations.mjs`), not at build time:
 * it talks to two public OSM services that are rate-limited and occasionally
 * busy, and the answer only changes when OpenStreetMap does. The output is
 * committed, so the site never depends on either service at runtime.
 *
 *   1. Overpass — every `amenity=bank|atm` that carries BCA's brand (or names
 *      itself BCA) inside each city box below. Real coordinates, real POIs.
 *   2. Nominatim — reverse-geocodes each hit to a kelurahan / kecamatan / kota.
 *      OSM's own address tags are too sparse to rely on (~20% coverage, mostly
 *      just a street name), and those area names are what the section's search
 *      box matches against, so they have to come from somewhere.
 *
 * Both are throttled to one request at a time with a delay, per Nominatim's
 * usage policy. Reverse-geocode answers are cached in `.cache/` (gitignored),
 * so a re-run after a failure resumes instead of starting over.
 *
 * Overpass is busy often enough that a city can come back empty after every
 * retry. Rather than rebuild the whole file and lose it, pass the cities to
 * repair and the results are merged into the existing dataset by OSM id:
 *
 *     node scripts/fetch-bca-locations.mjs --only=Semarang,Makassar
 *
 * Data © OpenStreetMap contributors, ODbL. The section credits it in the map
 * attribution alongside OpenFreeMap.
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "src/data/bca-locations.json");
const CACHE_FILE = join(ROOT, ".cache/nominatim-reverse.json");

const UA = "bca-homepage-revamp/1.0 (prototype; dataset seed script)";

/** Overpass wants (south, west, north, east). */
const CITIES = [
  { city: "Jakarta", bbox: [-6.37, 106.68, -6.08, 106.97] },
  { city: "Tangerang", bbox: [-6.35, 106.5, -6.12, 106.7] },
  { city: "Bekasi", bbox: [-6.4, 106.93, -6.15, 107.06] },
  { city: "Depok", bbox: [-6.48, 106.74, -6.34, 106.88] },
  { city: "Bogor", bbox: [-6.66, 106.72, -6.5, 106.86] },
  { city: "Bandung", bbox: [-7.0, 107.5, -6.83, 107.72] },
  { city: "Semarang", bbox: [-7.1, 110.32, -6.93, 110.52] },
  { city: "Yogyakarta", bbox: [-7.92, 110.3, -7.7, 110.47] },
  { city: "Surakarta", bbox: [-7.62, 110.74, -7.5, 110.9] },
  { city: "Surabaya", bbox: [-7.38, 112.6, -7.18, 112.85] },
  { city: "Malang", bbox: [-8.05, 112.55, -7.9, 112.71] },
  { city: "Denpasar", bbox: [-8.8, 115.1, -8.6, 115.3] },
  { city: "Medan", bbox: [3.5, 98.6, 3.7, 98.76] },
  { city: "Palembang", bbox: [-3.05, 104.68, -2.9, 104.83] },
  { city: "Makassar", bbox: [-5.22, 119.37, -5.06, 119.52] },
  { city: "Balikpapan", bbox: [-1.33, 116.78, -1.16, 116.93] },
  { city: "Batam", bbox: [1.0, 103.88, 1.22, 104.12] },
  { city: "Pekanbaru", bbox: [0.42, 101.34, 0.61, 101.53] },
];

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- overpass */

function overpassQuery([s, w, n, e]) {
  // Two ways of saying "this is BCA": the brand link (Q806626, the reliable
  // one) and a name match (older imports that were never brand-tagged).
  return `[out:json][timeout:120];
(
  nwr["brand:wikidata"="Q806626"]["amenity"~"^(bank|atm)$"](${s},${w},${n},${e});
  nwr["amenity"~"^(bank|atm)$"]["name"~"BCA",i](${s},${w},${n},${e});
);
out center tags;`;
}

async function fetchCity(city, bbox, attempt = 0) {
  const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: overpassQuery(bbox) }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    // A busy Overpass answers 200 with an HTML error page, so parse defensively.
    if (!body.trimStart().startsWith("{")) throw new Error("non-JSON response (server busy)");
    return JSON.parse(body).elements ?? [];
  } catch (err) {
    if (attempt >= 3) {
      console.warn(`  ! ${city}: giving up — ${err.message}`);
      return [];
    }
    const wait = 15_000 * (attempt + 1);
    console.warn(`  · ${city}: ${err.message}, retrying in ${wait / 1000}s`);
    await sleep(wait);
    return fetchCity(city, bbox, attempt + 1);
  }
}

/* --------------------------------------------------------------- normalise */

/** Metres between two coordinates (haversine). */
function distance(aLat, aLng, bLat, bLng) {
  const R = 6_371_000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** OSM often holds one POI twice — a node plus the building way around it. */
function dedupe(items) {
  const kept = [];
  for (const item of items) {
    const twin = kept.find(
      (k) => k.type === item.type && distance(k.lat, k.lng, item.lat, item.lng) < 30,
    );
    if (twin) {
      // Keep whichever knows more about itself.
      if (Object.keys(item.tags).length > Object.keys(twin.tags).length) {
        Object.assign(twin, item);
      }
      continue;
    }
    kept.push(item);
  }
  return kept;
}

function normalise(el, city) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const tags = el.tags ?? {};
  const isAtm = tags.amenity === "atm";

  // Street line, best effort. `addr:full` in Indonesian OSM is usually just the
  // street name; `addr:street` + housenumber is rarer but better when present.
  const street = tags["addr:street"]
    ? [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" No. ")
    : (tags["addr:full"] ?? "");

  return {
    id: `${el.type[0]}${el.id}`,
    type: isAtm ? "atm" : "cabang",
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    street,
    city,
    hours: tags.opening_hours ?? "",
    // Retained only for dedupe/inspection; stripped before writing.
    tags,
  };
}

/* -------------------------------------------------------------- nominatim */

async function loadCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

/** Rounded to ~110m: neighbouring ATMs share one lookup. */
const cacheKey = (lat, lng) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

async function reverseGeocode(lat, lng) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  // Suburb level — kelurahan/kecamatan, which is what people search by.
  url.searchParams.set("zoom", "16");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const a = body.address ?? {};
  return {
    area: a.village ?? a.suburb ?? a.neighbourhood ?? a.hamlet ?? "",
    district: a.city_district ?? a.subdistrict ?? a.municipality ?? a.county ?? "",
    city: a.city ?? a.town ?? a.regency ?? a.county ?? "",
    road: a.road ?? "",
  };
}

/* ------------------------------------------------------------------- main */

/** `--only=Semarang,Makassar` → ["Semarang", "Makassar"]; absent → null. */
function parseOnly(argv) {
  const flag = argv.find((arg) => arg.startsWith("--only="));
  if (!flag) return null;
  const names = flag
    .slice("--only=".length)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const unknown = names.filter((name) => !CITIES.some((c) => c.city === name));
  if (unknown.length) {
    throw new Error(
      `unknown city in --only: ${unknown.join(", ")}\nknown: ${CITIES.map((c) => c.city).join(", ")}`,
    );
  }
  return names;
}

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUT_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const only = parseOnly(process.argv.slice(2));
  const cities = only ? CITIES.filter((c) => only.includes(c.city)) : CITIES;

  console.log(
    only
      ? `Overpass — repairing ${cities.length} city box(es): ${only.join(", ")}\n`
      : `Overpass — ${cities.length} city boxes\n`,
  );

  const raw = [];
  for (const { city, bbox } of cities) {
    const elements = await fetchCity(city, bbox);
    const items = elements.map((el) => normalise(el, city)).filter(Boolean);
    console.log(`  ${city.padEnd(12)} ${String(items.length).padStart(4)} POIs`);
    raw.push(...items);
    await sleep(2_000); // be a good neighbour
  }

  const locations = dedupe(raw);
  console.log(`\n${raw.length} raw → ${locations.length} after dedupe\n`);

  const cache = await loadCache();
  const misses = locations.filter((l) => !(cacheKey(l.lat, l.lng) in cache));
  console.log(`Nominatim — ${misses.length} lookups (${locations.length - misses.length} cached)`);
  console.log(`  ~${Math.ceil((misses.length * 1.1) / 60)} min at 1 req/s\n`);

  let done = 0;
  for (const loc of locations) {
    const key = cacheKey(loc.lat, loc.lng);
    if (!(key in cache)) {
      try {
        cache[key] = await reverseGeocode(loc.lat, loc.lng);
      } catch (err) {
        console.warn(`  ! ${key}: ${err.message}`);
        cache[key] = null;
      }
      done += 1;
      if (done % 25 === 0) {
        console.log(`  ${done}/${misses.length}`);
        await mkdir(dirname(CACHE_FILE), { recursive: true });
        await writeFile(CACHE_FILE, JSON.stringify(cache));
      }
      await sleep(1_100); // Nominatim policy: max 1 req/s
    }
    const hit = cache[key];
    if (hit) {
      loc.area = hit.area || hit.district || "";
      loc.district = hit.district || "";
      // Prefer Nominatim's city over our bbox label, but keep the bbox label as
      // the fallback so every row is searchable by a city name either way.
      loc.city = hit.city || loc.city;
      if (!loc.street && hit.road) loc.street = hit.road;

      // Outside the big cities Nominatim labels the *kecamatan* as `city` and
      // leaves the kabupaten in `county`, which lands here as `district` —
      // exactly inverted, and the card would read "Citaringgul, Kab Bogor,
      // Babakan Madang". A "Kab/Kabupaten/Kota" prefix is the reliable tell:
      // that is a level-6 unit, so it belongs in `city`, not below it.
      const isRegency = (v) => /^(kab|kabupaten|kota)\b/i.test(v);
      if (isRegency(loc.district) && !isRegency(loc.city)) {
        [loc.district, loc.city] = [loc.city, loc.district];
      }
    } else {
      loc.area = "";
      loc.district = "";
    }
  }

  await mkdir(dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache));

  // Drop the raw tag bag and settle a stable field order before writing.
  const fresh = locations.map(
    ({ id, type, lat, lng, street, area, district, city, hours }) => ({
      id,
      type,
      lat,
      lng,
      street,
      area,
      district,
      city,
      hours,
    }),
  );

  // A repair run only ever adds to (or refreshes) what is already there; a full
  // run replaces it. Keyed by OSM id, so re-fetching a city updates its rows in
  // place rather than duplicating them.
  const merged = new Map();
  if (only) {
    for (const row of await loadExisting()) merged.set(row.id, row);
  }
  for (const row of fresh) merged.set(row.id, row);

  const out = [...merged.values()].sort(
    (a, b) => a.city.localeCompare(b.city) || a.area.localeCompare(b.area),
  );

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(out, null, 0)}\n`);

  const branches = out.filter((l) => l.type === "cabang").length;
  console.log(`\nWrote ${out.length} locations (${branches} cabang, ${out.length - branches} ATM)`);
  if (only) console.log(`  ${fresh.length} from this run, merged into the existing dataset`);
  console.log(`  → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
