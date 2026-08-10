import { getLocale, getTranslations } from "next-intl/server";
import { getAverageColor, rgbToCss } from "@/lib/image-color";
import MyBcaParallax from "./MyBcaParallax";

export default async function MyBcaSection() {
  const locale = await getLocale();
  const t = await getTranslations("mybca");
  const backdropColor = await getAverageColor("/assets/mybca/bg.webp");
  const backdropCss = rgbToCss(backdropColor);
  const backdropFadeCss = rgbToCss(backdropColor, 0);
  const myBcaPageUrl = "https://www.bca.co.id/id/Individu/layanan/e-banking/myBCA";
  const appStoreUrl = "https://apps.apple.com/id/app/mybca-new-bca-banking-apps/id1440241902";
  const playStoreUrl = "https://play.google.com/store/apps/details?gl=ID&id=com.bca.mybca.omni.android";
  const appStoreBadgeUrl = locale === "zh"
    ? "https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/zh-tw?size=250x83"
    : "https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83";
  const playStoreBadgeUrl = locale === "zh"
    ? "https://upload.wikimedia.org/wikipedia/commons/5/5e/Google_Play_Store_badge_TW.svg"
    : "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(myBcaPageUrl)}`;

  return (
    <section className="relative">
      {/* ===== Desktop (>= xl): card left, phone-woman right, side by side.
           Entrance staggers back-to-front: phone-woman rises, then the glass
           card settles last (auto 90ms steps). ===== */}
      <div data-reveal-group className="relative hidden h-[460px] xl:block">
        <div className="absolute inset-0 overflow-clip">
          <img loading="lazy" decoding="async"
            src="/assets/mybca/bg.webp"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="absolute left-1/2 top-0 h-[460px] w-[1080px] -translate-x-1/2">
          <img loading="lazy" decoding="async"
            data-reveal
            src="/assets/mybca/phone-woman.webp"
            alt=""
            className="absolute left-[589px] top-1/2 h-[536px] w-auto -translate-y-1/2 object-cover"
          />

          <div data-reveal className="absolute bottom-0 left-0 flex h-[428px] w-[480px] flex-col items-center justify-between rounded-t-3xl border-2 border-white/15 bg-gradient-to-b from-[rgba(18,20,23,0.25)] to-[rgba(18,20,23,0.5)] px-8 pb-8 pt-6 text-center shadow-edge-left backdrop-blur-[14px]">
            <div className="flex w-full flex-col items-start gap-4 text-white">
              <p className="w-full text-[28px] font-semibold leading-10 tracking-[-0.64px] text-shadow-hero">
                {t("heading")}
              </p>
            </div>
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-4 rounded-[28px] bg-neutral-100 px-4 py-4 text-neutral-900">
              <a href={myBcaPageUrl} aria-label={t("scanQr")} className="flex h-full w-full justify-center rounded-2xl bg-neutral-100 p-2">
                <img loading="lazy" decoding="async" src={qrCodeUrl} alt={t("scanQr")} className="h-full w-auto object-contain" />
              </a>
              <div className="h-[148px] w-px bg-neutral-300" />
              <div className="flex w-full flex-col items-center gap-3 p-1">
                <p className="text-center text-sm font-semibold leading-4">{t("downloadPrompt")}</p>
                <div className="flex flex-col items-center gap-2">
                  <a href={appStoreUrl} aria-label={t("appStore")} className="block h-11 w-fit overflow-hidden rounded">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={appStoreBadgeUrl}
                      alt={t("appStore")}
                      className="h-full w-auto"
                    />
                  </a>
                  <a href={playStoreUrl} aria-label={t("googlePlay")} className="block h-11 w-fit overflow-hidden rounded">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={playStoreBadgeUrl}
                      alt={t("googlePlay")}
                      className="h-full w-auto"
                    />
                  </a>
                </div>
              </div>
            </div>
            <a href={myBcaPageUrl} className="btn-base w-fit border border-white bg-transparent text-white hover:bg-white/10">
              <span className="text-base font-semibold">{t("detail")}</span>
            </a>
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
              unclipped — mirrors the desktop phone-woman's negative top offset.
              MyBcaParallax drives the rise itself (continuous scroll-linked, unlike
              [data-reveal]'s one-shot intersection fade), so it owns the entrance here. */}
          <MyBcaParallax className="relative -mt-14 aspect-[392/412]">
            {/* Clipped at the card's top edge (17.6% overlap) so the subject never shows behind the glass. */}
            <div className="absolute inset-0 bottom-[17.6%] overflow-clip">
              <img loading="lazy" decoding="async"
                src="/assets/mybca/phone-woman-mobile.webp"
                alt="Aplikasi myBCA di genggaman"
                className="absolute left-[51.02%] top-0 w-[91.84%] -translate-x-1/2"
              />
            </div>
          </MyBcaParallax>

          {/* Glass card — pulled up to overlap the phone-woman's lower edge.
              data-reveal sits on this wrapper (not the .hero-search card) so
              the entrance never touches the backdrop-filter element. */}
          <div data-reveal className="relative -mt-[calc(17.6%+8px)] px-2.5">
            {/* Fill + outline reuse the product-card glass treatment: flat black 30%
                over a saturating backdrop filter, with `hero-search` painting the 2px
                top-lit gradient outline. */}
            <div
              className="hero-search relative flex flex-col items-center gap-8 overflow-clip rounded-t-3xl px-6 py-8 text-center shadow-edge-left"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(16px) saturate(1.25)",
                WebkitBackdropFilter: "blur(16px) saturate(1.25)",
                isolation: "isolate",
              }}
            >
              {/* Capped at the Figma text width so the heading keeps its 3-line wrap. */}
              <div className="flex w-full max-w-80 flex-col items-center gap-4">
                <p className="text-heading text-white text-shadow-hero">
                  {t("heading")}
                </p>
                <p className="w-64 max-w-full text-sm leading-5 text-neutral-500 opacity-80">
                  {t("description")}
                </p>
              </div>
              <a href={myBcaPageUrl} className="btn-base border border-white bg-transparent text-white hover:bg-white/10">
                <span className="text-base font-semibold text-neutral-100">{t("downloadMobile")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
