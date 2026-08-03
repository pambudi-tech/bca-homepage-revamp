import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { MegaMenuCategory } from "./megamenu-data";

/* Icons are inlined so hover states can recolour them via `currentColor`. */

function ArrowRight({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M9.29272 3.45947C9.68319 3.069 10.3162 3.06911 10.7068 3.45947L16.5408 9.29248C16.9312 9.6829 16.931 10.316 16.5408 10.7065L10.7068 16.5405C10.3162 16.9307 9.68314 16.9309 9.29272 16.5405C8.90231 16.1501 8.90253 15.517 9.29272 15.1265L13.4197 10.9995H4.16675C3.61446 10.9995 3.16675 10.5518 3.16675 9.99951C3.16692 9.44738 3.61457 8.99951 4.16675 8.99951H13.4197L9.29272 4.87354C8.90242 4.48305 8.90242 3.84996 9.29272 3.45947Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Which motion the panel plays — see the `.mm-panel` rules in globals.css. */
export type MegaMenuMode = "open" | "switch" | "close" | "out";

export default function MegaMenuPanel({
  category,
  mode,
}: {
  category: MegaMenuCategory;
  mode: MegaMenuMode;
}) {
  const t = useTranslations("common");
  /* Longest stagger column: the products plus the CTA beneath them. The close
     animation counts backwards from this to empty the panel bottom-up. */
  const rowCount = category.products.length + 1;

  return (
    <div
      data-mode={mode}
      style={{ "--mm-n": rowCount } as CSSProperties}
      className="mm-panel w-full max-w-[1920px] overflow-hidden rounded-b-3xl bg-white"
    >
      <div className="mm-content mx-auto flex w-[1280px] items-stretch gap-20 py-4">
        {/* product list + article links */}
        <div className="flex gap-2">
          <div className="flex w-[360px] flex-col">
            <div className="flex flex-col">
              {category.products.map((product, i) => (
                <button
                  key={product}
                  style={{ "--mm-i": i } as CSSProperties}
                  className="mm-item group flex items-center justify-between rounded-xl px-4 pb-4 pt-3 text-left transition-colors duration-200 hover:bg-cyan-100"
                >
                  <span className="text-title text-neutral-800 transition-colors duration-200 group-hover:font-bold group-hover:text-blue-500">
                    {product}
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            <div className="mm-item mt-auto p-4" style={{ "--mm-i": category.products.length } as CSSProperties}>
              <button className="flex items-center gap-0.5 text-base font-semibold leading-4 text-blue-500 transition-transform duration-200 hover:translate-x-0.5">
                {category.ctaLabel}
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className="flex w-[360px] flex-col gap-2">
            {category.links.map((link, i) => (
              <button
                key={`${link.label}-${i}`}
                style={{ "--mm-i": i } as CSSProperties}
                className="mm-item group flex w-full items-center gap-3 rounded-xl px-3 pb-3 pt-2 text-left transition-colors duration-200 hover:bg-cyan-100"
              >
                <span className="flex-1 text-sm font-semibold leading-5 text-neutral-700 transition-colors duration-200 group-hover:text-blue-500">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* editorial / marketing space */}
        <div
          className="mm-item group relative flex-1 overflow-hidden rounded-3xl"
          style={{ "--mm-i": 2 } as CSSProperties}
        >
          <img loading="lazy" decoding="async"
            src={category.editorial.image}
            alt=""
            className="size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[212px] bg-gradient-to-t from-black/50 to-[rgba(18,20,23,0)]" />
          <div className="absolute bottom-2 left-2 flex w-[240px] flex-col overflow-hidden rounded-2xl border border-white/35 bg-black/30 px-5 pb-5 pt-4 backdrop-blur-[10px]">
            <p className="text-subtitle text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
              {category.editorial.title}
            </p>
            {/* Revealed on hover; the 32px gap collapses with it. */}
            <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
              <span className="overflow-hidden">
                <span className="mt-8 flex h-5 items-center gap-0.5 text-sm font-semibold leading-[14px] text-white">
                  {t("learnMore")}
                  <ArrowRight />
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
