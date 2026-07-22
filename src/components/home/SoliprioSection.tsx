import { getTranslations } from "next-intl/server";
import { getBeamColor } from "@/lib/image-color";
import SoliprioCard from "./SoliprioCard";
import SoliprioMobile from "./SoliprioMobile";
import SoliprioPhoto from "./SoliprioPhoto";
import { Glow, Logos } from "./soliprio-parts";

/* Geometry mirrors Figma "Soliprio Section" (node 1669-6585). The desktop art
   direction is anchored to the viewport centre, not to the section's padding:
   every layer sits at `50% + <fixed offset>`, which is what keeps the family
   photo, the vignette and the arcs in the same relationship at 1280, 1512 and
   1920 while the band itself stays full-bleed. The numbers below are those
   offsets, taken straight from the design. */

/** Vertical drift for the desktop backdrop, in px each way. The band is 580px
 *  tall and crops a 656px photo, so 38px is already hidden above and below —
 *  staying inside that budget means the parallax never uncovers an edge. */
const PHOTO_DRIFT = 32;

/* `radius` is the corner radius baked into each .webp, scaled to the card's
   311.25x200 display size (measured 7.4px/8.1px at the original 249x160,
   ×1.25 for the taller card) — the border beam traces it so the ring sits on
   the artwork's edge rather than clipping across its rounded corners.

   `swapsPhoto` marks the card that owns the band's alternate backdrop: the
   default is the Prioritas photo, and Solitaire brings its own. */
const CARDS = [
  {
    key: "solitaire",
    src: "/assets/soliprio/bca-solitaire-card.webp",
    radius: "9.25px",
    beamDelay: "0s",
    swapsPhoto: true,
  },
  {
    key: "prioritas",
    src: "/assets/soliprio/bca-prioritas-card.webp",
    radius: "10.1px",
    // Half a lap behind, so the two beams never sweep in lockstep.
    beamDelay: "-2.25s",
    swapsPhoto: false,
  },
] as const;

export default async function SoliprioSection() {
  const t = await getTranslations("soliprio");
  // Sampled from the artwork at request time (and cached), so the beams stay
  // in step with the cards if the images are ever reshot.
  const beams = await Promise.all(CARDS.map((card) => getBeamColor(card.src)));
  const swapKey = CARDS.find((card) => card.swapsPhoto)?.key ?? "";

  return (
    <section id="soliprio" className="relative">
      {/* ===== Desktop (>= xl) ===== */}
      <div
        data-reveal-group
        className="soliprio-band relative hidden h-[580px] overflow-clip bg-[#0f0f0f] xl:block"
      >
        {/* Photo is pinned 92px from the left edge and bleeds 60px past the
            right one, so it grows with the viewport instead of re-cropping.
            Width is spelled out rather than left to `right: -60px`: an <img> is
            a replaced element, so with `width: auto` it would size itself from
            the intrinsic ratio and ignore the right offset entirely. */}
        <SoliprioPhoto
          className="absolute left-[92px] top-1/2 h-[656px] w-[calc(100%-32px)] -translate-y-1/2"
          imgClassName="absolute inset-0 size-full max-w-none object-cover"
          drift={PHOTO_DRIFT}
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

        {/* 530px column, left edge at centre − 608px (the 1216px content grid). */}
        <div className="absolute left-[calc(50%-343px)] top-[88px] flex w-[530px] -translate-x-1/2 flex-col gap-14">
          <div data-reveal className="flex w-[464px] flex-col gap-8">
            <Logos variant="desktop" />
            <p className="text-[32px] leading-10 tracking-[-0.64px] text-white">
              {t("title")}
            </p>
          </div>

          <div data-reveal className="flex items-center gap-8">
            {CARDS.map((card, i) => (
              <SoliprioCard
                key={card.key}
                src={card.src}
                label={t(card.key)}
                beam={beams[i]}
                beamRadius={card.radius}
                beamDelay={card.beamDelay}
                swapsPhoto={card.swapsPhoto}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== Mobile (< xl) ===== */}
      <SoliprioMobile
        title={t("title")}
        swapKey={swapKey}
        cards={CARDS.map((card) => ({
          key: card.key,
          src: card.src,
          label: t(card.key),
        }))}
      />
    </section>
  );
}
