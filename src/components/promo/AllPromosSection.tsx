"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Promo, PromoCategory } from "@/components/home/promo-data";
import TextField from "@/components/ui/TextField";
import PromoCard from "./PromoCard";
import { PROMO_SEARCH_EVENT, type PromoSearchEventDetail } from "./promo-search-events";

type SortKey = "relevance" | "endingSoon" | "popular";
type AdvancedFilterKey = "location" | "product";

export type AllPromosCopy = {
  title: string;
  showCount: string;
  sort: string;
  relevance: string;
  endingSoon: string;
  popular: string;
  location: string;
  product: string;
  showMore: string;
  showLess: string;
  searchLocation: string;
  searchProduct: string;
  reset: string;
  apply: string;
  closeAdvanced: string;
  filter: string;
  noResults: string;
  clearFilters: string;
  previous: string;
  next: string;
  categories: Record<PromoCategory, string>;
};

const CATEGORY_ICONS: Partial<Record<PromoCategory, string>> = {
  fnb: "/assets/promo-page/categories/fnb.png",
  hobby: "/assets/promo-page/categories/hobby.png",
  entertainment: "/assets/promo-page/categories/entertainment.png",
  "health-beauty": "/assets/promo-page/categories/health-beauty.png",
  travel: "/assets/promo-page/categories/travel.png",
  ecommerce: "/assets/promo-page/categories/ecommerce.png",
  "fashion-shopping": "/assets/promo-page/categories/fashion-shopping.png",
  retail: "/assets/promo-page/categories/retail.png",
  telco: "/assets/promo-page/categories/telco.png",
  "home-electronics": "/assets/promo-page/categories/home-electronics.png",
  groceries: "/assets/promo-page/categories/groceries.png",
  "loyalty-reward": "/assets/category/reward.webp",
  others: "/assets/promo-page/categories/others.png",
};

const LOCATIONS = ["Jabodetabek", "Jakarta", "Surabaya", "Bandung", "Yogyakarta", "Medan", "Bali"];
const PRODUCTS = ["myBCA", "BCA mobile", "QRIS", "Sakuku", "Kartu Kredit BCA", "Flazz"];
const ADVANCED_LOCATIONS = [
  "Balikpapan",
  "Bali",
  "Banjarmasin",
  "Banten",
  "Batam",
  "Bandung",
  "Bekasi",
  "Bengkulu",
  "Bogor",
  "Depok",
  "Jabodetabek",
  "Jakarta",
  "Medan",
  "Semarang",
  "Surabaya",
  "Tangerang",
  "Yogyakarta",
];
const ADVANCED_PRODUCTS = [
  "BCA ID",
  "BCA mobile",
  "Debit BCA",
  "Flazz",
  "Kartu Kredit BCA",
  "KlikBCA",
  "myBCA",
  "QRIS",
  "Sakuku",
];
const PER_PAGE = 9;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

function SortIcon() {
  return (
    <span className="relative block size-6 shrink-0" aria-hidden>
      <img src="/assets/promo-page/controls/sort-left.svg" alt="" className="absolute left-[2px] top-[5px] h-[15px] w-[11px]" />
      <img src="/assets/promo-page/controls/sort-right.svg" alt="" className="absolute right-[2px] top-[4px] h-[15px] w-[11px] rotate-180" />
    </span>
  );
}

function toggleSetValue(current: Set<string>, item: string) {
  const next = new Set(current);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

function CheckList({
  title,
  icon,
  items,
  selected,
  open,
  onToggleOpen,
  onToggleItem,
  onOpenAdvanced,
  showMore,
}: {
  title: string;
  icon: string;
  items: string[];
  selected: Set<string>;
  open: boolean;
  onToggleOpen: () => void;
  onToggleItem: (item: string) => void;
  onOpenAdvanced: () => void;
  showMore: string;
}) {

  return (
    <fieldset className="border-t border-neutral-300">
      <legend className="sr-only">{title}</legend>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggleOpen}
        className="flex h-20 w-full items-center justify-between px-6 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center">
            <img src={icon} alt="" className="max-h-5 max-w-5" />
          </span>
          <span className="text-lg font-bold leading-[26px] text-blue-800">{title}</span>
        </div>
        <img
          src="/assets/promo-page/controls/chevron-up.svg"
          alt=""
          className={`h-[9px] w-[15px] transition-transform duration-300 ${open ? "" : "rotate-180"}`}
        />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 px-6">
            {items.slice(0, 5).map((item) => (
              <button
                key={item}
                type="button"
                role="checkbox"
                aria-checked={selected.has(item)}
                onClick={() => onToggleItem(item)}
                className="flex h-6 w-full cursor-pointer items-center gap-3 text-left text-base font-semibold leading-6 text-neutral-800"
              >
                <span className="relative size-6 shrink-0">
                  <img
                    src={selected.has(item) ? "/assets/promo-page/controls/checkbox-active.svg" : "/assets/promo-page/controls/checkbox.svg"}
                    alt=""
                    className="absolute left-0.5 top-0.5 size-5"
                  />
                </span>
                <span>{item}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={onOpenAdvanced} className="mx-6 mb-6 mt-8 h-5 px-0.5 text-base font-semibold leading-4 text-blue-500 hover:underline">
            {showMore}
          </button>
        </div>
      </div>
    </fieldset>
  );
}

function AdvancedFilterPanel({
  title,
  icon,
  items,
  initialSelected,
  searchPlaceholder,
  resetLabel,
  applyLabel,
  closeLabel,
  onClose,
  onApply,
}: {
  title: string;
  icon: string;
  items: string[];
  initialSelected: Set<string>;
  searchPlaceholder: string;
  resetLabel: string;
  applyLabel: string;
  closeLabel: string;
  onClose: () => void;
  onApply: (selected: Set<string>) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [draftSelected, setDraftSelected] = useState(() => new Set(initialSelected));
  const [panelExpanded, setPanelExpanded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPanelExpanded(true));
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const groups = useMemo(() => {
    const filteredItems = items
      .filter((item) => normalize(item).includes(normalize(search)))
      .sort((a, b) => a.localeCompare(b));
    return Object.entries(
      filteredItems.reduce<Record<string, string[]>>((result, item) => {
        const initial = item.charAt(0).toLocaleUpperCase();
        result[initial] ??= [];
        result[initial].push(item);
        return result;
      }, {})
    );
  }, [items, search]);

  return (
    <div
      role="dialog"
      aria-label={title}
      data-lenis-prevent
      className={`relative z-20 -ml-px flex h-[420px] w-[calc(100%+2px)] overflow-hidden border border-neutral-300 bg-white transition-[width] duration-300 ease-out xl:rounded-r-3xl ${panelExpanded ? "xl:w-[560px]" : "xl:w-[302px]"}`}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-20 shrink-0 items-center gap-3 px-6">
          <span className="flex size-6 shrink-0 items-center justify-center">
            <img src={icon} alt="" className="max-h-5 max-w-5" />
          </span>
          <h3 className="text-lg font-bold leading-[26px] text-blue-800">{title}</h3>
          {draftSelected.size > 0 && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-300 text-sm font-bold text-blue-500">
              {draftSelected.size}
            </span>
          )}
          <button type="button" aria-label={closeLabel} onClick={onClose} className="ml-auto flex size-8 items-center justify-center">
            <img src="/assets/promo-page/controls/close.svg" alt="" className="h-[13px] w-[13px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <div>
              <TextField
                label={searchPlaceholder}
                hideLabel
                inputRef={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                leadingIcon={<img src="/assets/promo-page/controls/search.svg" alt="" className="h-[18px] w-[18px]" />}
              />
            </div>

            {draftSelected.size > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from(draftSelected).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDraftSelected((current) => toggleSetValue(current, item))}
                    className="flex h-12 items-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 text-base font-semibold text-neutral-800"
                  >
                    <span>{item}</span>
                    <span className="flex size-5 items-center justify-center">
                      <img src="/assets/promo-page/controls/chip-close.svg" alt="" className="h-[11px] w-[11px]" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-6">
              {groups.map(([initial, groupItems]) => (
                <section key={initial} aria-labelledby={`filter-group-${title}-${initial}`}>
                  <h4 id={`filter-group-${title}-${initial}`} className="text-base font-bold text-blue-800">{initial}</h4>
                  <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-y-6">
                    {groupItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        role="checkbox"
                        aria-checked={draftSelected.has(item)}
                        onClick={() => setDraftSelected((current) => toggleSetValue(current, item))}
                        className="flex h-6 min-w-0 items-center gap-3 text-left text-base font-semibold text-neutral-800"
                      >
                        <img
                          src={draftSelected.has(item) ? "/assets/promo-page/controls/checkbox-active.svg" : "/assets/promo-page/controls/checkbox.svg"}
                          alt=""
                          className="size-5 shrink-0"
                        />
                        <span className="truncate">{item}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
        </div>

        <div className="flex h-16 shrink-0 items-center justify-between bg-white px-6 shadow-panel-footer">
          <button type="button" onClick={() => setDraftSelected(new Set())} className="text-sm font-semibold text-blue-500 hover:underline">
            {resetLabel}
          </button>
          <button type="button" onClick={() => onApply(draftSelected)} className="btn-base btn-primary h-10 px-6 py-2 text-sm">
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllPromosSection({ promos, now, copy, initialQuery = "", initialCategory = "all" }: { promos: Promo[]; now: Date; copy: AllPromosCopy; initialQuery?: string; initialCategory?: PromoCategory | "all" }) {
  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoryScrollHistoryRef = useRef<number[]>([0]);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<PromoCategory | "all">(initialCategory);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);
  const [advancedFilter, setAdvancedFilter] = useState<AdvancedFilterKey | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(() => new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const onSearch = (event: Event) => {
      const { query: nextQuery, category: nextCategory } = (event as CustomEvent<PromoSearchEventDetail>).detail;
      setQuery(nextQuery);
      setCategory(nextCategory);
      setPage(1);
    };
    window.addEventListener(PROMO_SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(PROMO_SEARCH_EVENT, onSearch);
  }, []);

  const filtered = useMemo(() => {
    const keyword = normalize(query);
    const result = promos.filter((promo) => category === "all" || promo.category === category).filter((promo) => !keyword || normalize(`${promo.title} ${promo.brand} ${copy.categories[promo.category]}`).includes(keyword));
    return result.sort((a, b) => {
      if (sort === "endingSoon") return a.endAt.getTime() - b.endAt.getTime();
      if (sort === "popular") return (b.redeemCount ?? 0) - (a.redeemCount ?? 0);
      const aScore = (a.redeemCount ?? 0) + (normalize(a.title).includes(keyword) ? 10_000 : 0);
      const bScore = (b.redeemCount ?? 0) + (normalize(b.title).includes(keyword) ? 10_000 : 0);
      return bScore - aScore;
    });
  }, [category, copy.categories, promos, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const moveCategories = (direction: -1 | 1) => {
    const list = categoriesRef.current;
    if (!list) return;
    const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth);

    if (direction === -1) {
      const history = categoryScrollHistoryRef.current;
      if (history.length > 1) history.pop();
      list.scrollTo({ left: history.at(-1) ?? 0, behavior: "smooth" });
      return;
    }

    const listRect = list.getBoundingClientRect();
    const cards = Array.from(list.children) as HTMLElement[];
    const lastVisible = cards.findLast((card) => card.getBoundingClientRect().left < listRect.right - 1);
    if (!lastVisible) return;

    const lastVisibleRect = lastVisible.getBoundingClientRect();
    const target = Math.min(
      maxScroll,
      list.scrollLeft
        + lastVisibleRect.left
        - listRect.left
        - (list.clientWidth - lastVisibleRect.width) / 2
    );
    if (target <= list.scrollLeft + 1) return;
    categoryScrollHistoryRef.current.push(target);
    list.scrollTo({ left: target, behavior: "smooth" });
  };
  const clear = () => {
    setQuery("");
    setCategory("all");
    setSort("relevance");
    setPage(1);
  };

  return (
    <section id="all-promos" className="bg-blue-100 py-12 xl:py-20" aria-labelledby="all-promos-title">
      <div className="mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        <h2 id="all-promos-title" className="text-[28px] font-bold leading-7 tracking-[-0.02em] text-blue-500">{copy.title}</h2>

        <div className="relative mt-8 flex h-16 items-center">
          <button type="button" aria-label={copy.previous} onClick={() => moveCategories(-1)} className="absolute left-2 z-10 flex size-10 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/30">
            <span className="flex size-6 items-center justify-center">
              <img src="/assets/promo-page/controls/category-chevron.svg" alt="" className="h-[15px] w-[9px]" />
            </span>
          </button>
          <div
            ref={categoriesRef}
            data-lenis-prevent
            className="hide-scrollbar mx-12 flex h-16 min-w-0 flex-1 gap-3 overflow-x-auto xl:mx-[72px]"
            style={{
              scrollbarWidth: "none",
              maskImage: "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
            }}
          >
            {(Object.keys(copy.categories) as PromoCategory[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={category === key}
                onClick={() => { setCategory((current) => current === key ? "all" : key); setPage(1); }}
                className={`flex h-16 shrink-0 items-center gap-4 rounded-xl border p-4 text-base leading-6 transition-colors ${category === key ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500" : "border-neutral-300 bg-white font-semibold text-neutral-700 hover:border-cyan-500 hover:bg-cyan-100 hover:text-blue-500"}`}
              >
                <img src={CATEGORY_ICONS[key]} alt="" className="size-8 shrink-0 object-contain" />
                <span className="whitespace-nowrap">{copy.categories[key]}</span>
              </button>
            ))}
          </div>
          <button type="button" aria-label={copy.next} onClick={() => moveCategories(1)} className="absolute right-2 z-10 flex size-10 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/30">
            <span className="flex size-6 items-center justify-center">
              <img src="/assets/promo-page/controls/category-chevron.svg" alt="" className="h-[15px] w-[9px] rotate-180" />
            </span>
          </button>
        </div>

        <div className="mt-10 flex flex-col items-start gap-6 xl:flex-row">
          <div className={`${filtersOpen ? "block" : "hidden"} relative z-10 w-full xl:block xl:w-[302px] xl:shrink-0`}>
            <aside className="w-full overflow-visible rounded-3xl border border-neutral-300 bg-white">
              <div className="p-6">
                <div className="flex h-8 items-center gap-3">
                  <SortIcon />
                  <label htmlFor="promo-sort" className="text-lg font-bold leading-[26px] text-blue-800">{copy.sort}</label>
                </div>
                <div className="relative mt-4 h-14">
                  <select id="promo-sort" value={sort} onChange={(event) => { setSort(event.target.value as SortKey); setPage(1); }} className="size-full appearance-none rounded-xl border border-neutral-300 bg-neutral-200 px-4 pr-12 text-base font-semibold text-neutral-700 outline-none focus:border-blue-500">
                    <option value="relevance">{copy.relevance}</option>
                    <option value="endingSoon">{copy.endingSoon}</option>
                    <option value="popular">{copy.popular}</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex w-6 items-center justify-center">
                    <img src="/assets/promo-page/controls/chevron-down.svg" alt="" className="h-[9px] w-[15px]" />
                  </span>
                </div>
              </div>
              {advancedFilter === "location" ? (
              <AdvancedFilterPanel
                key="location"
                title={copy.location}
                icon="/assets/promo-page/controls/pin.svg"
                items={ADVANCED_LOCATIONS}
                initialSelected={selectedLocations}
                searchPlaceholder={copy.searchLocation}
                resetLabel={copy.reset}
                applyLabel={copy.apply}
                closeLabel={copy.closeAdvanced}
                onClose={() => setAdvancedFilter(null)}
                onApply={(selected) => {
                  setSelectedLocations(new Set(selected));
                  setAdvancedFilter(null);
                }}
              />
              ) : (
                <CheckList
                  title={copy.location}
                  icon="/assets/promo-page/controls/pin.svg"
                  items={LOCATIONS}
                  selected={selectedLocations}
                  open={locationsOpen}
                  onToggleOpen={() => setLocationsOpen((value) => !value)}
                  onToggleItem={(item) => setSelectedLocations((current) => toggleSetValue(current, item))}
                  onOpenAdvanced={() => setAdvancedFilter("location")}
                  showMore={copy.showMore}
                />
              )}

              {advancedFilter === "product" ? (
                <AdvancedFilterPanel
                  key="product"
                  title={copy.product}
                  icon="/assets/promo-page/controls/product.svg"
                  items={ADVANCED_PRODUCTS}
                  initialSelected={selectedProducts}
                  searchPlaceholder={copy.searchProduct}
                  resetLabel={copy.reset}
                  applyLabel={copy.apply}
                  closeLabel={copy.closeAdvanced}
                  onClose={() => setAdvancedFilter(null)}
                  onApply={(selected) => {
                    setSelectedProducts(new Set(selected));
                    setAdvancedFilter(null);
                  }}
                />
              ) : (
                <CheckList
                  title={copy.product}
                  icon="/assets/promo-page/controls/product.svg"
                  items={PRODUCTS}
                  selected={selectedProducts}
                  open={productsOpen}
                  onToggleOpen={() => setProductsOpen((value) => !value)}
                  onToggleItem={(item) => setSelectedProducts((current) => toggleSetValue(current, item))}
                  onOpenAdvanced={() => setAdvancedFilter("product")}
                  showMore={copy.showMore}
                />
              )}
            </aside>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-700">{copy.showCount.replace("{shown}", String(pageItems.length)).replace("{total}", String(filtered.length))}</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="btn-base btn-secondary px-5 py-2 xl:hidden">{copy.filter}</button>
                <nav aria-label={copy.title} className="flex h-10 items-center gap-2">
                  <button type="button" disabled={page === 1} aria-label={copy.previous} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex size-8 items-center justify-center rounded-full bg-white disabled:opacity-40">
                    <span
                      aria-hidden
                      className="h-[15px] w-[9px] bg-blue-500"
                      style={{
                        mask: "url(/assets/promo-page/controls/category-chevron.svg) center / contain no-repeat",
                        WebkitMask: "url(/assets/promo-page/controls/category-chevron.svg) center / contain no-repeat",
                      }}
                    />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                    <button
                      key={number}
                      type="button"
                      aria-current={page === number ? "page" : undefined}
                      onClick={() => setPage(number)}
                      className={`size-8 rounded text-sm font-bold ${page === number ? "border border-cyan-500 bg-blue-200 text-blue-500" : "bg-neutral-200 text-neutral-600"}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button type="button" disabled={page === totalPages} aria-label={copy.next} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex size-8 items-center justify-center rounded-full bg-white disabled:opacity-40">
                    <span
                      aria-hidden
                      className="h-[15px] w-[9px] rotate-180 bg-blue-500"
                      style={{
                        mask: "url(/assets/promo-page/controls/category-chevron.svg) center / contain no-repeat",
                        WebkitMask: "url(/assets/promo-page/controls/category-chevron.svg) center / contain no-repeat",
                      }}
                    />
                  </button>
                </nav>
              </div>
            </div>

            {pageItems.length > 0 ? (
              <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((promo) => <PromoCard key={promo.id} promo={promo} now={now} reveal={false} />)}
              </div>
            ) : (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-card">
                <p className="text-base font-semibold text-neutral-800">{copy.noResults}</p>
                <button type="button" onClick={clear} className="btn-base btn-primary mt-5">{copy.clearFilters}</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
