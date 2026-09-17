"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Segment = "solitaire" | "prioritas";
export const SOLIPRIO_SEGMENT_EVENT = "bca:soliprio-segment-change";

export default function SoliprioSegmentSelector() {
  const t = useTranslations("nav.segments");
  const [active, setActive] = useState<Segment>("prioritas");

  useEffect(() => {
    const syncSegment = (event: Event) => {
      setActive((event as CustomEvent<Segment>).detail);
    };
    window.addEventListener(SOLIPRIO_SEGMENT_EVENT, syncSegment);
    return () => window.removeEventListener(SOLIPRIO_SEGMENT_EVENT, syncSegment);
  }, []);

  const selectSegment = (segment: Segment) => {
    setActive(segment);
    window.dispatchEvent(new CustomEvent<Segment>(SOLIPRIO_SEGMENT_EVENT, { detail: segment }));
  };

  return (
    <div className="flex h-10 w-fit items-center rounded-full border border-white/15 bg-black/20 p-1 backdrop-blur-[40px]">
      {(["prioritas", "solitaire"] as const).map((segment) => {
        const selected = active === segment;
        return (
          <button
            key={segment}
            type="button"
            aria-pressed={selected}
            onClick={() => selectSegment(segment)}
            className={`flex h-8 min-w-24 items-center justify-center rounded-full px-4 text-sm font-semibold text-neutral-100 transition-colors duration-300 ${
              selected
                ? segment === "prioritas"
                  ? "bg-prioritas-gold"
                  : "bg-neutral-600"
                : "hover:bg-neutral-100/10"
            }`}
          >
            {t(segment === "prioritas" ? "Prioritas" : "Solitaire")}
          </button>
        );
      })}
    </div>
  );
}
