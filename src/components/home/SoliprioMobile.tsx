"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SoliprioBenefitCards, { type SoliprioBenefit } from "./SoliprioBenefitCards";
import SoliprioSegmentSelector from "./SoliprioSegmentSelector";
import { SOLIPRIO_SEGMENT_EVENT } from "./SoliprioSegmentSelector";

export default function SoliprioMobile({
  title,
  description,
  prioritasBenefits,
  solitaireBenefits,
}: {
  title: string;
  description: string;
  prioritasBenefits: readonly SoliprioBenefit[];
  solitaireBenefits: readonly SoliprioBenefit[];
}) {
  const t = useTranslations("soliprio");
  const [segment, setSegment] = useState<"prioritas" | "solitaire">("prioritas");

  useEffect(() => {
    const onSegment = (event: Event) => setSegment((event as CustomEvent<"prioritas" | "solitaire">).detail);
    window.addEventListener(SOLIPRIO_SEGMENT_EVENT, onSegment);
    return () => window.removeEventListener(SOLIPRIO_SEGMENT_EVENT, onSegment);
  }, []);

  return (
    <div
      data-reveal-group
      className="relative h-[640px] overflow-clip bg-[#0f0f0f] xl:hidden"
    >
      <div className="pointer-events-none absolute left-1/2 top-[-46px] flex h-[1174px] w-[480px] -translate-x-1/2 items-center justify-center">
        <img
          loading="lazy"
          decoding="async"
          src="/assets/soliprio/soliprio-pattern.svg"
          alt=""
          aria-hidden
          className="h-[480px] w-[1174px] max-w-none rotate-90"
        />
      </div>

      <div
        data-reveal
        className="absolute inset-x-4 top-8 flex flex-col items-start gap-4"
      >
        <div className="flex max-w-[360px] flex-col items-start gap-3">
          <p className="text-left text-2xl leading-[1.2] tracking-[-0.48px] text-white">
            {title}
          </p>
          <p className="text-left text-sm leading-5 text-white/70">
            {description}
          </p>
        </div>
        <SoliprioSegmentSelector />
      </div>

      <SoliprioBenefitCards
        benefits={segment === "solitaire" ? solitaireBenefits : prioritasBenefits}
        className="absolute inset-x-0 top-[220px] snap-x snap-mandatory px-4 [scrollbar-width:none]"
      />
      <a
        href={segment === "prioritas" ? "https://prioritas.bca.co.id/en" : "https://prioritas.bca.co.id/en"}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-base absolute inset-x-4 top-[560px] w-auto border border-white bg-transparent font-semibold text-white hover:bg-white/10"
      >
        {t(segment === "prioritas" ? "visitPrioritas" : "visitSolitaire")}
      </a>
    </div>
  );
}
