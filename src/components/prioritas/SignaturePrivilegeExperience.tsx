"use client";

import { useMemo, useState } from "react";
import PromoCard from "@/components/promo/PromoCard";
import type { Promo } from "@/components/home/promo-data";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ASSET_ROOT = "/assets/prioritas/signature-privilege";
const signatureCards = [
  ["lounge", "privilege-01.png"],
  ["transfer", "privilege-04.png"],
  ["transfer", "privilege-05.png"],
  ["transferFee", "figma-08.png"],
  ["medical", "privilege-11.png"],
  ["medical", "privilege-10.png"],
] as const;

const PER_PAGE = 9;

function Arrow() {
  return <img src="/assets/prioritas/privilege/arrow-small.svg" alt="" className="size-5" />;
}

export default function SignaturePrivilegeExperience({ promos, now }: { promos: Promo[]; now: Date }) {
  const t = useTranslations("signaturePrivilege");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [birthdayChecked, setBirthdayChecked] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const categories = Object.keys(t.raw("categories"));
  const brandOptions = useMemo(() => [...new Set(promos.map((promo) => promo.brand))].slice(0, 8), [promos]);
  const filteredPromos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return promos.filter((promo) => {
      const categoryMatch = category === "all"
        || (category === "beauty" && promo.category === "health-beauty")
        || (category === "culinary" && promo.category === "fnb")
        || (category === "health" && promo.category === "health-beauty")
        || (category === "lifestyle" && ["hobby", "fashion-shopping", "retail"].includes(promo.category));
      const haystack = `${promo.title} ${promo.brand}`.toLocaleLowerCase();
      return categoryMatch && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, promos, query]);
  const pageCount = Math.max(1, Math.ceil(filteredPromos.length / PER_PAGE));
  const visiblePromos = filteredPromos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function selectCategory(next: string) {
    setCategory(next);
    setPage(1);
  }

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 text-pbrown-800">
      <header className="relative z-10 h-[400px] overflow-hidden bg-pbrown-600 text-pgold-100">
        <img
          src="/assets/prioritas/card/prio-glow.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-[390px] -top-[320px] h-[960px] w-auto max-w-none opacity-80 xl:-right-[120px]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-pbrown-600 to-transparent" />
        <div className="relative mx-auto h-full w-full max-w-[1280px] px-5 pt-[140px] xl:px-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-base font-semibold leading-6 text-pbrown-200">
            <Link href="/prioritas">Prioritas</Link>
            <span aria-hidden className="text-2xl leading-none">›</span>
            <span aria-current="page">{t("breadcrumb")}</span>
          </nav>
          <h1 className="mt-6 max-w-[560px] text-heading text-white xl:absolute xl:bottom-[100px] xl:left-0 xl:mt-0 xl:text-display">{t("title")}</h1>
          <div role="tablist" aria-label={t("tabLabel")} className="mt-10 flex max-w-full overflow-x-auto rounded-t-xl bg-pbrown-700 xl:absolute xl:bottom-0 xl:left-0 xl:mt-0 xl:w-max">
            {["signature", "lifestyle", "event", "promo"].map((key, index) => <button key={key} type="button" role="tab" aria-selected={index === 0} className={`h-14 shrink-0 px-6 text-sm font-semibold xl:px-8 xl:text-lg ${index === 0 ? "rounded-t-xl bg-pgold-200 text-pbrown-600" : "text-pbrown-200"}`}>{t(`tabs.${key}`)}</button>)}
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-pgold-200 py-10 xl:py-10">
        <div aria-hidden className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_0%_50%,white_0%,transparent_38%),radial-gradient(ellipse_at_100%_18%,white_0%,transparent_36%)]" />
        <div className="relative mx-auto max-w-[1280px] px-5 xl:px-0">
          <p className="text-sm font-semibold leading-6 xl:text-lg">{t("description")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {signatureCards.map(([key, image]) => <article key={key} className="group relative h-60 overflow-hidden rounded-xl bg-pbrown-800 shadow-prioritas">
              <img src={`${ASSET_ROOT}/${image}`} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-pbrown-900/90 via-pbrown-900/20 to-transparent" />
              <div className="absolute inset-x-2 bottom-2 rounded-xl border-t border-white/25 bg-pbrown-900/70 px-5 pb-5 pt-4 backdrop-blur-md">
                <h2 className="min-h-14 text-title text-white">{t(`signature.${key}.title`)}</h2>
                <button type="button" className="mt-2 flex items-center gap-0.5 text-sm font-semibold text-pgold-300"><span>{t("more")}</span><Arrow /></button>
              </div>
            </article>)}
          </div>

          <section className="mt-10 rounded-xl bg-white p-4 shadow-card xl:mt-4 xl:p-6" aria-labelledby="complimentary-title">
            <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div><h2 id="complimentary-title" className="text-heading">{t("complimentary.title")}</h2><p className="mt-1 text-sm text-neutral-600">{t("complimentary.subtitle")}</p></div>
              <label className="group/compare flex min-w-0 cursor-pointer items-center gap-2 text-sm leading-5">
                <input type="checkbox" checked={birthdayChecked} onChange={(event) => setBirthdayChecked(event.target.checked)} className="peer sr-only" />
                <span className="flex size-6 shrink-0 items-center justify-center p-0.5">
                  <span className={`flex size-5 items-center justify-center rounded-md border text-white transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500/40 ${birthdayChecked ? "border-cyan-500 bg-cyan-500" : "border-neutral-600 bg-white group-hover/compare:border-cyan-500"}`}>
                    <svg viewBox="0 0 20 20" fill="none" className={`size-3.5 transition-opacity ${birthdayChecked ? "opacity-100" : "opacity-0"}`} aria-hidden>
                      <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
                <span className={birthdayChecked ? "font-semibold text-neutral-800" : "font-normal text-neutral-700"}>{t("complimentary.birthday")}</span>
              </label>
            </header>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((key) => <button key={key} type="button" onClick={() => selectCategory(key)} className={`h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold transition-colors ${category === key ? "border-pgold-500 bg-pgold-200 text-pbrown-700" : "border-neutral-300 bg-white text-neutral-700 hover:border-pgold-500"}`}>{t(`categories.${key}`)}</button>)}
            </div>
            <div className="mt-4 flex flex-col justify-between gap-3 border-b border-neutral-300 pb-4 xl:flex-row xl:items-center">
              <div className="relative block w-full xl:w-80">
                <span className="sr-only">{t("searchLabel")}</span>
                <div className={`flex h-14 items-center rounded-xl border px-4 transition-colors ${brandOpen ? "border-pgold-500 bg-white" : "border-transparent bg-neutral-200"}`}>
                  <img src="/assets/promo-page/controls/search.svg" alt="" aria-hidden className="size-[18px] shrink-0" />
                  <input
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setPage(1); setBrandOpen(true); }}
                    onFocus={() => setBrandOpen(true)}
                    placeholder={t("searchPlaceholder")}
                    aria-expanded={brandOpen}
                    aria-controls="complimentary-brand-options"
                    className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-neutral-600"
                  />
                  <button type="button" aria-label={t("searchLabel")} aria-expanded={brandOpen} onClick={() => setBrandOpen((open) => !open)} className="flex size-5 shrink-0 items-center justify-center text-neutral-700">
                    <img src="/assets/promo-page/controls/chevron-down.svg" alt="" aria-hidden className={`h-[8.5px] w-[14.5px] transition-transform ${brandOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {brandOpen ? <div id="complimentary-brand-options" role="listbox" className="absolute inset-x-0 top-16 z-20 max-h-80 overflow-y-auto rounded-xl bg-white p-2 shadow-card">
                  {brandOptions.filter((brand) => brand.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map((brand) => <button key={brand} type="button" role="option" aria-selected={query === brand} onMouseDown={(event) => event.preventDefault()} onClick={() => { setQuery(brand); setPage(1); setBrandOpen(false); }} className={`flex h-14 w-full items-center rounded-lg px-4 text-left text-base transition-colors ${query === brand ? "bg-pgold-200 font-semibold text-pbrown-700" : "text-neutral-700 hover:bg-neutral-200"}`}>{brand}</button>)}
                </div> : null}
              </div>
              <p className="text-xs text-neutral-600">{t("showing", { count: filteredPromos.length })}</p>
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {visiblePromos.map((promo) => <PromoCard key={promo.id} promo={promo} now={now} reveal={false} variant="prioritas" fill detail />)}
            </div>
            {filteredPromos.length === 0 ? <p className="py-16 text-center text-neutral-600">{t("empty")}</p> : null}
            <nav aria-label={t("paginationLabel")} className="mt-6 flex items-center justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="size-9 rounded-lg border border-neutral-300 disabled:opacity-40">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <button key={item} type="button" onClick={() => setPage(item)} aria-current={item === page ? "page" : undefined} className={`size-9 rounded-lg text-sm font-semibold ${item === page ? "border border-pgold-500 bg-pgold-200 text-pbrown-700" : "bg-neutral-200 text-neutral-700"}`}>{item}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="size-9 rounded-lg border border-neutral-300 disabled:opacity-40">›</button></nav>
          </section>
        </div>
      </section>
    </main>
  );
}
