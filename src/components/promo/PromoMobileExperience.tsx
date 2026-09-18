"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import EventSlider from "@/components/home/EventSlider";
import type { Promo, PromoCategory } from "@/components/home/promo-data";
import PromoCard from "./PromoCard";
import PromoCarousel from "./PromoCarousel";

const PROMOS_PER_PAGE = 6;

type SortOption = "relevance" | "endingSoon" | "popular";
type DrawerMode = "filter" | "sort" | null;

const CITY_OPTIONS = [
  ["national", "National"],
  ["jabodetabek", "Jabodetabek"],
  ["jakarta", "Jakarta"],
  ["bandung", "Bandung"],
  ["bogor", "Bogor"],
  ["surabaya", "Surabaya"],
  ["medan", "Medan"],
  ["bali", "Bali"],
] as const;

const BCA_PRODUCT_OPTIONS = [
  ["mybca", "myBCA"],
  ["bca-mobile", "BCA mobile"],
  ["qris", "QRIS"],
  ["sakuku", "Sakuku"],
  ["kartu-kredit-bca", "Kartu Kredit BCA"],
  ["kartu-debit-bca", "Kartu Debit BCA"],
  ["paylater", "Paylater"],
  ["virtual-account", "Virtual Account"],
  ["reward-bca", "Reward BCA"],
  ["flazz", "Flazz"],
  ["klikbca", "KlikBCA"],
  ["atm-bca", "ATM BCA"],
  ["edc-bca", "EDC BCA"],
  ["kpr-bca", "KPR BCA"],
  ["investasi", "Investasi"],
  ["bancassurance", "Bancassurance"],
  ["valas", "Valas"],
  ["ksm-bca", "KSM BCA"],
  ["kkb-bca", "KKB BCA"],
  ["tahapan-berjangka-bca", "Tahapan Berjangka BCA"],
  ["merchant-bca", "Merchant BCA"],
  ["nfc-pay", "NFC Pay"],
] as const;

type CityFilter = (typeof CITY_OPTIONS)[number][0];
type ProductFilter = (typeof BCA_PRODUCT_OPTIONS)[number][0];

const PROMO_FILTER_FACETS: Partial<Record<string, { cities: CityFilter[]; products: ProductFilter[] }>> = {
  "cashback-mybca": { cities: ["national"], products: ["mybca", "bca-mobile", "reward-bca"] },
  "diskon-ebiga": { cities: ["jabodetabek", "jakarta", "bandung"], products: ["qris", "kartu-kredit-bca", "kartu-debit-bca"] },
  "presale-musikal": { cities: ["jabodetabek", "jakarta"], products: ["mybca", "kartu-kredit-bca"] },
  "voucher-tiket": { cities: ["national"], products: ["mybca", "kartu-kredit-bca", "paylater"] },
  "bluebird-javajazz": { cities: ["jabodetabek", "jakarta", "bogor"], products: ["mybca", "bca-mobile", "kartu-kredit-bca"] },
  "garuda-potongan": { cities: ["national"], products: ["kartu-kredit-bca", "kartu-debit-bca"] },
  "lunas-doughnuts": { cities: ["jabodetabek", "jakarta", "bogor"], products: ["qris", "kartu-kredit-bca", "kartu-debit-bca"] },
};

function getPromoFilterFacets(promo: Promo) {
  return PROMO_FILTER_FACETS[promo.id] ?? {
    cities: ["national" as CityFilter],
    products: ["kartu-kredit-bca" as ProductFilter],
  };
}

function FilterIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <path d="M4 5h16l-6.2 7.1v5.2l-3.6 1.8v-7L4 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <path d="M8 5v14m0 0-3.5-3.5M8 19l3.5-3.5M16 19V5m0 0-3.5 3.5M16 5l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path d={direction === "left" ? "m14.5 6-6 6 6 6" : "m9.5 6 6 6-6 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <circle cx="10.8" cy="10.8" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="m15.3 15.3 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FilterCheckbox({ checked, label, onClick, compact = false }: { checked: boolean; label: string; onClick: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className={compact
        ? `flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${checked ? "border-blue-500 bg-blue-100 text-blue-700" : "border-neutral-300 bg-white text-neutral-700 hover:bg-blue-100"}`
        : "flex w-full items-center gap-4 py-2 text-left text-base text-neutral-800"}
    >
      <span className={`flex size-6 shrink-0 items-center justify-center rounded border-2 ${checked ? "border-blue-500 bg-blue-500 text-white" : "border-blue-500 bg-white"}`}>
        {checked && <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function PromoMobileExperience({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("promoPage");
  const categories = Object.keys(t.raw("categories")) as PromoCategory[];
  const locations = t.raw("locationPromo.locations") as string[];
  const [selectedLocation, setSelectedLocation] = useState(locations[0] ?? t("locationPromo.defaultLocation"));
  const [selectedCategories, setSelectedCategories] = useState<PromoCategory[]>([]);
  const [draftCategories, setDraftCategories] = useState<PromoCategory[]>([]);
  const [selectedCities, setSelectedCities] = useState<CityFilter[]>([]);
  const [draftCities, setDraftCities] = useState<CityFilter[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductFilter[]>([]);
  const [draftProducts, setDraftProducts] = useState<ProductFilter[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [draftSort, setDraftSort] = useState<SortOption>("relevance");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [page, setPage] = useState(1);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerMode && !dialog.open) dialog.showModal();
    if (!drawerMode && dialog.open) dialog.close();
  }, [drawerMode]);

  const filteredPromos = useMemo(() => {
    const filtered = promos.filter((promo) => {
      const facets = getPromoFilterFacets(promo);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(promo.category);
      const matchesCity = !selectedCities.length || selectedCities.some((city) => facets.cities.includes(city));
      const matchesProduct = !selectedProducts.length || selectedProducts.some((product) => facets.products.includes(product));
      return matchesCategory && matchesCity && matchesProduct;
    });

    if (sort === "endingSoon") {
      return filtered.sort((a, b) => a.endAt.getTime() - b.endAt.getTime());
    }
    if (sort === "popular") {
      return filtered.sort((a, b) => (b.redeemCount ?? 0) - (a.redeemCount ?? 0));
    }
    return filtered;
  }, [promos, selectedCategories, selectedCities, selectedProducts, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPromos.length / PROMOS_PER_PAGE));
  const visiblePromos = filteredPromos.slice((page - 1) * PROMOS_PER_PAGE, page * PROMOS_PER_PAGE);
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

  const openFilter = () => {
    setDraftCategories(selectedCategories);
    setDraftCities(selectedCities);
    setDraftProducts(selectedProducts);
    setCityQuery("");
    setProductQuery("");
    setCitySearchOpen(false);
    setProductSearchOpen(false);
    setDrawerMode("filter");
  };

  const openSort = () => {
    setDraftSort(sort);
    setDrawerMode("sort");
  };

  const toggleDraftCategory = (category: PromoCategory) => {
    setDraftCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  };

  const toggleDraftCity = (city: CityFilter) => {
    setDraftCities((current) => current.includes(city)
      ? current.filter((item) => item !== city)
      : [...current, city]);
  };

  const toggleDraftProduct = (product: ProductFilter) => {
    setDraftProducts((current) => current.includes(product)
      ? current.filter((item) => item !== product)
      : [...current, product]);
  };

  const normalizedCityQuery = cityQuery.trim().toLocaleLowerCase();
  const filteredCityOptions = CITY_OPTIONS.filter(([, label]) => label.toLocaleLowerCase().includes(normalizedCityQuery));
  const visibleCityOptions = normalizedCityQuery || showAllCities ? filteredCityOptions : filteredCityOptions.slice(0, 5);
  const normalizedProductQuery = productQuery.trim().toLocaleLowerCase();
  const filteredProductOptions = BCA_PRODUCT_OPTIONS.filter(([, label]) => label.toLocaleLowerCase().includes(normalizedProductQuery));
  const activeFilterCount = selectedCategories.length + selectedCities.length + selectedProducts.length;
  const activeFilterChips = [
    ...selectedCategories.map((key) => ({
      id: `category-${key}`,
      label: t(`categories.${key}`),
      remove: () => setSelectedCategories((current) => current.filter((item) => item !== key)),
    })),
    ...selectedCities.map((key) => ({
      id: `city-${key}`,
      label: CITY_OPTIONS.find(([option]) => option === key)?.[1] ?? key,
      remove: () => setSelectedCities((current) => current.filter((item) => item !== key)),
    })),
    ...selectedProducts.map((key) => ({
      id: `product-${key}`,
      label: BCA_PRODUCT_OPTIONS.find(([option]) => option === key)?.[1] ?? key,
      remove: () => setSelectedProducts((current) => current.filter((item) => item !== key)),
    })),
  ];

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    document.querySelector("#semua-promo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedCategories([key]);
                  setPage(1);
                  document.querySelector("#semua-promo")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex size-[72px] shrink-0 flex-col items-center gap-2 text-center"
              >
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

      <section className="bg-blue-100 py-6">
        <div className="px-6">
          <p className="text-sm font-normal tracking-normal text-neutral-800">{t("locationPromo.eyebrow")}</p>
          <div className="relative mt-1 w-fit">
            <label htmlFor="popular-promo-location" className="sr-only">{t("locationPromo.selectLabel")}</label>
            <select
              id="popular-promo-location"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="max-w-full appearance-none bg-transparent pr-10 text-heading text-blue-500 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
            <svg aria-hidden viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-1 top-1/2 size-6 -translate-y-1/2 text-blue-500">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div data-lenis-prevent className="hide-scrollbar -mb-3 mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-8 py-3 [scrollbar-width:none]">
          {promos.slice(3, 6).map((promo) => <div key={`${selectedLocation}-${promo.id}`} className="snap-start"><PromoCard promo={promo} now={now} reveal={false} /></div>)}
        </div>
      </section>

      <section id="semua-promo" className="scroll-mt-20 bg-neutral-100 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-heading text-blue-700">{t("allPromos.title")}</h2>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={openFilter}
              aria-haspopup="dialog"
              className="flex h-14 min-w-0 flex-1 items-center justify-center gap-3 rounded-[20px] border border-neutral-300 bg-white px-5 text-lg font-semibold text-neutral-700 shadow-card transition-[border-color,background-color,transform] active:scale-[0.98] hover:border-neutral-500 hover:bg-blue-100 sm:max-w-[260px]"
            >
              <FilterIcon />
              <span>{t("allPromos.filter")}</span>
              {activeFilterCount > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white" aria-label={t("allPromos.activeFilters", { count: activeFilterCount })}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openSort}
              aria-haspopup="dialog"
              aria-label={t("allPromos.sort")}
              className="flex size-14 shrink-0 items-center justify-center rounded-[20px] border border-neutral-300 bg-white text-neutral-700 shadow-card transition-[border-color,background-color,transform] active:scale-[0.98] hover:border-neutral-500 hover:bg-blue-100"
            >
              <SortIcon />
            </button>
          </div>

          {activeFilterChips.length > 0 && (
            <div data-lenis-prevent className="hide-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label={t("allPromos.activeFilterList")}>
              {activeFilterChips.map((chip) => (
                <span key={chip.id} className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-blue-100 pl-4 pr-2 text-sm font-semibold text-blue-700">
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      chip.remove();
                      setPage(1);
                    }}
                    aria-label={t("allPromos.removeFilter", { filter: chip.label })}
                    className="flex size-6 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-200"
                  >
                    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-3.5">
                      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="mt-5 text-sm text-neutral-600">{t("allPromos.showCount", { shown: filteredPromos.length, total: promos.length })}</p>
          {visiblePromos.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
              {visiblePromos.map((promo) => <PromoCard key={promo.id} promo={promo} now={now} reveal={false} compact />)}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-white px-5 py-8 text-center shadow-card">
              <p className="font-semibold text-neutral-800">{t("allPromos.noResults")}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedCities([]);
                  setSelectedProducts([]);
                  setPage(1);
                }}
                className="mt-4 text-sm font-semibold text-blue-500 underline underline-offset-4"
              >
                {t("allPromos.clearFilters")}
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label={t("allPromos.paginationLabel")} className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label={t("common.previous")}
                className="flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-blue-500 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:opacity-50"
              >
                <ChevronIcon direction="left" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  aria-label={t("allPromos.page", { page: pageNumber })}
                  aria-current={page === pageNumber ? "page" : undefined}
                  className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${page === pageNumber ? "bg-blue-500 text-white" : "border border-neutral-300 bg-white text-neutral-700 hover:bg-blue-100"}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label={t("common.next")}
                className="flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-blue-500 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:opacity-50"
              >
                <ChevronIcon direction="right" />
              </button>
            </nav>
          )}
        </div>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => setDrawerMode(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        aria-labelledby="promo-drawer-title"
        className="fixed bottom-0 left-1/2 top-auto m-0 max-h-[80dvh] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-t-3xl bg-white p-0 text-neutral-800 shadow-panel backdrop:bg-blue-800/60 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-neutral-300" />
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <h2 id="promo-drawer-title" className="text-title text-blue-700">
            {drawerMode === "filter" ? t("allPromos.filterTitle") : t("allPromos.sortTitle")}
          </h2>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t("allPromos.closeAdvanced")} className="flex size-10 items-center justify-center rounded-full text-neutral-700 hover:bg-blue-100">
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {drawerMode === "filter" ? (
          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            <p className="mb-3 text-sm font-semibold text-neutral-700">{t("allPromos.category")}</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const checked = draftCategories.includes(category);
                return (
                  <FilterCheckbox
                    key={category}
                    checked={checked}
                    label={t(`categories.${category}`)}
                    onClick={() => toggleDraftCategory(category)}
                    compact
                  />
                );
              })}
            </div>

            <section className="mt-6 border-t border-neutral-300 pt-5">
              <div className="flex items-center gap-3 text-blue-500">
                <LocationIcon />
                <h3 className="text-title flex-1">{t("allPromos.location")}</h3>
                <button
                  type="button"
                  onClick={() => setCitySearchOpen((open) => !open)}
                  aria-label={t("allPromos.searchLocation")}
                  aria-expanded={citySearchOpen}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-blue-100"
                >
                  <SearchIcon />
                </button>
              </div>
              {citySearchOpen && (
                <label className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-neutral-300 px-3 text-neutral-600 focus-within:border-blue-500">
                  <SearchIcon />
                  <span className="sr-only">{t("allPromos.searchLocation")}</span>
                  <input
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder={t("allPromos.searchLocation")}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                  />
                </label>
              )}
              <div className="mt-2">
                {visibleCityOptions.map(([key, label]) => (
                  <FilterCheckbox key={key} checked={draftCities.includes(key)} label={label} onClick={() => toggleDraftCity(key)} />
                ))}
              </div>
              {!normalizedCityQuery && filteredCityOptions.length > 5 && (
                <button type="button" onClick={() => setShowAllCities((shown) => !shown)} className="mt-2 pl-10 text-sm font-semibold text-blue-500">
                  {t(showAllCities ? "allPromos.showLess" : "allPromos.showMore")}
                </button>
              )}
            </section>

            <section className="mt-6 border-t border-neutral-300 pt-5">
              <div className="flex items-center gap-3 text-blue-500">
                <ProductIcon />
                <h3 className="text-title flex-1">{t("allPromos.product")}</h3>
                <button
                  type="button"
                  onClick={() => setProductSearchOpen((open) => !open)}
                  aria-label={t("allPromos.searchProduct")}
                  aria-expanded={productSearchOpen}
                  className="flex size-10 items-center justify-center rounded-full hover:bg-blue-100"
                >
                  <SearchIcon />
                </button>
              </div>
              {productSearchOpen && (
                <label className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-neutral-300 px-3 text-neutral-600 focus-within:border-blue-500">
                  <SearchIcon />
                  <span className="sr-only">{t("allPromos.searchProduct")}</span>
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder={t("allPromos.searchProduct")}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none"
                  />
                </label>
              )}
              <div className="mt-2">
                {filteredProductOptions.map(([key, label]) => (
                  <FilterCheckbox key={key} checked={draftProducts.includes(key)} label={label} onClick={() => toggleDraftProduct(key)} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="px-5 pb-5">
            {(["relevance", "endingSoon", "popular"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={draftSort === option}
                onClick={() => setDraftSort(option)}
                className="flex w-full items-center justify-between border-b border-neutral-300 py-4 text-left font-semibold text-neutral-700 last:border-b-0"
              >
                <span>{t(`allPromos.${option}`)}</span>
                <span className={`flex size-5 items-center justify-center rounded-full border-2 ${draftSort === option ? "border-blue-500" : "border-neutral-500"}`}>
                  {draftSort === option && <span className="size-2.5 rounded-full bg-blue-500" />}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex shrink-0 gap-3 border-t border-neutral-300 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 shadow-panel-footer">
          <button
            type="button"
            onClick={() => {
              if (drawerMode === "filter") {
                setDraftCategories([]);
                setDraftCities([]);
                setDraftProducts([]);
              } else {
                setDraftSort("relevance");
              }
            }}
            className="btn-base btn-secondary flex-1"
          >
            {t("allPromos.reset")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (drawerMode === "filter") {
                setSelectedCategories(draftCategories);
                setSelectedCities(draftCities);
                setSelectedProducts(draftProducts);
              }
              if (drawerMode === "sort") setSort(draftSort);
              setPage(1);
              dialogRef.current?.close();
            }}
            className="btn-base btn-primary flex-1"
          >
            {t("allPromos.apply")}
          </button>
        </div>
      </dialog>
    </>
  );
}
