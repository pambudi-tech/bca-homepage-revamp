"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import PromoCard from "@/components/promo/PromoCard";
import PrioritasFeaturedBanner from "@/components/prioritas/PrioritasFeaturedBanner";
import { DIRECTORY_PAGE_SIZE, PrioritasDirectoryCategories, PrioritasDirectoryFilters, PrioritasDirectoryPanel } from "@/components/prioritas/PrioritasDirectory";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import { EVENT_CATEGORY_KEYS, type EventCategory, type EventPromo } from "@/components/prioritas/event-data";

const categoryIcons: Record<EventCategory, string> = { lifestyle: "lifestyle", networking: "business", arts: "beauty", culinary: "fnb" };

export default function EventPrivilegeExperience({ promos, initialCategory = "all", bannerBackdrops }: { promos: EventPromo[]; initialCategory?: EventCategory | "all"; bannerBackdrops: Record<string, string> }) {
  const t = useTranslations("signaturePrivilege");
  const heroT = useTranslations("prioritasHero");
  const [category, setCategory] = useState<EventCategory | "all">(initialCategory);
  const [period, setPeriod] = useState<"upcoming" | "all" | "ended">("all");
  const [page, setPage] = useState(1);
  const events = useMemo(() => {
    const now = new Date();
    return promos.filter((event) => category === "all" || event.eventCategory === category)
      .filter((event) => period === "all" || (period === "upcoming" ? event.endAt >= now : event.endAt < now))
      .toSorted((first, second) => {
        const firstActive = first.endAt >= now;
        const secondActive = second.endAt >= now;
        if (firstActive !== secondActive) return firstActive ? -1 : 1;
        if (!firstActive) return second.endAt.getTime() - first.endAt.getTime();
        const firstOngoing = first.startAt <= now;
        const secondOngoing = second.startAt <= now;
        if (firstOngoing !== secondOngoing) return firstOngoing ? -1 : 1;
        if (firstOngoing) return first.endAt.getTime() - second.endAt.getTime();
        return first.startAt.getTime() - second.startAt.getTime();
      });
  }, [category, period, promos]);
  const visibleEvents = events.slice((page - 1) * DIRECTORY_PAGE_SIZE, page * DIRECTORY_PAGE_SIZE);

  function selectCategory(next: EventCategory) {
    const selected = category === next ? "all" : next;
    setCategory(selected);
    setPage(1);
    const url = new URL(window.location.href);
    if (selected === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", selected);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 text-pbrown-800">
    <section className="relative isolate overflow-x-clip bg-pgold-200 py-8">
      <div className="relative mx-auto max-w-[1280px] px-4 xl:px-0">
        <PrioritasFeaturedBanner titles={[heroT("eventPromo.featuredTitles.javaJazz"), heroT("eventPromo.featuredTitles.theWeeknd"), heroT("eventPromo.featuredTitles.brightspot")]} cta={heroT("eventPromo.featuredCta")} backdrops={bannerBackdrops} />
        <PrioritasDirectoryPanel
          spacing="section"
          headingId="event-directory-title"
          page={page}
          total={events.length}
          onPageChange={setPage}
          paginationLabel={t("eventDirectory.paginationLabel")}
          emptyMessage={t("eventDirectory.empty")}
          header={<>
            <h2 id="event-directory-title" className="sr-only">{t("tabs.event")}</h2>
            <PrioritasDirectoryCategories>
              {EVENT_CATEGORY_KEYS.map((key) => <button key={key} type="button" onClick={() => selectCategory(key)} aria-pressed={category === key} className={`flex h-12 shrink-0 items-center gap-3 rounded-xl border px-[18px] text-sm font-semibold transition-colors xl:h-14 xl:flex-1 xl:justify-center xl:px-4 xl:text-base ${category === key ? "border-pgold-500 bg-pgold-200 text-pbrown-600" : "border-neutral-300 bg-white text-neutral-800 hover:border-pgold-500 hover:text-pbrown-600"}`}><span aria-hidden className="size-6 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" style={{ maskImage: `url(/assets/prioritas/privilege/categories/${categoryIcons[key]}.svg)`, WebkitMaskImage: `url(/assets/prioritas/privilege/categories/${categoryIcons[key]}.svg)` }} />{t(`eventDirectory.categories.${key}`)}</button>)}
            </PrioritasDirectoryCategories>
            <PrioritasDirectoryFilters count={t("eventDirectory.showing", { count: events.length })}>
              <PrioritasDirectoryDropdown
                id="event-period-options"
                label={t("eventDirectory.period")}
                value={period}
                options={[
                  { value: "upcoming", label: t("eventDirectory.upcoming") },
                  { value: "all", label: t("eventDirectory.all") },
                  { value: "ended", label: t("eventDirectory.ended") },
                ]}
                onChange={(value) => { setPeriod(value as "upcoming" | "all" | "ended"); setPage(1); }}
                widthClassName="sm:w-56"
              />
            </PrioritasDirectoryFilters>
          </>}
        >
              {visibleEvents.map((event) => <PromoCard key={event.id} promo={event} now={new Date()} reveal={false} variant="prioritas" fill detail detailHref={`/prioritas/event/${event.id}`} eventDate={{ ...event.dateTile, expiredLabel: t("eventDateExpired") }} />)}
        </PrioritasDirectoryPanel>
      </div>
    </section>
  </main>;
}
