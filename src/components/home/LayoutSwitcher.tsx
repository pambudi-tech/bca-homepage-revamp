"use client";

import { useEffect, useRef, useState } from "react";

export type LayoutOption<T extends string> = {
  value: T;
  name: string;
  description?: string;
};

/**
 * Prototype-only floating control pinned to a section's top-left corner.
 * Click the icon → a popover lists the layout variants available for that
 * section, so the client can flip between them live during a walkthrough.
 * The host section must be `position: relative`.
 *
 * Desktop-only by default (`visibilityClassName`) — most host sections only
 * offer desktop treatments, and on a phone the control would sit on top of
 * already-tight content. A section with an actual mobile-layout pair (e.g.
 * the hero widget) overrides it to render below `xl` instead.
 */
export default function LayoutSwitcher<T extends string>({
  label,
  options,
  value,
  onChange,
  positionClassName = "left-6 top-6",
  visibilityClassName = "hidden xl:block",
  menuAlign = "left",
  dimWhenIdle = false,
}: {
  label: string;
  options: LayoutOption<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Overrides the default top-left anchor (e.g. to float the control above a
   *  section whose corner is occupied). */
  positionClassName?: string;
  /** Overrides the default "desktop only" gate. */
  visibilityClassName?: string;
  /** Which edge the popover hangs from — "right" keeps it on-screen when the
   *  button itself is pinned near the right edge (e.g. on mobile). */
  menuAlign?: "left" | "right";
  /** Fades the button to 50% opacity until hovered/focused/opened, so it
   *  doesn't compete with the content it floats over. */
  dimWhenIdle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`absolute z-40 ${visibilityClassName} ${positionClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`Layout: ${label}`}
        aria-expanded={open}
        className={`flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-600 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur transition-[background-color,color,opacity] duration-200 hover:bg-white hover:text-blue-500 ${dimWhenIdle && !open ? "opacity-25 hover:opacity-100 focus-visible:opacity-100" : "opacity-100"
          }`}
      >
        {/* layout-grid icon */}
        <svg viewBox="0 0 20 20" fill="none" className="size-[18px]">
          <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 14.5 14.5)" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-11 w-72 max-w-[min(18rem,calc(100vw-32px))] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.16)] ${menuAlign === "right" ? "right-0" : "left-0"
            }`}
        >
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase leading-3 tracking-[1.4px] text-neutral-400">
            {label}
          </p>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                  active ? "bg-blue-100" : "hover:bg-neutral-100"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-blue-500 bg-blue-500" : "border-neutral-300"
                  }`}
                >
                  {active && (
                    <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                      <path d="M2.5 6.5 5 9l4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className={`text-sm font-semibold leading-5 ${active ? "text-blue-700" : "text-neutral-800"}`}>
                    {opt.name}
                  </span>
                  {opt.description && (
                    <span className="text-xs leading-4 text-neutral-500">{opt.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
