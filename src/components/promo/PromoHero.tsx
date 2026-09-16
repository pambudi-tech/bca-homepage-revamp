"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import SearchPlaceholderCarousel from "@/components/home/SearchPlaceholderCarousel";
import type { PromoCategory } from "@/components/home/promo-data";
import { useIsLive } from "@/lib/useIsLive";
import { announcePromoSearch } from "./promo-search-events";

export type PromoSearchItem = {
  id: string;
  title: string;
  brand: string;
  cover: string;
  category: PromoCategory;
  redeemCount: number;
};

export type PromoHeroCopy = {
  eyebrow: string;
  title: string;
  cta: string;
  imageAlt: string;
  searchPrompt: string;
  searchLabel: string;
  allCategories: string;
  categories: Record<PromoCategory, string>;
  placeholders: string[];
  popularPromos: string;
  results: string;
  noResults: string;
  noResultsHint: string;
  categoryLabel: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

export default function PromoHero({
  copy,
  promos,
  initialQuery = "",
  initialCategory = "all",
}: {
  copy: PromoHeroCopy;
  promos: PromoSearchItem[];
  initialQuery?: string;
  initialCategory?: PromoCategory | "all";
}) {
  const rootRef = useRef<HTMLElement>(null);
  const searchRootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = useIsLive(rootRef);
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<PromoCategory | "all">(initialCategory);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const searchActive = searchFocused || categoryOpen;

  const availableCategories = useMemo(
    () => Array.from(new Set(promos.map((promo) => promo.category))),
    [promos]
  );

  const filteredPromos = useMemo(() => {
    const keyword = normalize(query);
    return promos
      .filter((promo) => selectedCategory === "all" || promo.category === selectedCategory)
      .filter((promo) => {
        if (!keyword) return true;
        return normalize(`${promo.title} ${promo.brand} ${copy.categories[promo.category]}`).includes(keyword);
      })
      .sort((a, b) => b.redeemCount - a.redeemCount);
  }, [copy.categories, promos, query, selectedCategory]);

  useEffect(() => {
    if (!searchActive) return;
    const root = document.documentElement;
    root.classList.add("hero-search-open");
    return () => root.classList.remove("hero-search-open");
  }, [searchActive]);

  useEffect(() => {
    if (!searchActive) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!searchRootRef.current?.contains(event.target as Node)) {
        setSearchFocused(false);
        setCategoryOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [searchActive]);

  const commitSearch = () => {
    const url = new URL(window.location.href);
    const trimmedQuery = query.trim();
    if (trimmedQuery) url.searchParams.set("q", trimmedQuery);
    else url.searchParams.delete("q");
    if (selectedCategory === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", selectedCategory);
    window.history.replaceState(null, "", url);
    announcePromoSearch({ query: trimmedQuery, category: selectedCategory });
    setSearchFocused(false);
    setCategoryOpen(false);
    inputRef.current?.blur();
    document.getElementById("all-promos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedCategoryLabel =
    selectedCategory === "all" ? copy.allCategories : copy.categories[selectedCategory];

  return (
    <section
      ref={rootRef}
      className="relative min-h-[680px] bg-blue-700 xl:h-[560px] xl:min-h-0"
      aria-labelledby="promo-hero-title"
    >
      <div className="absolute inset-0 overflow-clip">
        <img
          src="/assets/promo-page/promo-hero.jpeg"
          alt={copy.imageAlt}
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 size-full -scale-x-100 object-cover object-[54%_center] xl:object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-neutral-900/45 xl:hidden" />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-[54%] bg-gradient-to-r from-neutral-900/80 via-neutral-900/45 to-transparent xl:block"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[180px] bg-gradient-to-b from-neutral-900/70 to-transparent"
        />
      </div>

      <div className="absolute inset-x-0 top-[140px] z-10 px-4 xl:left-1/2 xl:right-auto xl:top-[172px] xl:w-[1280px] xl:-translate-x-1/2 xl:px-0">
        <div className="flex max-w-[420px] flex-col items-start gap-8 xl:gap-10">
          <div className="flex flex-col gap-4 text-white text-shadow-hero">
            <p className="text-base font-semibold leading-6 xl:text-lg xl:leading-[26px]">
              {copy.eyebrow}
            </p>
            <h1
              id="promo-hero-title"
              className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] xl:text-[36px] xl:leading-[44px]"
            >
              {copy.title}
            </h1>
          </div>

          <a
            href="#all-promos"
            onClick={(event) => {
              event.preventDefault();
              setQuery("");
              setSelectedCategory("all");
              const url = new URL(window.location.href);
              url.searchParams.delete("q");
              url.searchParams.delete("category");
              window.history.replaceState(null, "", url);
              announcePromoSearch({ query: "", category: "all" });
              document.getElementById("all-promos")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group/promo-cta flex h-12 items-center justify-center gap-1 rounded-full bg-white px-8 text-base font-semibold text-blue-500 transition-[background-color,box-shadow,transform] duration-300 active:scale-95 xl:hover:bg-blue-500 xl:hover:text-white xl:hover:shadow-[0_0_22px_-6px_rgba(125,211,252,0.75)]"
          >
            <span className="whitespace-nowrap">{copy.cta}</span>
            <img
              src="/assets/navbar/icon-arrow-blue.svg"
              alt=""
              className="size-5 transition-[filter] duration-300 xl:group-hover/promo-cta:brightness-0 xl:group-hover/promo-cta:invert"
            />
          </a>
        </div>
      </div>

      <div
        aria-hidden
        data-shown={searchActive}
        className="fade-overlay fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]"
      />

      <div
        ref={searchRootRef}
        id="promo-search"
        className="absolute inset-x-2 bottom-0 z-40 mx-auto max-w-[560px] xl:left-1/2 xl:right-auto xl:w-[1280px] xl:max-w-none xl:-translate-x-1/2"
      >
        <div
          className="hero-search relative flex min-h-[156px] flex-col justify-center gap-3 overflow-visible rounded-t-3xl p-3 xl:h-[108px] xl:min-h-0 xl:flex-row xl:items-center xl:gap-6 xl:p-5"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.16), rgba(5,13,25,0.42))",
            backdropFilter: "blur(16px) saturate(1.2)",
            WebkitBackdropFilter: "blur(16px) saturate(1.2)",
          }}
        >
          <p className="relative z-30 px-3 text-base font-semibold text-white text-shadow-hero xl:whitespace-nowrap xl:text-lg">
            {copy.searchPrompt}
          </p>

          <div className="relative z-30 flex min-w-0 flex-1 items-center gap-2 rounded-[50px] border border-white/50 bg-neutral-900/50 p-2 backdrop-blur-[28px]">
            <div className="relative flex h-10 min-w-0 flex-1 items-center">
              <input
                ref={inputRef}
                id="promo-search-input"
                type="search"
                role="combobox"
                value={query}
                aria-label={copy.searchLabel}
                aria-expanded={searchActive}
                aria-controls="promo-search-results"
                aria-autocomplete="list"
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchFocused(false);
                    setCategoryOpen(false);
                    event.currentTarget.blur();
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitSearch();
                  }
                }}
                className="relative z-10 h-10 w-full min-w-0 bg-transparent px-4 text-sm font-semibold text-white outline-none placeholder:text-neutral-500 xl:px-6 xl:text-base"
              />
              <SearchPlaceholderCarousel
                placeholders={copy.placeholders}
                visible={!query && !searchFocused}
                live={live}
                className="inset-0 px-4 text-sm xl:px-6 xl:text-base"
              />
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                aria-label={copy.categoryLabel}
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
                onClick={() => {
                  setCategoryOpen((open) => !open);
                  setSearchFocused(true);
                }}
                className="flex h-10 max-w-[152px] items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 shadow-card transition-colors hover:bg-blue-100 xl:max-w-none xl:px-4"
              >
                <span className="truncate">{selectedCategoryLabel}</span>
                <img
                  src="/assets/navbar/chevron-down-dark.svg"
                  alt=""
                  className={`size-5 shrink-0 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {categoryOpen && (
                <div
                  role="listbox"
                  aria-label={copy.categoryLabel}
                  data-lenis-prevent
                  className="absolute right-0 top-[calc(100%+10px)] z-50 max-h-64 w-64 overflow-y-auto rounded-xl border border-neutral-300 bg-white p-2 shadow-panel"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedCategory === "all"}
                    onClick={() => {
                      setSelectedCategory("all");
                      setCategoryOpen(false);
                      inputRef.current?.focus();
                    }}
                    className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${selectedCategory === "all" ? "bg-blue-100 text-blue-500" : "text-neutral-800 hover:bg-neutral-200"}`}
                  >
                    {copy.allCategories}
                  </button>
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      role="option"
                      aria-selected={selectedCategory === category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoryOpen(false);
                        inputRef.current?.focus();
                      }}
                      className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${selectedCategory === category ? "bg-blue-100 text-blue-500" : "text-neutral-800 hover:bg-neutral-200"}`}
                    >
                      {copy.categories[category]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={copy.searchLabel}
              onClick={commitSearch}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 active:scale-95"
            >
              <img src="/assets/cycle1/outline-search-1.svg" alt="" className="size-6" />
            </button>
          </div>
        </div>

        {searchActive && !categoryOpen && (
          <div
            id="promo-search-results"
            data-lenis-prevent
            onMouseDown={(event) => event.preventDefault()}
            className="absolute inset-x-0 top-[calc(100%+12px)] max-h-[min(480px,calc(100dvh-220px))] overflow-y-auto rounded-2xl border border-neutral-300 bg-white p-4 shadow-panel xl:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-base font-bold text-neutral-800">
                {query.trim() || selectedCategory !== "all" ? copy.results : copy.popularPromos}
              </p>
              <span className="text-sm font-semibold text-neutral-600">{filteredPromos.length}</span>
            </div>

            {filteredPromos.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPromos.map((promo) => (
                  <button
                    key={promo.id}
                    type="button"
                    onClick={() => {
                      setQuery(promo.title);
                      inputRef.current?.focus();
                    }}
                    className="group flex min-w-0 items-center gap-3 rounded-xl border border-neutral-300 p-2 text-left transition-[background-color,border-color] hover:border-blue-300 hover:bg-blue-100"
                  >
                    <img
                      src={promo.cover}
                      alt=""
                      className="h-16 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-neutral-600">
                        {promo.brand}
                      </span>
                      <span className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-800 group-hover:text-blue-500">
                        {promo.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-neutral-800">{copy.noResults}</p>
                <p className="mt-1 text-sm text-neutral-600">{copy.noResultsHint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
