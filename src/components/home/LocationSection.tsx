import { getTranslations } from "next-intl/server";
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
 * and something useful even if the visitor never shares a location. The client
 * half takes over from there (see LocationFinder).
 */
export default async function LocationSection() {
  const t = await getTranslations("lokasi");
  const initial = findNearby(DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lng);

  return (
    <section id="lokasi" className="relative bg-white py-10 xl:py-24">
      <div className="mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Same heading rhythm as the news section: eyebrow column on the left,
            headline beside it on desktop, stacked on mobile. */}
        <div data-reveal-group className="flex flex-col xl:flex-row xl:gap-10">
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p
              data-reveal
              className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-blue-500 xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]"
            >
              {t("eyebrow")}
            </p>
          </div>
          <div className="flex flex-col gap-3 xl:w-[720px]">
            <h2
              data-reveal="blur-up"
              className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-blue-700 xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]"
            >
              {t("heading")}
            </h2>
            <p data-reveal className="text-sm leading-5 text-neutral-700 xl:text-base xl:leading-6">
              {t("description")}
            </p>
          </div>
        </div>

        <LocationFinder initial={initial} />
      </div>
    </section>
  );
}
