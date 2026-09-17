"use client";

import SoliprioPhoto from "./SoliprioPhoto";
import SoliprioBenefitCards, { type SoliprioBenefit } from "./SoliprioBenefitCards";
import SoliprioSegmentSelector from "./SoliprioSegmentSelector";
import { Glow, Logos } from "./soliprio-parts";

const DRIFT = 12;

export default function SoliprioMobile({
  title,
  description,
  benefits,
}: {
  title: string;
  description: string;
  benefits: readonly SoliprioBenefit[];
}) {
  return (
    <div
      data-reveal-group
      className="relative h-[720px] overflow-clip bg-[#0f0f0f] xl:hidden"
    >
      <SoliprioPhoto
        className="absolute inset-x-0 top-[-32px] h-[390px]"
        imgClassName="absolute inset-0 size-full object-cover object-[calc(64%_-_56px)_center]"
        drift={DRIFT}
        controlledBySegment
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/45 to-[#0f0f0f]" />

      <Glow
        radius={360}
        sigma={40}
        className="left-1/2 top-[560px] -translate-x-1/2 -translate-y-1/2"
      />

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
        className="absolute inset-x-4 top-[128px] flex flex-col items-center gap-4"
      >
        <Logos variant="mobile" />
        <div className="flex max-w-[360px] flex-col gap-3">
          <p className="text-center text-2xl leading-[1.2] tracking-[-0.48px] text-white">
            {title}
          </p>
          <p className="text-center text-sm leading-5 text-white/70">
            {description}
          </p>
        </div>
        <SoliprioSegmentSelector />
      </div>

      <SoliprioBenefitCards
        benefits={benefits}
        className="absolute inset-x-0 top-[380px] snap-x snap-mandatory px-4 [scrollbar-width:none]"
      />
    </div>
  );
}
