"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";

export const DIRECTORY_PAGE_SIZE = 9;
const DIRECTORY_PANEL_CLASS = "relative -left-4 w-[calc(100%+2rem)] rounded-t-[20px] rounded-b-none bg-white shadow-card transition-[left,width,border-radius,box-shadow] duration-500 ease-in-out motion-reduce:transition-none xl:left-0 xl:w-full xl:rounded-xl";
const DIRECTORY_CONTENT_CLASS = "mx-auto w-full max-w-[1280px] p-4 xl:p-6";
const DIRECTORY_HEADER_CLASS = "relative z-20 -mx-4 -mt-4 rounded-t-[20px] bg-white px-4 pt-4 xl:-mx-6 xl:-mt-6 xl:rounded-t-xl xl:px-6 xl:pt-6";
const DIRECTORY_FILTER_CLASS = "relative mt-2 -mx-4 flex flex-col justify-between gap-3 px-4 pb-4 after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-screen after:-translate-x-1/2 after:bg-neutral-300 xl:-mx-6 xl:mt-3 xl:flex-row xl:items-center xl:px-6 xl:after:hidden xl:group-data-[expanded=true]/directory:after:block";
const DIRECTORY_GRID_CLASS = "relative z-0 mt-5 grid md:grid-cols-3";

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function getPaginationItems(current: number, total: number, maxItems: number): PaginationItem[] {
  if (total <= maxItems) return Array.from({ length: total }, (_, index) => index + 1);
  if (maxItems < 5) {
    const start = Math.max(1, Math.min(current - Math.floor(maxItems / 2), total - maxItems + 1));
    return Array.from({ length: maxItems }, (_, index) => start + index);
  }

  if (maxItems < 8) {
    if (current <= 3) {
      const visiblePages = maxItems - 2;
      return [...Array.from({ length: visiblePages }, (_, index) => index + 1), "end-ellipsis", total];
    }
    if (current >= total - 2) {
      const visiblePages = maxItems - 2;
      return [1, "start-ellipsis", ...Array.from({ length: visiblePages }, (_, index) => total - visiblePages + index + 1)];
    }

    const visibleCurrentPages = maxItems - 4;
    const start = current - Math.floor((visibleCurrentPages - 1) / 2);
    return [1, "start-ellipsis", ...Array.from({ length: visibleCurrentPages }, (_, index) => start + index), "end-ellipsis", total];
  }

  if (maxItems === 8) {
    if (current <= 4) return [1, 2, 3, 4, 5, 6, "end-ellipsis", total];
    if (current >= total - 3) return [1, "start-ellipsis", ...Array.from({ length: 6 }, (_, index) => total - 5 + index)];
    return [1, "start-ellipsis", current - 1, current, current + 1, "end-ellipsis", total];
  }

  const visiblePages = maxItems - 2;
  const visibleCurrentPages = maxItems - 4;
  const start = current - Math.floor((visibleCurrentPages - 1) / 2);
  const end = start + visibleCurrentPages - 1;
  if (start <= 2) {
    return [...Array.from({ length: visiblePages }, (_, index) => index + 1), "end-ellipsis", total];
  }
  if (end >= total - 1) {
    return [1, "start-ellipsis", ...Array.from({ length: visiblePages }, (_, index) => total - visiblePages + index + 1)];
  }
  return [1, "start-ellipsis", ...Array.from({ length: visibleCurrentPages }, (_, index) => start + index), "end-ellipsis", total];
}

function usePrioritasDirectoryExpansion(panelRef: RefObject<HTMLElement | null>) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    const tabs = document.querySelector<HTMLElement>("[data-prioritas-index-tabs]");
    if (!panel || !tabs) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      setExpanded(panel.getBoundingClientRect().top <= tabs.getBoundingClientRect().bottom + 1);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [panelRef]);

  return expanded;
}

export function PrioritasDirectoryCategories({ children, className = "" }: { children: ReactNode; className?: string }) {
  const t = useTranslations("signaturePrivilege");
  const railRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => setOverflow({
      left: rail.scrollLeft > 1,
      right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1,
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    Array.from(rail.children).forEach((child) => observer.observe(child));
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollCategories = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.75, behavior: "smooth" });
  };

  const arrowClassName = "pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/25 bg-pbrown-900/30 text-white backdrop-blur-md transition-colors hover:bg-pbrown-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pgold-500";

  return <div className={`${className} relative w-full max-w-full`}>
    <div ref={railRef} className="hide-scrollbar flex gap-2 overflow-x-auto [scrollbar-width:none] xl:gap-3">{children}</div>
    {overflow.left ? <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center bg-gradient-to-r from-white via-white/90 to-transparent pr-6">
      <button type="button" onClick={() => scrollCategories(-1)} aria-label={t("categoriesScrollPrevious")} className={arrowClassName}>
        <img src="/assets/cycle1/chevron-left-1.svg" alt="" className="size-5" />
      </button>
    </div> : null}
    {overflow.right ? <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center bg-gradient-to-l from-white via-white/90 to-transparent pl-6">
      <button type="button" onClick={() => scrollCategories(1)} aria-label={t("categoriesScrollNext")} className={arrowClassName}>
        <img src="/assets/cycle1/chevron-right-1.svg" alt="" className="size-5" />
      </button>
    </div> : null}
  </div>;
}

export function PrioritasDirectoryFilters({ children, count }: { children: ReactNode; count: ReactNode }) {
  return <div className={DIRECTORY_FILTER_CLASS}>
    {children}
    <p className="text-sm text-neutral-700">{count}</p>
  </div>;
}

function PrioritasDirectoryPagination({ page, total, pageSize, onPageChange, label, placement = "bottom", desktopPageItems, tone = "prioritas" }: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  placement?: "top" | "bottom";
  desktopPageItems?: number;
  tone?: "prioritas" | "solitaire";
}) {
  const t = useTranslations("signaturePrivilege");
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paginationRef = useRef<HTMLDivElement>(null);
  const [maxPageItems, setMaxPageItems] = useState(6);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const solitaire = tone === "solitaire";

  useEffect(() => {
    const pagination = paginationRef.current;
    if (!pagination) return;

    const update = () => {
      // Keep the 48px navigation arrows and 40px page controls intact. Each
      // page item plus its 8px gap uses 48px; the arrows and outer gaps use 112px.
      if (desktopPageItems !== undefined && window.matchMedia("(min-width: 1280px)").matches) {
        setMaxPageItems(desktopPageItems);
        return;
      }

      const availablePageWidth = pagination.clientWidth - 112;
      setMaxPageItems(Math.max(1, Math.floor((availablePageWidth + 8) / 48)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(pagination);
    return () => observer.disconnect();
  }, [desktopPageItems]);

  return <nav aria-label={label ?? t("paginationLabel")} className={placement === "top" ? "mx-auto flex w-fit items-center justify-center gap-3 xl:mx-0 xl:w-full xl:justify-between" : "mt-6 -mx-4 flex flex-col items-start xl:mx-0 xl:h-24 xl:flex-row xl:items-center xl:justify-between xl:gap-0"}>
    <p className="hidden text-sm font-semibold text-neutral-600 xl:block">{t("paginationSummary", { from, to, total })}</p>
    <div ref={paginationRef} className={`flex min-w-0 items-center justify-center gap-2 ${placement === "top" ? "w-fit xl:ml-auto" : "w-full xl:w-auto xl:self-auto xl:justify-start"}`}>
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${solitaire ? "border border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-800" : "bg-white text-pbrown-200 hover:bg-pgold-100"}`} aria-label={t("paginationPrevious")}><span aria-hidden className={`size-5 rotate-180 ${solitaire ? "bg-neutral-800" : "bg-pgold-500"} [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]`} /></button>
      {getPaginationItems(page, pageCount, maxPageItems).map((item) => typeof item === "number" ? <button key={item} type="button" onClick={() => onPageChange(item)} aria-current={item === page ? "page" : undefined} className={`flex size-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${solitaire ? item === page ? "border-neutral-800 bg-[linear-gradient(to_bottom,var(--color-neutral-100),var(--color-neutral-300))] text-neutral-800" : "border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-800" : item === page ? "border-pgold-500 bg-pgold-200 text-pbrown-600" : "border-neutral-300 bg-white text-neutral-800 hover:border-pgold-500"}`}>{item}</button> : <button key={item} type="button" onClick={() => onPageChange(Math.max(1, Math.min(pageCount, page + (item === "start-ellipsis" ? -5 : 5))))} aria-label={t(item === "start-ellipsis" ? "paginationJumpBackward" : "paginationJumpForward", { count: 5 })} className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${solitaire ? "border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-800 focus-visible:outline-neutral-800" : "border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200 focus-visible:outline-pgold-500"}`}>•••</button>)}
      <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)} className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${solitaire ? "border border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-800" : "bg-white text-pbrown-200 hover:bg-pgold-100"}`} aria-label={t("paginationNext")}><span aria-hidden className={`size-5 ${solitaire ? "bg-neutral-800" : "bg-pgold-500"} [mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/detail/molton-brown/chevron-right.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]`} /></button>
    </div>
  </nav>;
}

export function PrioritasDirectoryPanel({ headingId, header, children, emptyMessage, page, total, pageSize = DIRECTORY_PAGE_SIZE, onPageChange, paginationLabel, paginationPlacement = "bottom", desktopPageItems, gridClassName = "", gridGap = "normal", panelRef, spacing = "none", tone = "prioritas" }: {
  headingId: string;
  header: ReactNode;
  children: ReactNode;
  emptyMessage: string;
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  paginationLabel?: string;
  paginationPlacement?: "top" | "bottom";
  desktopPageItems?: number;
  gridClassName?: string;
  gridGap?: "normal" | "compact";
  panelRef?: RefObject<HTMLElement | null>;
  spacing?: "none" | "section";
  tone?: "prioritas" | "solitaire";
}) {
  const internalRef = useRef<HTMLElement>(null);
  const expanded = usePrioritasDirectoryExpansion(internalRef);
  const setPanelRef = useCallback((node: HTMLElement | null) => {
    internalRef.current = node;
    if (panelRef) panelRef.current = node;
  }, [panelRef]);

  return <section
    ref={setPanelRef}
    data-prioritas-directory
    data-expanded={expanded}
    className={`group/directory ${spacing === "section" ? "mt-10" : "mt-0"} ${DIRECTORY_PANEL_CLASS} ${expanded ? "shadow-none" : ""}`}
    style={expanded ? { left: "calc(50% - 50vw)", width: "100vw", borderRadius: 0 } : undefined}
    aria-labelledby={headingId}
  >
    <div className={DIRECTORY_CONTENT_CLASS}>
      <div className={`${DIRECTORY_HEADER_CLASS} ${paginationPlacement === "top" ? "pb-4" : ""}`}>
        {header}
        {paginationPlacement === "top" ? <PrioritasDirectoryPagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} label={paginationLabel} placement="top" desktopPageItems={desktopPageItems} tone={tone} /> : null}
      </div>
      <div className={`${DIRECTORY_GRID_CLASS} ${gridGap === "compact" ? "gap-4" : "gap-6"} ${gridClassName}`}>{children}</div>
      {total === 0 ? <p className="py-16 text-center text-neutral-600">{emptyMessage}</p> : null}
      {paginationPlacement === "bottom" ? <PrioritasDirectoryPagination page={page} total={total} pageSize={pageSize} onPageChange={onPageChange} label={paginationLabel} desktopPageItems={desktopPageItems} tone={tone} /> : null}
    </div>
  </section>;
}
