import { getTranslations } from "next-intl/server";
import SoliprioBenefitCards from "./SoliprioBenefitCards";
import SoliprioMobile from "./SoliprioMobile";
import SoliprioPhoto from "./SoliprioPhoto";
import SoliprioSegmentSelector from "./SoliprioSegmentSelector";
import { Glow, Logos } from "./soliprio-parts";

/* Geometry mirrors Figma "Soliprio Section" (node 1669-6585). The desktop art
   direction is anchored to the viewport centre, not to the section's padding:
   every layer sits at `50% + <fixed offset>`, which is what keeps the family
   photo, the vignette and the arcs in the same relationship at 1280, 1512 and
   1920 while the band itself stays full-bleed. The numbers below are those
   offsets, taken straight from the design. */

/** Vertical drift for the desktop backdrop, in px each way. The band is 640px
 *  tall and crops a 722px photo (656px scaled 1.1x to cover the taller band),
 *  so 41px is already hidden above and below — staying inside that budget
 *  means the parallax never uncovers an edge. */
const PHOTO_DRIFT = 32;

export default async function SoliprioSection() {
  const t = await getTranslations("soliprio");
  const prioritasBenefits = [
    {
      key: "lounge",
      image: "/assets/soliprio/prioritas-lounge.webp",
      title: t("benefits.lounge.title"),
      cta: t("benefits.lounge.cta"),
    },
    {
      key: "healthcare",
      image: "/assets/soliprio/prioritas-healthcare.webp",
      title: t("benefits.healthcare.title"),
      cta: t("benefits.healthcare.cta"),
    },
    {
      key: "event",
      image: "/assets/soliprio/prioritas-event.webp",
      title: t("benefits.event.title"),
      cta: t("benefits.event.cta"),
    },
  ] as const;
  const solitaireBenefits = [
    {
      key: "personal-banker",
      image: "/assets/soliprio/personal-banker.png",
      title: t("solitaireBenefits.personalBanker.title"),
      cta: t("solitaireBenefits.personalBanker.cta"),
    },
    {
      key: "exclusive-community",
      image: "/assets/soliprio/exclusive-community.png",
      title: t("solitaireBenefits.exclusiveCommunity.title"),
      cta: t("solitaireBenefits.exclusiveCommunity.cta"),
    },
    prioritasBenefits[2],
  ] as const;

  return (
    <section id="soliprio" className="relative">
      {/* ===== Desktop (>= xl) ===== */}
      <div
        data-reveal-group
        className="soliprio-band relative hidden h-[720px] overflow-clip bg-[#0f0f0f] xl:block"
      >
        {/* Photo is pinned 92px from the left edge and bleeds 60px past the
            right one, so it grows with the viewport instead of re-cropping.
            Width is spelled out rather than left to `right: -60px`: an <img> is
            a replaced element, so with `width: auto` it would size itself from
            the intrinsic ratio and ignore the right offset entirely. */}
        <SoliprioPhoto
          className="absolute left-[92px] top-1/2 h-[722px] w-[calc(100%-32px)] -translate-y-1/2"
          imgClassName="absolute inset-0 size-full max-w-none object-cover"
          drift={PHOTO_DRIFT}
          controlledBySegment
        />

        <Glow
          radius={840}
          sigma={160}
          className="left-[calc(50%-668px)] top-[546px] -translate-x-1/2 -translate-y-1/2"
        />

        <img
          loading="lazy"
          decoding="async"
          src="/assets/soliprio/soliprio-pattern.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[calc(50%-391px)] top-[300px] h-[560px] w-[1370px] max-w-none -translate-x-1/2"
        />

        {/* Centred 1216px content grid, same one the rest of the page uses —
            padding instead of the old left-[calc(50%-343px)] +
            -translate-x-1/2 pair (the column's left edge sits at centre −
            608px either way, since a 1216px box centred by `mx-auto` starts
            exactly there). The full-bleed background layers above (photo,
            glow, pattern) are untouched siblings, so this only ever
            repositions the text/cards. */}
        <div className="absolute inset-0 mx-auto flex w-full max-w-[1216px] flex-col py-12">
          <div data-reveal className="flex w-[464px] flex-col gap-8">
            <Logos variant="desktop" />
            <div className="flex flex-col gap-3">
              <p className="text-display font-normal text-white">
                {t("title")}
              </p>
              <p className="w-[320px] text-base leading-6 text-white/70">
                {t("description")}
              </p>
            </div>
            <SoliprioSegmentSelector />
          </div>
          <SoliprioBenefitCards
            prioritasBenefits={prioritasBenefits}
            solitaireBenefits={solitaireBenefits}
            className="mt-auto overflow-visible"
          />
        </div>
      </div>

      {/* ===== Mobile (< xl) ===== */}
      <SoliprioMobile
        title={t("title")}
        description={t("description")}
        prioritasBenefits={prioritasBenefits}
        solitaireBenefits={solitaireBenefits}
      />
    </section>
  );
}
