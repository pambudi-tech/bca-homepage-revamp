"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useSlidingIndicator } from "@/lib/useSlidingIndicator";

type Segment = "solitaire" | "prioritas";
export const SOLIPRIO_SEGMENT_EVENT = "bca:soliprio-segment-change";

export default function SoliprioSegmentSelector({ value, onChange, surface = "inverse", label, defaultOption }: { value?: Segment; onChange?: (segment: Segment) => void; surface?: "inverse" | "default"; label?: string; defaultOption?: { label: string; active: boolean; onSelect: () => void } }) {
  const t = useTranslations("nav.segments");
  const [active, setActive] = useState<Segment>("prioritas");

  useEffect(() => {
    if (value !== undefined) return;
    const syncSegment = (event: Event) => {
      setActive((event as CustomEvent<Segment>).detail);
    };
    window.addEventListener(SOLIPRIO_SEGMENT_EVENT, syncSegment);
    return () => window.removeEventListener(SOLIPRIO_SEGMENT_EVENT, syncSegment);
  }, [value]);

  const indicatorRef = useSlidingIndicator(defaultOption?.active ? "default" : value ?? active);

  const selectSegment = (segment: Segment) => {
    if (value !== undefined) {
      onChange?.(segment);
      return;
    }
    setActive(segment);
    window.dispatchEvent(new CustomEvent<Segment>(SOLIPRIO_SEGMENT_EVENT, { detail: segment }));
  };

  return (
    <div ref={indicatorRef} role="group" aria-label={label} className={`relative flex h-10 w-fit items-center rounded-full border p-1 backdrop-blur-[40px] ${surface === "inverse" ? "border-white/15 bg-black/20" : "border-neutral-300 bg-neutral-200"}`}>
      <span data-sliding-indicator aria-hidden className={`pointer-events-none absolute left-0 top-0 rounded-full opacity-0 transition-[transform,width,height,background-color] duration-300 ease-out motion-reduce:transition-none ${!defaultOption?.active && (value ?? active) === "prioritas" ? "bg-pgold-500" : "bg-neutral-800"}`} />
      {(["prioritas", "solitaire"] as const).map((segment) => {
        const selected = !defaultOption?.active && (value ?? active) === segment;
        return (
          <button
            key={segment}
            type="button"
            aria-pressed={selected}
            onClick={() => selectSegment(segment)}
            className={`relative z-10 flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-size-body-m font-semibold transition-colors duration-300 ${selected || surface === "inverse" ? "text-neutral-100" : "text-neutral-800"} ${
              selected ? "bg-transparent" : surface === "inverse" ? "hover:bg-neutral-100/10" : "hover:bg-neutral-300"
            }`}
          >
            {t(segment === "prioritas" ? "Prioritas" : "Solitaire")}
          </button>
        );
      })}
      {defaultOption ? <button type="button" aria-pressed={defaultOption.active} onClick={defaultOption.onSelect} className={`relative z-10 flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-size-body-m font-semibold transition-colors duration-300 ${defaultOption.active ? "text-neutral-100" : "text-neutral-800 hover:bg-neutral-300"}`}>{defaultOption.label}</button> : null}
    </div>
  );
}
