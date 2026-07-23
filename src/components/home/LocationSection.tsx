import { findNearby } from "@/lib/locations";
import { DEFAULT_ORIGIN } from "./location-data";
import LocationFinder from "./LocationFinder";

/**
 * Lokasi BCA — a quick finder, not a directory.
 *
 * Three cards and a map, answering one question: where is the nearest BCA
 * branch or ATM? Anything past that (full directory, filters by service,
 * weekend banking) belongs on bca.co.id/id/lokasi-bca, which the footer link
 * points at.
 *
 * The nearest three around a default origin are resolved here on the server, so
 * the section is populated in the very first HTML — no spinner, no round trip,
 * and something useful even if the visitor never shares a location.
 *
 * Everything past that — including the heading — lives inside LocationFinder,
 * which is also where mobile and desktop genuinely diverge: both are now a
 * full-bleed map with floating panels on top (hero-style), just arranged
 * differently — top/bottom panels on a phone-width screen, a single panel
 * beside white overlay text once there's room to sit next to the map instead
 * of on top of it. Splitting the heading out here would mean this server
 * component and that client component fighting over the same
 * `relative`/`absolute` positioning context; keeping it together lets one
 * component own its own layout at every breakpoint.
 *
 * Mobile's fixed height exists because its two floating panels (top and
 * bottom, see LocationFinder.tsx) are both `absolute` — the section has to
 * hand them a box to be absolute *within*, since nothing about a phone-width
 * top/bottom split has a single piece of content to size around.
 *
 * Desktop drops the fixed height (`xl:h-auto`) instead: with only the one
 * floating panel, the map is meant to hug its content — panel height plus the
 * 64px top/bottom padding around it — rather than an arbitrary fixed figure
 * that would either crop the panel or leave dead map above/below it. See the
 * desktop half of LocationFinder.tsx for how the panel drives that height
 * from normal document flow while the map still overlays it via `absolute`.
 */
export default async function LocationSection() {
  const initial = findNearby(DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lng);

  return (
    <section id="lokasi" className="relative h-[880px] overflow-clip bg-blue-100 xl:h-auto">
      <LocationFinder initial={initial} />
    </section>
  );
}
