"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Segment = "solitaire" | "prioritas";
export const SOLIPRIO_SEGMENT_EVENT = "bca:soliprio-segment-change";

export default function SoliprioSegmentSelector({ value, onChange, surface = "inverse", label }: { value?: Segment; onChange?: (segment: Segment) => void; surface?: "inverse" | "default"; label?: string }) {
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

  const selectSegment = (segment: Segment) => {
    if (value !== undefined) {
      onChange?.(segment);
      return;
    }
    setActive(segment);
    window.dispatchEvent(new CustomEvent<Segment>(SOLIPRIO_SEGMENT_EVENT, { detail: segment }));
  };

  return (
    <div role="group" aria-label={label} className={`flex h-10 w-fit items-center rounded-full border p-1 backdrop-blur-[40px] ${surface === "inverse" ? "border-white/15 bg-black/20" : "border-neutral-300 bg-neutral-200"}`}>
      {(["prioritas", "solitaire"] as const).map((segment) => {
        const selected = (value ?? active) === segment;
        return (
          <button
            key={segment}
            type="button"
            aria-pressed={selected}
            onClick={() => selectSegment(segment)}
            className={`flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${selected || surface === "inverse" ? "text-neutral-100" : "text-neutral-800"} ${
              selected
                ? segment === "prioritas"
                  ? "bg-prioritas-gold"
                  : "bg-neutral-600"
                : surface === "inverse" ? "hover:bg-neutral-100/10" : "hover:bg-neutral-300"
            }`}
          >
            {t(segment === "prioritas" ? "Prioritas" : "Solitaire")}
          </button>
        );
      })}
    </div>
  );
}
