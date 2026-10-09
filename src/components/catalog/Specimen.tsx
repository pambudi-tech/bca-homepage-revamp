"use client";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CatalogBrandContext, CatalogSpecsContext } from "./CatalogView";
import { Table, TableBody, TableRow, TableCell } from "./ui/table";
import { ChevronDown } from "lucide-react";
import { inspectElement, type ElementSpecs } from "./catalog-inspector";
import CatalogBlueprint, { type BlueprintBox, type BlueprintMode } from "./CatalogBlueprint";
import CatalogOptions from "./CatalogOptions";
import CatalogSelect from "./CatalogSelect";

export default function Specimen({ label, children, state, width, dark = false, tone = "prioritas", selector, textSelector, surfaceClassName, clip = false, fullBleed = false }: { label: string; children: ReactNode; state?: "hover" | "focus"; width?: number; dark?: boolean; tone?: "prioritas" | "solitaire"; selector?: string; textSelector?: string; surfaceClassName?: string; clip?: boolean; fullBleed?: boolean }) {
  const t = useTranslations("componentCatalog.board");
  const showSpecs = useContext(CatalogSpecsContext);
  const brand = useContext(CatalogBrandContext);
  const ref = useRef<HTMLDivElement>(null);
  const [specs, setSpecs] = useState<ElementSpecs>();
  const [blueprint, setBlueprint] = useState(false);
  const [boxes, setBoxes] = useState<BlueprintBox[]>([]);
  const [blueprintMode, setBlueprintMode] = useState<BlueprintMode>("size");
  const [blueprintPart, setBlueprintPart] = useState("0");
  const activePart = boxes[Number(blueprintPart)] ? blueprintPart : "0";
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const element = (selector ? root.querySelector<HTMLElement>(selector) : root.firstElementChild) as HTMLElement | null;
    if (!element) return;
    const update = () => {
      setSpecs(inspectElement(element, textSelector));
      if (!blueprint) return;
      const bounds = root.getBoundingClientRect();
      const scaleX = (root.offsetWidth ? bounds.width / root.offsetWidth : 1) || 1;
      const scaleY = (root.offsetHeight ? bounds.height / root.offsetHeight : 1) || 1;
      const seen = new Set<string>();
      const measured: typeof boxes = [];
      for (const node of [element, ...element.querySelectorAll<HTMLElement>("img,h1,h2,h3,h4,p,input,select,button,.glass-panel,.prio-button__label")]) {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= bounds.top || rect.top >= bounds.bottom) continue;
        const css = getComputedStyle(node);
        if (css.visibility === "hidden" || css.opacity === "0") continue;
        const kind: BlueprintBox["kind"] = node === element ? "component" : node.tagName === "IMG" ? "image" : node.matches(".glass-panel") ? "panel" : node.matches("input,select,button,.prio-button__label") ? "control" : "text";
        const key = `${kind}:${[rect.left, rect.top, rect.width, rect.height].map(Math.round).join(":")}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const previewScale = Number(node.closest("[data-catalog-preview-scale]")?.getAttribute("data-catalog-preview-scale")) || 1;
        const parentRect = (node.parentElement ?? root).getBoundingClientRect();
        measured.push({
          left: (rect.left - bounds.left) / scaleX, top: (rect.top - bounds.top) / scaleY,
          width: rect.width / scaleX, height: rect.height / scaleY,
          nativeWidth: rect.width / previewScale, nativeHeight: rect.height / previewScale, kind,
          padding: { top: parseFloat(css.paddingTop) || 0, right: parseFloat(css.paddingRight) || 0, bottom: parseFloat(css.paddingBottom) || 0, left: parseFloat(css.paddingLeft) || 0 },
          parent: { left: (parentRect.left - bounds.left) / scaleX, top: (parentRect.top - bounds.top) / scaleY, width: parentRect.width / scaleX, height: parentRect.height / scaleY },
          scale: previewScale / scaleX,
        });
        if (measured.length === 24) break;
      }
      setBoxes(measured);
    };
    update();
    const timer = window.setTimeout(update, 350);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    root.addEventListener("transitionend", update);
    root.addEventListener("change", update);
    return () => { clearTimeout(timer); observer.disconnect(); root.removeEventListener("transitionend", update); root.removeEventListener("change", update); };
  }, [selector, textSelector, brand, blueprint, children]);
  return <article className={`min-w-0 bg-docs-background font-docs ${blueprint ? "col-span-full" : ""} ${fullBleed ? "" : "rounded-xl border border-docs-border"}`}>
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <h4 className="text-xs font-medium text-docs-muted-foreground">{label}</h4>
      <label className="flex cursor-pointer items-center gap-2 text-xs text-docs-foreground">
        <span>{t("blueprint")}</span>
        <span className="relative inline-flex h-5 w-9 shrink-0">
          <input type="checkbox" role="switch" aria-label={t("blueprint")} checked={blueprint} onChange={event => setBlueprint(event.target.checked)} className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0" />
          <span aria-hidden className="pointer-events-none flex h-full w-full items-center rounded-full border border-docs-border bg-docs-muted p-0.5 transition-colors peer-checked:border-docs-primary peer-checked:bg-docs-primary peer-focus-visible:ring-2 peer-focus-visible:ring-docs-ring"><span className={`size-3.5 rounded-full bg-docs-background transition-transform ${blueprint ? "translate-x-4" : "translate-x-0"}`} /></span>
        </span>
      </label>
    </div>
    {blueprint ? <div className="flex flex-wrap items-end gap-4 border-y border-docs-border bg-docs-muted/50 px-4 py-3">
      <CatalogOptions label={t("blueprintView")} value={blueprintMode} onChange={setBlueprintMode} options={(["size", "padding", "inset"] as const).map(value => ({value, label:t(`blueprintModes.${value}`)}))} />
      {boxes.length ? <div className="space-y-2"><p className="text-xs text-docs-muted-foreground">{t("blueprintElement")}</p><CatalogSelect label={t("blueprintElement")} value={activePart} onChange={setBlueprintPart} options={boxes.map((box, index) => ({value:String(index), label:`${t(`blueprintParts.${box.kind}`)}${box.kind === "component" ? "" : ` ${index}`}`}))} /></div> : null}
    </div> : null}
    <div className={` ${blueprint ? "overflow-auto" : clip ? "overflow-hidden" : "overflow-x-auto"} ${blueprint ? "flex min-h-36 items-center justify-center p-12" : fullBleed ? "" : "flex min-h-36 items-center justify-center p-6"} ${surfaceClassName ?? (dark ? tone === "solitaire" ? "bg-neutral-900" : "bg-pbrown-800" : "bg-neutral-100")}`}>
      <div ref={ref} data-catalog-state={state} style={width ? { width, maxWidth: "100%" } : undefined} className="relative min-w-0 font-sans" onClickCapture={(event) => {
        if (blueprint) {
          event.preventDefault();
          event.stopPropagation();
        }
        else if ((event.target as HTMLElement).closest("a")) event.preventDefault();
      }}>{children}{blueprint && boxes[Number(activePart)] ? <CatalogBlueprint box={boxes[Number(activePart)]} mode={blueprintMode} /> : null}</div>
    </div>
    {specs ? <details open={showSpecs || undefined} className="group border-t border-docs-border text-xs text-docs-muted-foreground">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-docs-muted"><span className="font-sans">{specs.dimensions}</span><span>{t("allSpecs")} <ChevronDown aria-hidden className="inline size-3 group-open:rotate-180" /></span></summary>
      <Table><TableBody>
        {[[t("type"), specs.typography], [t("tokens"), specs.tokens], [t("spacing"), specs.spacing], [t("colors"), specs.colors], [t("classes"), specs.classes]].map(([name,value]) => <TableRow key={name}><TableCell className="w-20 align-top text-xs font-medium">{name}</TableCell><TableCell className="whitespace-pre-wrap break-all font-sans text-xs leading-5">{value}</TableCell></TableRow>)}
      </TableBody></Table>
    </details> : null}
  </article>;
}
