import type { CSSProperties } from "react";
import type { MegaMenuCategory, MegaMenuLink } from "./megamenu-data";

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

function DocIcon() {
  return (
    <svg viewBox="0 0 21.5 21.5" fill="none" className="size-6" aria-hidden>
      <path
        d="M13.75 21.5H7.75C2.32 21.5 0 19.18 0 13.75V7.75C0 2.32 2.32 0 7.75 0H12.75C13.16 0 13.5 0.34 13.5 0.75C13.5 1.16 13.16 1.5 12.75 1.5H7.75C3.14 1.5 1.5 3.14 1.5 7.75V13.75C1.5 18.36 3.14 20 7.75 20H13.75C18.36 20 20 18.36 20 13.75V8.75C20 8.34 20.34 8 20.75 8C21.16 8 21.5 8.34 21.5 8.75V13.75C21.5 19.18 19.18 21.5 13.75 21.5Z"
        fill="currentColor"
      />
      <path
        d="M20.75 9.5005H16.75C13.33 9.5005 12 8.17048 12 4.75048V0.75048C12 0.45048 12.18 0.17048 12.46 0.06048C12.74 -0.05952 13.06 0.0104799 13.28 0.22048L21.28 8.22048C21.49 8.43048 21.56 8.7605 21.44 9.0405C21.32 9.3205 21.05 9.5005 20.75 9.5005ZM13.5 2.56048V4.75048C13.5 7.33048 14.17 8.00048 16.75 8.00048H18.94L13.5 2.56048Z"
        fill="currentColor"
      />
      <path
        d="M11.75 12.5H5.75C5.34 12.5 5 12.16 5 11.75C5 11.34 5.34 11 5.75 11H11.75C12.16 11 12.5 11.34 12.5 11.75C12.5 12.16 12.16 12.5 11.75 12.5Z"
        fill="currentColor"
      />
      <path
        d="M9.75 16.5H5.75C5.34 16.5 5 16.16 5 15.75C5 15.34 5.34 15 5.75 15H9.75C10.16 15 10.5 15.34 10.5 15.75C10.5 16.16 10.16 16.5 9.75 16.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 21.5 17.5" fill="none" className="size-6" aria-hidden>
      <path
        d="M15.75 17.5H5.75C2.31 17.5 0 15.19 0 11.75V5.75C0 2.31 2.31 0 5.75 0H15.75C19.19 0 21.5 2.31 21.5 5.75V11.75C21.5 15.19 19.19 17.5 15.75 17.5ZM5.75 1.5C3.17 1.5 1.5 3.17 1.5 5.75V11.75C1.5 14.33 3.17 16 5.75 16H15.75C18.33 16 20 14.33 20 11.75V5.75C20 3.17 18.33 1.5 15.75 1.5H5.75Z"
        fill="currentColor"
      />
      <path
        d="M9.3401 12.2792C9.0501 12.2792 8.7701 12.2092 8.52014 12.0692C7.94014 11.7392 7.6001 11.0692 7.6001 10.2392V7.2792C7.6001 6.44924 7.93014 5.77925 8.52014 5.44925C9.1001 5.11925 9.8501 5.17923 10.5601 5.60923L13.0302 7.0892C13.7102 7.4992 14.1001 8.1093 14.1001 8.7593C14.1001 9.4093 13.7102 10.0192 13.0302 10.4292L10.5601 11.9092C10.1501 12.1492 9.7301 12.2792 9.3401 12.2792ZM9.3401 6.71924C9.3001 6.71924 9.2701 6.72923 9.2501 6.73923C9.1801 6.7792 9.1001 6.9592 9.1001 7.2692V10.2293C9.1001 10.5293 9.1801 10.7093 9.2501 10.7593C9.3301 10.7993 9.5202 10.7792 9.7802 10.6192L12.2501 9.1393C12.5001 8.9893 12.5901 8.8392 12.5901 8.7492C12.5901 8.6592 12.5001 8.5192 12.2501 8.3592L9.7802 6.8792C9.6002 6.7692 9.4401 6.71924 9.3401 6.71924Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkIcon({ type }: { type: MegaMenuLink["type"] }) {
  return type === "video" ? <VideoIcon /> : <DocIcon />;
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
  /* Longest stagger column: the products plus the CTA beneath them. The close
     animation counts backwards from this to empty the panel bottom-up. */
  const rowCount = category.products.length + 1;

  return (
    <div
      data-mode={mode}
      style={{ "--mm-n": rowCount } as CSSProperties}
      className="mm-panel w-full max-w-[1920px] overflow-hidden rounded-b-3xl bg-white"
    >
      <div className="mm-content mx-auto flex h-[400px] w-[1280px] items-center gap-20 py-4">
        {/* product list + article links */}
        <div className="flex h-full gap-2">
          <div className="flex h-full w-[360px] flex-col justify-between">
            <div className="flex flex-col">
              {category.products.map((product, i) => (
                <button
                  key={product}
                  style={{ "--mm-i": i } as CSSProperties}
                  className="mm-item group flex items-center justify-between rounded-xl px-4 pb-4 pt-3 text-left transition-colors duration-200 hover:bg-cyan-100"
                >
                  <span className="text-xl font-semibold leading-7 tracking-[-0.4px] text-neutral-700 transition-colors duration-200 group-hover:font-bold group-hover:text-blue-500">
                    {product}
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            <div className="mm-item p-4" style={{ "--mm-i": category.products.length } as CSSProperties}>
              <button className="flex items-center gap-0.5 text-base font-semibold leading-4 text-blue-500 transition-transform duration-200 hover:translate-x-0.5">
                {category.ctaLabel}
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className="flex h-full w-[360px] flex-col gap-2">
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
          className="mm-item group relative h-full flex-1 overflow-hidden rounded-3xl"
          style={{ "--mm-i": 2 } as CSSProperties}
        >
          <img loading="lazy" decoding="async"
            src={category.editorial.image}
            alt=""
            className="size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[212px] bg-gradient-to-t from-black/50 to-[rgba(18,20,23,0)]" />
          <div className="absolute bottom-2 left-2 flex w-[240px] flex-col overflow-hidden rounded-2xl border border-white/35 bg-black/30 px-5 pb-5 pt-4 backdrop-blur-[10px]">
            <p className="text-lg font-semibold leading-[26px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
              {category.editorial.title}
            </p>
            {/* Revealed on hover; the 32px gap collapses with it. */}
            <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr]">
              <span className="overflow-hidden">
                <span className="mt-8 flex h-5 items-center gap-0.5 text-sm font-semibold leading-[14px] text-white">
                  Pelajari
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
