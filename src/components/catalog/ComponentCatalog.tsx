"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { catalogItems, type CatalogGroup, type CatalogItem } from "./catalog-data";
import SoliprioSegmentSelector from "@/components/home/SoliprioSegmentSelector";
import WorkspaceNav from "@/components/docs/WorkspaceNav";
import WorkspaceTitle from "@/components/docs/WorkspaceTitle";
import { WorkspaceMenuItem, WorkspaceSidebar, WorkspaceSidebarLayout } from "@/components/docs/WorkspaceSidebar";
import CatalogSelect from "./CatalogSelect";
import { CatalogBrandContext, CatalogBlueprintContext, CatalogFieldToneContext, CatalogEdgeCaseContext, edgeCaseComponents } from "./CatalogView";
import type { KursEntry } from "@/lib/kurs";
import CatalogPreview from "./CatalogPreview";

const groups: CatalogGroup[] = ["controls", "cards", "navigation", "display", "feedback"];

export default function ComponentCatalog({ wealthBackdrops, rates, eventBackdrops }: { wealthBackdrops: Record<string, string>; rates: KursEntry[]; eventBackdrops: Record<string,string> }) {
  const t = useTranslations("componentCatalog");
  const [fieldTone, setFieldTone] = useState<"default" | "prioritas" | "solitaire">("default");
  const [edgeCaseId, setEdgeCaseId] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState(false);
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
  const select = (item: CatalogItem) => {
    setSelectedId(item.id);
    window.history.replaceState(null, "", `#${item.id}`);
    document.getElementById("catalog-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <main id="main-content" className="min-h-dvh bg-neutral-100 font-docs text-neutral-900">
      <header className="grid grid-cols-1 items-center gap-x-4 gap-y-3 border-b border-neutral-400 px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto] xl:min-h-16 lg:px-8">
        <WorkspaceTitle />
        <div className="md:justify-self-end"><WorkspaceNav active="catalog" /></div>
      </header>
      <WorkspaceSidebarLayout>
        <WorkspaceSidebar aria-label={t("browse")}>
          <div className="lg:hidden"><CatalogSelect label={t("browse")} value={selected.id} onChange={value => { const item = catalogItems.find(item => item.id === value); if(item) select(item); }} options={catalogItems.map(item => ({value:item.id,label:t(`items.${item.id}.title` as Parameters<typeof t>[0])}))} className="w-full" /></div>
          <nav className="hidden space-y-7 lg:block">
            {groups.map(group => { const items = catalogItems.filter(item => item.group === group); return items.length ? <div key={group}>
              <h2 className="mb-2 px-3 text-size-body-m font-semibold text-neutral-700">{t(`groups.${group}`)}</h2>
              <div className="space-y-1">{items.map(item => <WorkspaceMenuItem key={item.id} active={selected.id === item.id} onClick={() => select(item)}><span>{t(`items.${item.id}.title` as Parameters<typeof t>[0])}</span></WorkspaceMenuItem>)}</div>
            </div> : null; })}
          </nav>
        </WorkspaceSidebar>
        <section id="catalog-detail" aria-labelledby="catalog-item-title" className="min-w-0 px-5 py-10 md:px-10 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <h2 id="catalog-item-title" className="text-display-2xl">{t(`items.${selected.id}.title` as Parameters<typeof t>[0])}</h2>
            <p className="mt-3 max-w-[720px] text-size-body-m leading-7 text-neutral-700">{t(`items.${selected.id}.description` as Parameters<typeof t>[0])}</p>
            <div className="mt-10">
            <div className="flex flex-wrap items-center gap-4 border-b border-neutral-400 pb-3">
              {selected.brand === "both" || selected.id === "text-field" ? <div className="font-sans"><SoliprioSegmentSelector value={selected.id === "text-field" && fieldTone !== "default" ? fieldTone : activeBrand} onChange={value => { setBrand(value); if (selected.id === "text-field") setFieldTone(value); }} defaultOption={selected.id === "text-field" ? { label: t("board.default"), active: fieldTone === "default", onSelect: () => setFieldTone("default") } : undefined} surface="default" label={t("brandLabel")} /></div> : selected.brand === "shared" ? null : <span className="text-size-body-m text-neutral-700">{t(activeBrand)}</span>}
              {edgeCaseComponents.has(selected.id) ? <label className="ml-auto flex cursor-pointer items-center gap-2 text-size-body-m text-neutral-900">
                <span>{t("board.edgeCase")}</span>
                <span className="relative inline-flex h-5 w-9 shrink-0">
                  <input type="checkbox" role="switch" aria-label={t("board.edgeCase")} checked={edgeCaseId === selected.id} onChange={event => setEdgeCaseId(event.target.checked ? selected.id : null)} className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0" />
                  <span aria-hidden className="pointer-events-none flex h-full w-full items-center rounded-full border border-neutral-400 bg-neutral-200 p-0.5 transition-colors peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-600"><span className={`size-3.5 rounded-full bg-neutral-100 transition-transform ${edgeCaseId === selected.id ? "translate-x-4" : "translate-x-0"}`} /></span>
                </span>
              </label> : null}
              <label className={`${edgeCaseComponents.has(selected.id) ? "" : "ml-auto"} flex cursor-pointer items-center gap-2 text-size-body-m text-neutral-900`}>
                <span>{t("board.blueprint")}</span>
                <span className="relative inline-flex h-5 w-9 shrink-0">
                  <input type="checkbox" role="switch" aria-label={t("board.blueprint")} checked={blueprint} onChange={event => setBlueprint(event.target.checked)} className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0" />
                  <span aria-hidden className="pointer-events-none flex h-full w-full items-center rounded-full border border-neutral-400 bg-neutral-200 p-0.5 transition-colors peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-600"><span className={`size-3.5 rounded-full bg-neutral-100 transition-transform ${blueprint ? "translate-x-4" : "translate-x-0"}`} /></span>
                </span>
              </label>
            </div>
            <div className="mt-6"><CatalogEdgeCaseContext.Provider value={edgeCaseId === selected.id && edgeCaseComponents.has(selected.id)}><CatalogFieldToneContext.Provider value={fieldTone}><CatalogBlueprintContext.Provider value={blueprint}><CatalogBrandContext.Provider value={activeBrand}>{selectedId ? <CatalogPreview key={selected.id} item={selected} brand={activeBrand} wealthBackdrops={wealthBackdrops} rates={rates} eventBackdrops={eventBackdrops} /> : null}</CatalogBrandContext.Provider></CatalogBlueprintContext.Provider></CatalogFieldToneContext.Provider></CatalogEdgeCaseContext.Provider></div>
            </div>
            {t.has(`rules.${selected.id}`) ? <section aria-labelledby="catalog-rules-title" className="mt-12 border-t border-neutral-400 pt-6">
              <h3 id="catalog-rules-title" className="text-size-body-l font-semibold">{t("rulesTitle")}</h3>
              <ul className="mt-4 max-w-4xl list-disc space-y-3 pl-5 text-size-body-m leading-6 text-neutral-700">
                {(t.raw(`rules.${selected.id}`) as string[]).map(rule => <li key={rule}>{rule}</li>)}
              </ul>
            </section> : null}
          </div>
        </section>
      </WorkspaceSidebarLayout>
    </main>
  );
}
