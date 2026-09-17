"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useScrollLock } from "@/components/SmoothScroll";
import type { MegaMenuContent } from "@/lib/megamenu";
import type { ProductCategory } from "./product-data";
import type { MegaMenuTool } from "./megamenu-data";
import { useMegaMenu } from "./use-megamenu";

function ArrowRight({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M9.3 3.46a1 1 0 0 1 1.4 0l5.84 5.83a1 1 0 0 1 0 1.42l-5.84 5.83a1 1 0 0 1-1.4-1.41L13.42 11H4.17a1 1 0 1 1 0-2h9.25L9.3 4.87a1 1 0 0 1 0-1.41Z" fill="currentColor" />
    </svg>
  );
}

function UtilityIcon({ type }: { type: MegaMenuTool["icon"] }) {
  if (type === "calculator") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
        <rect x="5" y="3" width="22" height="26" rx="6" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9h12M11 15h2M16 15h2M21 15h1M11 20h2M16 20h2M21 20h1M11 25h2M16 25h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "gauge" || type === "profile") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
        <path d="M5 23a11 11 0 1 1 22 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m16 21 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="22" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (type === "reward" || type === "help") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
        <path d="M6 7h20v14a5 5 0 0 1-5 5h-5l-6 4v-4a4 4 0 0 1-4-4V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 13a3 3 0 1 1 5 2c-1 .7-2 1.2-2 3M16 22h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "compare") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
        <path d="M7 10h18M20 5l5 5-5 5M25 22H7M12 17l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" className="size-8" aria-hidden>
      <path d="M9 3h9l7 7v14a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 3v7h7M10 17h10M10 22h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductMegaMenuOverlay({
  open,
  onClose,
  productCategories,
  megamenuContent,
}: {
  open: boolean;
  onClose: () => void;
  productCategories?: ProductCategory[];
  megamenuContent?: MegaMenuContent;
}) {
  const categories = useMegaMenu(productCategories, megamenuContent);
  const tNav = useTranslations("nav");
  const tMobileMenu = useTranslations("mobileMenu");
  const [selectedKey, setSelectedKey] = useState(categories[0]?.key ?? "Simpanan");
  const selected = categories.find((category) => category.key === selectedKey) ?? categories[0];
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!selected) return null;

  const tools = selected.tools;
  const supportingLinks = selected.links.slice(0, 3);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tNav("produk")}
      className={`fixed inset-0 z-[60] transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none invisible opacity-0 delay-200"}`}
    >
      <button
        type="button"
        aria-label={tMobileMenu("tutupMenu")}
        onClick={onClose}
        className="absolute inset-0 hidden bg-black/60 backdrop-blur-[4px] xl:block"
      />

      <section
        className={`absolute inset-x-0 top-0 bottom-[calc(86px+env(safe-area-inset-bottom))] flex flex-col overflow-hidden bg-neutral-100 transition-transform duration-300 ease-[var(--ease-entrance)] xl:inset-auto xl:top-1/2 xl:right-[104px] xl:h-[90vh] xl:w-[840px] xl:-translate-y-1/2 xl:flex-row xl:rounded-3xl xl:shadow-panel ${open ? "translate-x-0" : "translate-x-6"}`}
      >
        <span aria-hidden className="absolute top-1/2 -right-2.5 hidden size-5 -translate-y-1/2 rotate-45 rounded-sm bg-white xl:block" />

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-300 px-4 xl:hidden">
          <h2 className="text-xl font-semibold text-neutral-900">{tNav("produk")}</h2>
          <button
            type="button"
            aria-label={tMobileMenu("tutupMenu")}
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="hide-scrollbar order-2 min-h-0 flex-1 overflow-y-auto px-4 pb-6 xl:order-1 xl:flex xl:flex-col xl:p-5">
          <div className="flex items-center justify-between gap-4 pb-3">
            <h2 className="text-title text-neutral-800">{selected.label}</h2>
            <button type="button" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-500">
              {selected.ctaLabel}<ArrowRight />
            </button>
          </div>

          <div className="relative h-[220px] shrink-0 overflow-hidden rounded-2xl xl:h-[320px]">
            <img
              src={selected.editorial.fallbackImage}
              alt=""
              className="size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-2 left-2 w-[calc(100%-16px)] max-w-[320px] rounded-2xl border border-white/35 bg-black/30 px-5 py-4 backdrop-blur-[16px]">
              <p className="text-subtitle text-white text-shadow-hero">{selected.editorial.title}</p>
            </div>
          </div>

          <div className="grid gap-5 pt-5 xl:min-h-0 xl:flex-1 xl:grid-cols-[1fr_1fr]">
            <div className="flex min-h-0 min-w-0 flex-col pb-4">
              <div className="flex flex-col xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
                {selected.products.map((product) => (
                  <button key={product.title} type="button" className="group w-full rounded-xl p-3 text-left transition-colors hover:bg-cyan-100">
                    <span className="block text-base font-semibold leading-6 text-neutral-900 transition-colors group-hover:text-blue-500">{product.title}</span>
                    {product.description ? <span className="mt-0.5 block text-xs leading-[18px] text-neutral-600">{product.description}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col border-t border-neutral-300 pt-5 xl:h-full xl:border-t-0 xl:border-l xl:pl-5 xl:pt-0">
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <button key={tool.label} type="button" className="flex min-h-28 flex-col items-start gap-3 rounded-xl border border-neutral-300 p-3 text-left text-blue-500 transition-colors hover:bg-cyan-100">
                    <span className="shrink-0"><UtilityIcon type={tool.icon} /></span>
                    <span className="text-sm font-semibold leading-5 text-neutral-800">{tool.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-auto flex flex-col pt-3">
                {supportingLinks.map((link) => (
                  <button key={link.label} type="button" className="flex items-center gap-3 rounded-xl px-2 py-3 text-left text-sm font-semibold leading-5 text-neutral-800 transition-colors hover:bg-cyan-100">
                    <span className="min-w-0 flex-1">{link.label}</span>
                    <ArrowRight className="size-5 shrink-0 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <nav aria-label={tNav("produk")} className="order-1 shrink-0 border-b border-neutral-300 bg-neutral-200 xl:order-2 xl:w-[136px] xl:border-b-0 xl:border-l">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto px-2 py-2 xl:h-full xl:flex-col xl:items-center xl:overflow-y-auto xl:px-2 xl:py-3">
            {categories.map((category) => {
              const active = category.key === selected.key;
              return (
                <button
                  key={category.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedKey(category.key)}
                  onPointerEnter={() => setSelectedKey(category.key)}
                  onFocus={() => setSelectedKey(category.key)}
                  className={`flex w-[92px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl px-2 py-2 text-center transition-colors xl:h-[88px] xl:w-[120px] ${active ? "bg-cyan-100 text-blue-500 outline outline-1 outline-cyan-500" : "text-neutral-700 hover:bg-neutral-200"}`}
                >
                  <img src={category.icon} alt="" className="size-9 xl:size-10" />
                  <span className={`text-sm leading-5 ${active ? "font-bold" : "font-semibold"}`}>{category.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </section>
    </div>
  );
}
