import type { CSSProperties } from "react";
import type { MegaMenuCategory, MegaMenuLink } from "./megamenu-data";
import { Link } from "@/i18n/navigation";

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

const LINK_ICONS: Record<NonNullable<MegaMenuLink["type"]>, string> = {
  article: "/assets/navbar/icon-doc.svg",
  video: "/assets/navbar/icon-youtube.svg",
};

export default function MegaMenuPanel({
  category,
  mode,
}: {
  category: MegaMenuCategory;
  mode: MegaMenuMode;
}) {
  const tools = category.links.slice(0, 2);
  const links = category.links.slice(2);
  const rowCount = category.products.length + tools.length + links.length + 2;

  return (
    <div
      data-mode={mode}
      style={{ "--mm-n": rowCount } as CSSProperties}
      className="mm-panel w-full max-w-[1920px] overflow-hidden rounded-b-3xl bg-white"
    >
      <div className="mm-content mx-auto flex h-[480px] w-[1280px] gap-5 py-4">
        {/* Editorial image — restored to the left-hand hero column. */}
        <div
          className="mm-item group relative h-full w-[400px] shrink-0 overflow-hidden rounded-xl"
          style={{ "--mm-i": 0 } as CSSProperties}
        >
          <img
            loading="lazy"
            decoding="async"
            src={category.editorial.image}
            alt=""
            className="size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[212px] bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 w-[240px] rounded-2xl border border-white/35 bg-black/30 px-5 py-4 backdrop-blur-[10px]">
            <p className="text-subtitle text-white text-shadow-hero">{category.editorial.title}</p>
          </div>
        </div>

        {/* Product list — restored to the centre column. */}
        <div className="flex h-full w-[420px] shrink-0 flex-col justify-between">
          <div>
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[1.8px] text-neutral-600">
              {category.label}
            </p>
            <div className="flex flex-col">
              {category.products.map((product, i) => (
                <button
                  key={product.title}
                  style={{ "--mm-i": i + 1 } as CSSProperties}
                  className="mm-item group flex w-full flex-col items-start gap-0.5 rounded-xl px-4 pb-4 pt-3 text-left transition-colors duration-200 hover:bg-cyan-100"
                >
                  <span className="text-base font-semibold leading-6 text-neutral-800 transition-colors duration-200 group-hover:text-blue-500">
                    {product.title}
                  </span>
                  {product.description && (
                    <span className="text-sm leading-5 text-neutral-600">{product.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {category.key === "Kartu Kredit" ? (
            <Link
              href="/kartu-kredit"
              style={{ "--mm-i": category.products.length + 1 } as CSSProperties}
              className="mm-item flex w-fit items-center gap-0.5 px-4 text-base font-semibold text-blue-500 transition-transform duration-200 hover:translate-x-0.5"
            >
              {category.ctaLabel}
              <ArrowRight />
            </Link>
          ) : (
            <button
              style={{ "--mm-i": category.products.length + 1 } as CSSProperties}
              className="mm-item flex w-fit items-center gap-0.5 px-4 text-base font-semibold text-blue-500 transition-transform duration-200 hover:translate-x-0.5"
            >
              {category.ctaLabel}
              <ArrowRight />
            </button>
          )}
        </div>

        <div className="h-full w-px shrink-0 bg-neutral-200" />

        {/* Tools and supporting links — restored to the right-hand column. */}
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
          <div className="flex gap-4">
            {tools.map((tool, i) => (
              <button
                key={tool.label}
                style={{ "--mm-i": category.products.length + i + 2 } as CSSProperties}
                className="mm-item flex h-[180px] flex-1 flex-col justify-between rounded-xl border border-neutral-200 p-5 text-left transition-colors duration-200 hover:bg-cyan-100"
              >
                <img src={LINK_ICONS[tool.type ?? "article"]} alt="" className="size-10" />
                <span className="text-base font-semibold leading-6 text-neutral-800">{tool.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            {links.map((link, i) => (
              <button
                key={link.label}
                style={{ "--mm-i": category.products.length + tools.length + i + 2 } as CSSProperties}
                className="mm-item flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors duration-200 hover:bg-cyan-100"
              >
                <span className="flex size-8 shrink-0 items-center justify-center">
                  <img src={LINK_ICONS[link.type ?? "article"]} alt="" className="size-6" />
                </span>
                <span className="flex-1 text-sm font-semibold leading-5 text-neutral-800">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
