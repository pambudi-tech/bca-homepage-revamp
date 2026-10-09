"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { catalogItems, type CatalogGroup, type CatalogItem } from "./catalog-data";
import { Input } from "./ui/input";
import SoliprioSegmentSelector from "@/components/home/SoliprioSegmentSelector";
import { Search, Layers } from "lucide-react";
import CatalogSelect from "./CatalogSelect";
import { CatalogBrandContext } from "./CatalogView";
import CatalogPreview from "./CatalogPreview";

const groups: CatalogGroup[] = ["controls", "cards", "navigation", "display", "feedback"];

export default function ComponentCatalog({ wealthBackdrops }: { wealthBackdrops: Record<string, string> }) {
  const t = useTranslations("componentCatalog");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brand, setBrand] = useState<"prioritas" | "solitaire">("prioritas");

  useEffect(() => {
    const readHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      setSelectedId(catalogItems.some((item) => item.id === id) ? id : catalogItems[0].id);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  const selected = catalogItems.find(item => item.id === selectedId) ?? catalogItems[0];
  const activeBrand = selected.brand === "solitaire" ? "solitaire" : selected.brand === "prioritas" || !selected.brand ? "prioritas" : brand;
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return catalogItems.filter(item => !term || `${t(`items.${item.id}.title` as Parameters<typeof t>[0])} ${t(`items.${item.id}.description` as Parameters<typeof t>[0])}`.toLocaleLowerCase().includes(term));
  }, [query, t]);
  const select = (item: CatalogItem) => {
    setSelectedId(item.id);
    window.history.replaceState(null, "", `#${item.id}`);
    document.getElementById("catalog-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <main id="main-content" className="min-h-dvh bg-docs-background font-docs text-docs-foreground">
      <header className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 border-b border-docs-border px-5 py-3 md:h-16 md:grid-cols-[1fr_minmax(0,320px)_1fr] md:py-0 lg:px-8">
        <h1 className="flex items-center gap-3 text-sm font-semibold"><Layers className="size-5" aria-hidden />{t("title")}</h1>
        <div className="relative order-3 col-span-2 md:order-none md:col-span-1"><label htmlFor="catalog-search" className="sr-only">{t("searchLabel")}</label><Search aria-hidden className="absolute left-3 top-2.5 size-4 text-docs-muted-foreground" /><Input id="catalog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" /></div>
        <span className="justify-self-end text-xs text-docs-muted-foreground">{catalogItems.length} {t("components")}</span>
      </header>
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-label={t("browse")} className="border-b border-docs-border px-5 py-6 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r" data-lenis-prevent>
          <div className="lg:hidden"><CatalogSelect label={t("browse")} value={selected.id} onChange={value => { const item = catalogItems.find(item => item.id === value); if(item) select(item); }} options={filtered.map(item => ({value:item.id,label:t(`items.${item.id}.title` as Parameters<typeof t>[0])}))} className="w-full" /></div>
          <nav className="hidden space-y-7 lg:block">
            {groups.map(group => { const items = filtered.filter(item => item.group === group); return items.length ? <div key={group}>
              <h2 className="mb-2 px-2 text-xs font-semibold text-docs-muted-foreground">{t(`groups.${group}`)}</h2>
              {items.map(item => <button key={item.id} type="button" onClick={() => select(item)} aria-current={selectedId === item.id ? "page" : undefined} className={`block w-full rounded-md px-2 py-2 text-left text-sm transition-colors ${selectedId === item.id ? "bg-docs-muted font-semibold text-docs-foreground" : "text-docs-muted-foreground hover:bg-docs-muted hover:text-docs-foreground"}`}>{t(`items.${item.id}.title` as Parameters<typeof t>[0])}</button>)}
            </div> : null; })}
            {!filtered.length && <p className="text-sm text-docs-muted-foreground">{t("noResults")}</p>}
          </nav>
        </aside>
        <section id="catalog-detail" aria-labelledby="catalog-item-title" className="min-w-0 px-5 py-10 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <p className="text-xs text-docs-muted-foreground">{t(`groups.${selected.group}`)}</p>
            <h2 id="catalog-item-title" className="mt-3 text-4xl font-semibold tracking-tight">{t(`items.${selected.id}.title` as Parameters<typeof t>[0])}</h2>
            <p className="mt-3 max-w-[720px] text-base leading-7 text-docs-muted-foreground">{t(`items.${selected.id}.description` as Parameters<typeof t>[0])}</p>
            <div className="mt-10">
            <div className="flex flex-wrap items-center gap-4 border-b border-docs-border pb-3">
              {selected.brand === "both" ? <div className="font-sans"><SoliprioSegmentSelector value={activeBrand} onChange={setBrand} surface="default" label={t("brandLabel")} /></div> : selected.brand === "shared" ? null : <span className="text-xs text-docs-muted-foreground">{t(activeBrand)}</span>}
            </div>
            <div className="mt-6"><CatalogBrandContext.Provider value={activeBrand}>{selectedId ? <CatalogPreview key={selected.id} item={selected} brand={activeBrand} wealthBackdrops={wealthBackdrops} /> : null}</CatalogBrandContext.Provider></div>
            </div>
            <div className="mt-12 border-t border-docs-border pt-6">
              <h3 className="text-sm font-semibold">{t("spec")}</h3>
              <p className="mt-3 max-w-[800px] text-sm leading-6 text-docs-muted-foreground">{t(`items.${selected.id}.detail` as Parameters<typeof t>[0])}</p>
              <p className="mt-4 text-xs leading-5 text-docs-muted-foreground">{t("previewNote")}</p>
              <code className="mt-4 block break-all text-xs text-docs-muted-foreground">{selected.source}</code>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
