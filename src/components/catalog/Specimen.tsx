"use client";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CatalogBrandContext, CatalogSpecsContext, CatalogBlueprintContext } from "./CatalogView";
import CatalogSpecs from "./CatalogSpecs";
import { ChevronDown } from "lucide-react";
import { inspectElement, sizingBehavior, type ElementSpecs } from "./catalog-inspector";
import CatalogBlueprint, { type BlueprintBox, type BlueprintMode } from "./CatalogBlueprint";
import CatalogOptions from "./CatalogOptions";
import { blueprintRole } from "./blueprint-parts";
import CatalogSelect from "./CatalogSelect";
import { measureSpacing } from "./blueprint-spacing";

export default function Specimen({ label, children, state, width, dark = false, tone = "prioritas", selector, textSelector, surfaceClassName, clip = false, fullBleed = false, blueprintDuplicate = false }: { label: string; children: ReactNode; state?: "hover" | "focus"; width?: number; dark?: boolean; tone?: "prioritas" | "solitaire"; selector?: string; textSelector?: string; surfaceClassName?: string; clip?: boolean; fullBleed?: boolean; blueprintDuplicate?: boolean }) {
  const t = useTranslations("componentCatalog.board");
  const showSpecs = useContext(CatalogSpecsContext);
  const brand = useContext(CatalogBrandContext);
  const ref = useRef<HTMLDivElement>(null);
  const [specs, setSpecs] = useState<ElementSpecs>();
  const blueprint = useContext(CatalogBlueprintContext);
  const [boxes, setBoxes] = useState<BlueprintBox[]>([]);
  const [blueprintMode, setBlueprintMode] = useState<BlueprintMode>("size");
  const [blueprintPart, setBlueprintPart] = useState("0");
  const activePart = boxes[Number(blueprintPart)] ? blueprintPart : "0";
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const candidates = selector ? Array.from(root.querySelectorAll<HTMLElement>(selector)) : [root.firstElementChild as HTMLElement].filter(Boolean);
    if (!candidates.length) return;
    const update = () => {
      const element = candidates.find(node => node.getBoundingClientRect().width && node.getBoundingClientRect().height) ?? candidates[0];
      setSpecs(inspectElement(element, textSelector));
      if (!blueprint) return;
      const bounds = root.getBoundingClientRect();
      const scaleX = (root.offsetWidth ? bounds.width / root.offsetWidth : 1) || 1;
      const scaleY = (root.offsetHeight ? bounds.height / root.offsetHeight : 1) || 1;
      const seen = new Set<string>();
      const measured: typeof boxes = [];
      for (const node of [element, ...element.querySelectorAll<HTMLElement>("[data-blueprint-part],[data-blueprint-component],img,h1,h2,h3,h4,p,label,input,select,button,.glass-panel,.prio-button__label,.prio-button,.solitaire-button,.priosoli-chip__icon,.prio-button__icon")]) {
        const composite = node.closest<HTMLElement>(".prio-button,.solitaire-button,[data-blueprint-component]");
        if (composite && composite !== element && node !== composite) continue;
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.bottom <= bounds.top || rect.top >= bounds.bottom) continue;
        const css = getComputedStyle(node);
        if (css.visibility === "hidden" || css.opacity === "0") continue;
        const kind: BlueprintBox["kind"] = node === element ? "component" : node.tagName === "IMG" ? "image" : node.matches(".glass-panel") ? "panel" : node.matches("input,select,button,.prio-button__label") ? "control" : "text";
        const key = [rect.left, rect.top, rect.width, rect.height].map(value => Math.round(value * 10)).join(":");
        if (seen.has(key)) continue;
        seen.add(key);
        const previewScale = Number(node.closest("[data-catalog-preview-scale]")?.getAttribute("data-catalog-preview-scale")) || 1;
        const parentRect = (node.parentElement ?? root).getBoundingClientRect();
        const role = blueprintRole(node);
        const content = (node.getAttribute("aria-label") || node.getAttribute("alt") || node.textContent || "").trim().replace(/\s+/g, " ");
        const baseLabel = node === element ? t("blueprintParts.component") : t(`blueprintRoles.${role}`);
        const label = node.dataset.blueprintLabel ? `${baseLabel} · ${node.dataset.blueprintLabel}` : node.dataset.blueprintPart || node === element || role.endsWith("Icon") || role === "contentPanel" || role === "cover" || role === "icon" || role === "logo" ? baseLabel : `${baseLabel}${content ? ` · ${content.length > 24 ? content.slice(0, 24) + "…" : content}` : ""}`;
        const recipe = composite === node && node !== element ? Array.from(node.classList).filter(name => /^(prio-button|solitaire-button)--/.test(name)).map(name => name.split("--")[1]) : [];
        const tabComposition = composite === node && node !== element && node.dataset.blueprintComponent === "tab" ? [t("blueprintRoles.tab"), t(`componentVariants.${node.dataset.blueprintVariant}`), t(`componentVariants.${node.dataset.blueprintSize}`), node.dataset.blueprintTone?.includes("solitaire") ? t("componentVariants.solitaire") : node.dataset.blueprintTone?.includes("prioritas") ? t("componentVariants.prioritas") : t("componentVariants.default")].join(" · ") : undefined;
        const composition = tabComposition ?? (recipe.length ? `${t("blueprintRoles.button")} · ${t(composite?.classList.contains("solitaire-button") ? "componentVariants.solitaire" : "componentVariants.prioritas")} · ${recipe.map(value => t(`componentVariants.${value}`)).join(" · ")}` : undefined);
        measured.push({
          label, composition, aspectRatio: node.dataset.blueprintRatio === "locked" && css.aspectRatio !== "auto" ? css.aspectRatio.replace(" / ", " : ") : undefined,
          left: (rect.left - bounds.left) / scaleX, top: (rect.top - bounds.top) / scaleY,
          width: rect.width / scaleX, height: rect.height / scaleY,
          nativeWidth: rect.width / previewScale, nativeHeight: rect.height / previewScale, kind,
          sizing: { width: sizingBehavior(node, "width", root), height: sizingBehavior(node, "height", root) },
          padding: { top: parseFloat(css.paddingTop) || 0, right: parseFloat(css.paddingRight) || 0, bottom: parseFloat(css.paddingBottom) || 0, left: parseFloat(css.paddingLeft) || 0 },
          parent: { left: (parentRect.left - bounds.left) / scaleX, top: (parentRect.top - bounds.top) / scaleY, width: parentRect.width / scaleX, height: parentRect.height / scaleY },
          scale: previewScale / scaleX,
          spacing: measureSpacing(node, bounds, scaleX, scaleY, previewScale),
        });
        if (measured.length === 24) break;
      }
      setBoxes(measured);
    };
    update();
    const timer = window.setTimeout(update, 350);
    const observer = new ResizeObserver(update);
    candidates.forEach(element => observer.observe(element));
    root.addEventListener("transitionend", update);
    root.addEventListener("change", update);
    return () => { clearTimeout(timer); observer.disconnect(); root.removeEventListener("transitionend", update); root.removeEventListener("change", update); };
  }, [selector, textSelector, brand, blueprint, children, t]);
  if (blueprint && blueprintDuplicate) return null;
  return <article className={`min-w-0 bg-neutral-100 font-docs ${blueprint ? "col-span-full" : ""} ${fullBleed ? "" : "rounded-xl border border-neutral-400"}`}>
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <h4 className="text-size-body-m font-medium text-neutral-700">{label}</h4>

    </div>
    {blueprint ? <div className="flex flex-wrap items-end gap-4 border-y border-neutral-400 bg-neutral-200/50 px-4 py-3">
      <CatalogOptions label={t("blueprintView")} value={blueprintMode} onChange={setBlueprintMode} options={(["size", "padding", "margin", "gap"] as const).map(value => ({value, label:t(`blueprintModes.${value}`)}))} />
      {boxes.length ? <div className="space-y-2"><p className="text-size-body-m text-neutral-700">{t("blueprintElement")}</p><CatalogSelect className="h-10 w-[200px] max-w-full" label={t("blueprintElement")} value={activePart} onChange={setBlueprintPart} options={boxes.map((box, index) => ({value:String(index), label:box.label}))} /></div> : null}
      {boxes[Number(activePart)] && !boxes[Number(activePart)].composition && blueprintMode === "size" ? <div className="flex min-h-10 flex-wrap items-center gap-x-6 gap-y-1 text-size-body-m text-neutral-700">{(["width", "height"] as const).map(axis => <p key={axis}>{t(`sizingAxes.${axis}`)}: <span className="font-medium text-neutral-900">{t(`sizingKinds.${boxes[Number(activePart)].sizing[axis]}`)}</span></p>)}{boxes[Number(activePart)].aspectRatio ? <p>{t("lockedRatio")}: <span className="font-medium text-neutral-900">{boxes[Number(activePart)].aspectRatio}</span></p> : null}</div> : null}
      {boxes[Number(activePart)]?.composition ? <p className="flex min-h-10 items-center text-size-body-m text-neutral-700">{boxes[Number(activePart)].composition}</p> : null}
      {blueprintMode !== "size" && boxes[Number(activePart)] && !boxes[Number(activePart)].spacing[blueprintMode].length ? <p className="pb-2 text-size-body-m text-neutral-700">{t(`blueprintEmpty.${blueprintMode}`)}</p> : null}
    </div> : null}
    <div className={` ${blueprint ? "overflow-auto" : clip ? "overflow-hidden" : "overflow-x-auto"} ${blueprint ? "flex min-h-36 items-center justify-center p-12" : fullBleed ? "" : "flex min-h-36 items-center justify-center p-6"} ${surfaceClassName ?? (dark ? tone === "solitaire" ? "bg-neutral-900" : "bg-pbrown-800" : "bg-neutral-100")}`}>
      <div ref={ref} inert={blueprint} data-catalog-state={state} style={width ? { width, maxWidth: "100%" } : undefined} className="relative min-w-0 font-sans" onClickCapture={(event) => {
        if (blueprint) {
          event.preventDefault();
          event.stopPropagation();
        }
        else if ((event.target as HTMLElement).closest("a")) event.preventDefault();
      }}>{children}{blueprint && boxes[Number(activePart)] ? <CatalogBlueprint box={boxes[Number(activePart)]} mode={blueprintMode} outlineOnly={Boolean(boxes[Number(activePart)].composition)} /> : null}</div>
    </div>
    {specs ? <details open={showSpecs || undefined} className="group border-t border-neutral-400 text-size-body-m text-neutral-700">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-200"><span className="font-sans">{specs.dimensions}</span><span>{t("allSpecs")} <ChevronDown aria-hidden className="inline size-3 group-open:rotate-180" /></span></summary>
      <CatalogSpecs specs={specs} />
    </details> : null}
  </article>;
}
