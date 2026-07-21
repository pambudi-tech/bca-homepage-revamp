import { getTranslations } from "next-intl/server";
import { getAverageColor, rgbToCss } from "@/lib/image-color";

export default async function MyBcaSection() {
  const t = await getTranslations("mybca");
  const backdropColor = await getAverageColor("/assets/mybca/bg.webp");
  const backdropCss = rgbToCss(backdropColor);
  const backdropFadeCss = rgbToCss(backdropColor, 0);

  return (
    <section className="relative">
      {/* ===== Desktop (>= xl): card left, phone-woman right, side by side.
           Entrance staggers back-to-front: phone-woman rises, then the glass
           card settles last (auto 90ms steps). ===== */}
      <div data-reveal-group className="relative hidden h-[360px] xl:block">
        <div className="absolute inset-0 overflow-clip">
          <img loading="lazy" decoding="async"
            src="/assets/mybca/bg.webp"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="absolute left-1/2 top-[-76px] h-[470px] w-[1080px] -translate-x-1/2">
          <img loading="lazy" decoding="async"
            data-reveal
            src="/assets/mybca/phone-woman.webp"
            alt=""
            className="absolute left-[589px] top-0 h-[470px] w-[507px] object-cover"
          />

          <div data-reveal className="absolute left-0 top-[108px] flex h-[328px] w-[480px] flex-col items-start justify-between rounded-t-3xl border-2 border-white/15 bg-gradient-to-b from-[rgba(18,20,23,0.25)] to-[rgba(18,20,23,0.5)] px-8 pb-10 pt-6 shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)] backdrop-blur-[14px]">
            <div className="flex w-full flex-col items-start gap-4 text-white">
              <p className="w-full text-[28px] font-semibold leading-10 tracking-[-0.64px] [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
                {t("heading")}
              </p>
              <p className="w-full text-base leading-6 text-neutral-500 opacity-80">
                {t("description")}
              </p>
            </div>
            <button className="flex h-12 items-center justify-center gap-1 rounded-full bg-blue-500 px-6 text-white">
              <img loading="lazy" decoding="async" src="/assets/mybca/icon-download.svg" alt="" className="size-5" />
              <span className="text-base font-semibold">{t("downloadDesktop")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile (< xl): phone-woman on top, glass card overlapping below.
           Same trick as desktop: the group itself has no overflow-clip, so the subject
           is free to overflow above the section. Only the backdrop (photo + matched
           fill) is clipped, flush to the section edge — seamless with whatever's above. ===== */}
      <div data-reveal-group className="relative xl:hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-clip">
          {/* Fixed clip window — the photo inside is taller and shifted up, but always
              gets cut off at this box's edges, so raising it never bleeds past the backdrop. */}
          <div className="absolute inset-x-0 top-12 h-[480px] overflow-clip">
            <img loading="lazy" decoding="async"
              src="/assets/mybca/bg.webp"
              alt=""
              className="absolute inset-x-0 top-[-80px] h-[560px] w-full object-cover"
            />
          </div>

          {/* Dissolves the photo's bottom edge into the matched fill below it. */}
          <div
            className="absolute inset-x-0 top-[412px] h-[116px]"
            style={{ backgroundImage: `linear-gradient(to bottom, ${backdropFadeCss}, ${backdropCss})` }}
          />

          {/* Matched fill for everything below the photo. */}
          <div className="absolute inset-x-0 top-[528px] bottom-0" style={{ backgroundColor: backdropCss }} />
        </div>

        <div className="relative mx-auto w-full max-w-[440px]">
          {/* Stage keeps the Figma 392x412 ratio so the overlap below scales with it.
              Lifted above the backdrop so the subject pokes into the section above,
              unclipped — mirrors the desktop phone-woman's negative top offset. */}
          <div className="relative -mt-14 aspect-[392/412]">
            {/* Clipped at the card's top edge (17.6% overlap) so the subject never shows behind the glass. */}
            <div className="absolute inset-0 bottom-[17.6%] overflow-clip">
              <img loading="lazy" decoding="async"
                data-reveal
                src="/assets/mybca/phone-woman-mobile.webp"
                alt="Aplikasi myBCA di genggaman"
                className="absolute left-[51.02%] top-0 w-[91.84%] -translate-x-1/2"
              />
            </div>
          </div>

          {/* Glass card — pulled up to overlap the phone-woman's lower edge.
              data-reveal sits on this wrapper (not the .hero-search card) so
              the entrance never touches the backdrop-filter element. */}
          <div data-reveal className="relative -mt-[calc(17.6%+8px)] px-2.5">
            {/* Fill + outline reuse the product-card glass treatment: flat black 30%
                over a saturating backdrop filter, with `hero-search` painting the 2px
                top-lit gradient outline. */}
            <div
              className="hero-search relative flex flex-col items-center gap-8 overflow-clip rounded-t-3xl px-6 py-8 text-center shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)]"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(16px) saturate(1.25)",
                WebkitBackdropFilter: "blur(16px) saturate(1.25)",
                isolation: "isolate",
              }}
            >
              {/* Capped at the Figma text width so the heading keeps its 3-line wrap. */}
              <div className="flex w-full max-w-80 flex-col items-center gap-4">
                <p className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-white [text-shadow:0px_2px_4px_rgba(0,0,0,0.15)]">
                  {t("heading")}
                </p>
                <p className="w-64 max-w-full text-sm leading-5 text-neutral-500 opacity-80">
                  {t("description")}
                </p>
              </div>
              <button className="flex h-10 items-center justify-center gap-1 rounded-full bg-blue-500 px-5 text-white transition-transform active:scale-95">
                <img loading="lazy" decoding="async" src="/assets/mybca/icon-download.svg" alt="" className="size-5" />
                <span className="text-sm font-semibold leading-[14px]">{t("downloadMobile")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
