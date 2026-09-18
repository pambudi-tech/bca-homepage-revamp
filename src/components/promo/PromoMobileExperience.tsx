"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import EventSlider from "@/components/home/EventSlider";
import type { Promo, PromoCategory } from "@/components/home/promo-data";
import PromoCard from "./PromoCard";
import PromoCarousel from "./PromoCarousel";

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <circle cx="10.8" cy="10.8" r="5.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.2 15.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function PromoMobileExperience({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("promoPage");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PromoCategory | "all">("all");
  const categories = Object.keys(t.raw("categories")) as PromoCategory[];
  const locations = t.raw("locationPromo.locations") as string[];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredPromos = useMemo(
    () => promos.filter((promo) =>
      (category === "all" || promo.category === category) &&
      (!normalizedQuery || `${promo.title} ${promo.brand}`.toLocaleLowerCase().includes(normalizedQuery)),
    ),
    [category, normalizedQuery, promos],
  );
  const endingSoon = [...promos]
    .sort((a, b) => a.endAt.getTime() - b.endAt.getTime())
    .slice(0, 3);

  const heroCategories = [
    ["fnb", "kuliner"],
    ["hobby", "hobby"],
    ["entertainment", "entertainment"],
    ["health-beauty", "health"],
    ["travel", "travel"],
    ["telco", "telco"],
    ["ecommerce", "ecommerce"],
    ["fashion-shopping", "fashion"],
    ["retail", "retail"],
    ["home-electronics", "home"],
    ["groceries", "groceries"],
  ] as const satisfies readonly (readonly [PromoCategory, string])[];

  return (
    <>
      <div className="relative overflow-clip bg-gradient-to-b from-blue-700 via-blue-500 to-blue-400">
        <img
          src="/assets/footer/footer-clove-pattern.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[440px] -top-[530px] h-[1030px] w-[1410px] max-w-none opacity-35 mix-blend-multiply"
        />
        <section className="relative overflow-clip bg-transparent pb-11 pt-[calc(5rem+env(safe-area-inset-top))] text-white">
          <h1 className="sr-only">{t("hero.title")}</h1>
          <div className="px-4">
            <EventSlider />
          </div>
        </section>
      </div>

      <div className="relative z-10 -mt-5 rounded-t-[20px] bg-blue-100">
        <section className="py-6">
          <div data-lenis-prevent className="hide-scrollbar flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {heroCategories.map(([key, label]) => (
              <button key={key} type="button" onClick={() => setCategory(key)} className="flex size-[72px] shrink-0 flex-col items-center gap-2 text-center">
                <img src={`/assets/promo-page/categories/${key}.png`} alt="" className="size-10 shrink-0 object-contain" />
                <span className="w-full truncate text-sm font-semibold leading-4 text-neutral-800">{t(`categoryRail.${label}`)}</span>
              </button>
            ))}
          </div>
        </section>

      <section className="relative isolate bg-blue-100 py-8 sm:py-12">
        <div className="relative z-10">
          <PromoCarousel
            promos={promos.slice(0, 7)}
            now={now}
            campaignCover="/assets/promo-page/campaigns/ramadan-diskon-besar.png"
            campaignAlt={t("seasonal.discount")}
          />
        </div>
      </section>
      </div>

      <section id="semua-promo" className="scroll-mt-20 bg-neutral-100 px-4 py-12">
        <h2 className="text-heading text-blue-700">{t("allPromos.title")}</h2>
        <label className="mt-6 flex h-12 items-center gap-3 rounded-2xl border border-neutral-300 bg-white px-4 text-neutral-600 shadow-card focus-within:border-cyan-500">
          <SearchIcon />
          <span className="sr-only">{t("search.label")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search.prompt")} className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-600" />
        </label>
        <div data-lenis-prevent className="hide-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button type="button" onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${category === "all" ? "bg-blue-500 text-white" : "border border-neutral-300 bg-white text-neutral-700"}`}>
            {t("search.allCategories")}
          </button>
          {categories.map((key) => (
            <button key={key} type="button" onClick={() => setCategory(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${category === key ? "bg-blue-500 text-white" : "border border-neutral-300 bg-white text-neutral-700"}`}>
              {t(`categories.${key}`)}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm text-neutral-600">{t("allPromos.showCount", { shown: filteredPromos.length, total: promos.length })}</p>
        {filteredPromos.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filteredPromos.map((promo) => <PromoCard key={promo.id} promo={promo} now={now} reveal={false} compact />)}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl bg-white px-5 py-8 text-center shadow-card">
            <p className="font-semibold text-neutral-800">{t("search.noResults")}</p>
            <p className="mt-1 text-sm text-neutral-600">{t("search.noResultsHint")}</p>
          </div>
        )}
      </section>

      <section className="bg-blue-100 py-12">
        <div className="px-4">
          <p className="text-eyebrow text-blue-500">{t("locationPromo.eyebrow")}</p>
          <h2 className="text-heading mt-2 text-blue-700">{locations[0] ?? t("locationPromo.defaultLocation")}</h2>
        </div>
        <div data-lenis-prevent className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
          {promos.slice(3, 6).map((promo) => <div key={promo.id} className="snap-start"><PromoCard promo={promo} now={now} reveal={false} /></div>)}
        </div>
      </section>

      <section className="bg-neutral-100 py-12">
        <div className="px-4">
          <h2 className="text-heading text-blue-700">{t("endingSoon.title")}</h2>
          <p className="mt-2 text-sm text-neutral-600">{t("endingSoon.description")}</p>
        </div>
        <div data-lenis-prevent className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
          {endingSoon.map((promo) => <div key={promo.id} className="snap-start"><PromoCard promo={promo} now={now} reveal={false} /></div>)}
        </div>
      </section>
    </>
  );
}
