import { PROMOS, getPromoBadge, getPromoTimestamp, type PromoBadgeKey } from "./promo-data";
import Confetti from "./Confetti";
// import PercentGlass from "./PercentGlass"; // temporarily hidden

const RIBBON_STYLE: Record<Exclude<PromoBadgeKey, "default">, { from: string; to: string; shadow: string; text: string }> = {
  mostLiked: { from: "#00b5f0", to: "#00a5db", shadow: "#01759a", text: "#ffffff" },
  new: { from: "#fe924d", to: "#fe6706", shadow: "#b24906", text: "#ffffff" },
  almostEnd: { from: "#ffd31c", to: "#ffba00", shadow: "#b28301", text: "#4c3801" },
  upcoming: { from: "#9531a5", to: "#70257c", shadow: "#501b58", text: "#ffffff" },
  expired: { from: "#cd1923", to: "#9f141b", shadow: "#850e14", text: "#ffffff" },
};

// Elevated shadow used on hover (Figma "Shadows/Default", scaled up).
const CARD_SHADOW =
  "0 1px 2px 0 rgba(204,204,204,0.14), 0 5px 5px 0 rgba(204,204,204,0.12), 0 10px 6px 0 rgba(204,204,204,0.10), 0 18px 20px -8px rgba(0,92,170,0.18)";

function PromoRibbon({ badgeKey, label }: { badgeKey: Exclude<PromoBadgeKey, "default">; label: string }) {
  const style = RIBBON_STYLE[badgeKey];
  return (
    <div className="absolute right-[-8px] top-40 flex items-center">
      {/* folded-corner shadow — absolute + rendered first, so the `relative` main
          ribbon below paints on top of it (shadow tucks BEHIND the ribbon). */}
      <div className="absolute right-0 top-6 flex h-5 w-2 items-center justify-center">
        <div className="rotate-90">
          <div className="h-2 w-5 rounded-t-[40px]" style={{ backgroundColor: style.shadow }} />
        </div>
      </div>
      <div
        className="relative flex h-9 shrink-0 items-center justify-end overflow-clip rounded-bl-3xl rounded-br-[4px] rounded-tr-lg border-b-2 px-6 pb-3.5 pt-3"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${style.from}, ${style.to})`,
          borderColor: "rgba(0,0,0,0.3)",
        }}
      >
        <p className="whitespace-nowrap text-sm font-semibold leading-5" style={{ color: style.text }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function PromoCard({ promo, now }: { promo: (typeof PROMOS)[number]; now: Date }) {
  const badge = getPromoBadge(promo, now);
  const timestamp = getPromoTimestamp(promo, now, badge);

  return (
    <div className="group relative h-[360px] w-[260px] shrink-0 transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1.5 xl:w-[302px]">
      <div className="absolute inset-0 flex flex-col items-start overflow-clip rounded-3xl border border-[#e9ecef] bg-white transition-colors duration-300 group-hover:border-[#00b5f0]">
        <div className="relative h-40 w-full shrink-0 overflow-clip">
          <img
            src={promo.cover}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {/* blue gradient overlay — hidden by default, revealed on hover */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[120px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "linear-gradient(to bottom, rgba(0,181,240,0) 0%, #005caa 100%)" }}
          />
          {/* arrow — appears on hover over the overlay */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute bottom-2 right-4 size-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <path d="M4 12h15M13 6l6 6-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="relative w-full flex-1">
          <div className="absolute left-5 right-5 top-12 flex flex-col items-start gap-1.5">
            <p className="line-clamp-2 w-full text-base font-bold leading-6 text-[#26292c] transition-colors duration-300 group-hover:text-[#005caa] xl:text-[18px] xl:leading-[1.2] xl:tracking-[-0.36px]">
              {promo.title}
            </p>
            <p className="w-full text-sm font-semibold leading-5 text-[#495057] xl:text-base">{promo.brand}</p>
          </div>
          <div className="absolute bottom-5 left-5 flex h-10 min-w-10 items-center gap-1 overflow-clip rounded-xl border border-[#e9ecef] bg-white p-3">
            <img src="/assets/promo/icon-clock.svg" alt="" className="size-5 shrink-0" />
            <span className="whitespace-nowrap text-sm font-semibold leading-5 text-[#495057]">{timestamp}</span>
          </div>
        </div>
      </div>

      {/* elevate shadow on hover, applied to a full-size layer under the card so it
          doesn't get clipped by the card's overflow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: CARD_SHADOW }}
      />

      {/* logo — sibling of the card so it overlaps the cover edge without being clipped */}
      <div className="absolute left-5 top-[124px] size-[72px] overflow-clip rounded-xl border border-[#e9ecef] bg-white shadow-[0_1px_2px_0_rgba(204,204,204,0.14),0_5px_5px_0_rgba(204,204,204,0.12)]">
        <img
          src={promo.logo}
          alt=""
          className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded object-cover"
        />
      </div>

      {badge.key !== "default" && <PromoRibbon badgeKey={badge.key} label={badge.label!} />}
    </div>
  );
}

function MorePromoCard() {
  return (
    <div
      className="group relative h-[360px] w-[260px] shrink-0 overflow-clip rounded-3xl border border-white transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1.5 xl:w-[302px]"
      style={{ backgroundImage: "linear-gradient(180deg, #00b5f0 0%, #005caa 100%)" }}
    >
      <p className="absolute left-6 top-6 w-[157px] text-xl font-semibold leading-7 tracking-[-0.4px] text-white xl:text-2xl xl:leading-[1.3] xl:tracking-[-0.48px]">
        Lihat 200+ Promo Lainnya
      </p>
      {/* diagonal (external) arrow */}
      <svg viewBox="0 0 24 24" fill="none" className="absolute right-[19px] top-6 size-8 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M8 16 16 8M16 8H9M16 8V15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* decorative category-icon cluster (Figma "image 476"), blended into the
          gradient with Soft Light so it reads as a watermark rather than art */}
      <img
        src="/assets/promo/showmore-icons.webp"
        alt=""
        aria-hidden
        className="absolute left-6 right-6 top-[126px] h-[202px] object-cover mix-blend-soft-light xl:top-[86px] xl:h-[242px]"
      />
    </div>
  );
}

export default function PromoSection() {
  const now = new Date();

  return (
    <section
      id="promo"
      className="relative overflow-clip bg-gradient-to-b from-[#eef6fd] to-[#dcecfb] pb-11 pt-[124px] xl:pb-24 xl:pt-32"
    >
      {/* clove pattern — left & right, bleeding off the edges */}
      <img
        src="/assets/promo/bg-clove-product-1.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-380px] top-36 h-[896px] w-[770px] opacity-100 blur-[2px] xl:bottom-[-256px] xl:left-[-256px] xl:top-auto xl:h-auto xl:w-auto"
      />
      <img
        src="/assets/promo/bg-clove-product-2.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-368px] right-[-380px] h-[896px] w-[770px] opacity-60 blur-[2px] xl:bottom-[-720px] xl:right-[-720px] xl:h-auto xl:w-auto"
      />
      {/* confetti — top of the section (pure JS + CSS, see Confetti.tsx) */}
      <Confetti />

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 xl:w-[1280px] xl:max-w-none xl:px-0">
        {/* Heading — stacked on mobile, eyebrow column + h2 side by side on desktop. */}
        <div className="relative flex flex-col xl:flex-row xl:gap-10">
          <div className="flex items-center py-4 xl:w-60 xl:shrink-0">
            <p className="text-xs font-semibold uppercase leading-3 tracking-[1.8px] text-[#005caa] xl:text-sm xl:leading-[14px] xl:tracking-[2.1px]">
              Event &amp; Program
            </p>
          </div>
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-[#00335e] xl:w-[560px] xl:text-[32px] xl:leading-10 xl:tracking-[-0.64px]">
            Apresiasi Terbaik untuk Menemani Setiap Momen Berharga
          </h2>
          {/* 3D percentage glass (three.js) temporarily hidden — see PercentGlass.tsx.
          <PercentGlass /> */}
        </div>

        {/* Cards — horizontally scrollable carousel on mobile (full-bleeding out
            of the padded column), wrapping grid on desktop. */}
        <div className="hide-scrollbar -mx-4 mt-8 flex items-start gap-4 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:mt-10 xl:flex-wrap xl:content-center xl:gap-6 xl:overflow-visible xl:px-0">
          {PROMOS.map((promo) => (
            <PromoCard key={promo.id} promo={promo} now={now} />
          ))}
          <MorePromoCard />
        </div>

        {/* Mobile-only CTA — the desktop surfaces this via the "Show More" card. */}
        <button className="mx-auto mt-9 flex h-10 items-center justify-center gap-0.5 rounded-full bg-[#005caa] px-5 transition-colors duration-200 active:bg-[#00457f] xl:hidden">
          <span className="px-0.5 text-sm font-semibold leading-[14px] text-white">
            Lihat 200+ promo lainnya
          </span>
          <img src="/assets/cycle1/pelajari-icon.svg" alt="" className="size-5" />
        </button>
      </div>
    </section>
  );
}
