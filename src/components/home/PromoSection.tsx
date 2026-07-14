import { PROMOS, getPromoBadge, getPromoTimestamp, type PromoBadgeKey } from "./promo-data";
import Confetti from "./Confetti";
import PercentGlass from "./PercentGlass";

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
    <div className="group relative h-[360px] w-[302px] shrink-0 transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1.5">
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
            <p className="line-clamp-2 w-full text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-[#26292c] transition-colors duration-300 group-hover:text-[#005caa]">
              {promo.title}
            </p>
            <p className="w-full text-base font-semibold text-[#495057]">{promo.brand}</p>
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

function ShowMoreIcon({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`absolute size-16 ${className}`} stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1.4">
      {children}
    </svg>
  );
}

function MorePromoCard() {
  return (
    <div
      className="group relative h-[360px] w-[302px] shrink-0 overflow-clip rounded-3xl border border-white transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1.5"
      style={{ backgroundImage: "linear-gradient(180deg, #00b5f0 0%, #005caa 100%)" }}
    >
      <p className="absolute left-6 top-6 w-[157px] text-2xl font-semibold leading-[1.3] tracking-[-0.48px] text-white">
        Lihat 200+ Promo Lainnya
      </p>
      {/* diagonal (external) arrow */}
      <svg viewBox="0 0 24 24" fill="none" className="absolute right-[19px] top-6 size-8 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M8 16 16 8M16 8H9M16 8V15" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* decorative category icons */}
      <ShowMoreIcon className="left-[54px] top-[88px]">
        <path d="M12 3l2.1 1.2 2.4-.3 1 2.2 2 1.4-.6 2.4.6 2.4-2 1.4-1 2.2-2.4-.3L12 21l-2.1-1.2-2.4.3-1-2.2-2-1.4.6-2.4L4.5 12l2-1.4 1-2.2 2.4.3L12 3z" strokeLinejoin="round" />
        <path d="M9.5 14.5l5-5M10 10h.01M14 14h.01" strokeLinecap="round" />
      </ShowMoreIcon>
      <ShowMoreIcon className="left-[122px] top-[176px]">
        <path d="M7 4h10l-1 6a4 4 0 01-4 3 4 4 0 01-4-3L7 4zM12 13v5M9 21h6" strokeLinecap="round" strokeLinejoin="round" />
      </ShowMoreIcon>
      <ShowMoreIcon className="left-[216px] top-[176px]">
        <path d="M10.5 3.2c.4-.6 1.4-.6 1.8 0l.9 3.4 6.5 4c.6.4.7 1.2.2 1.7l-1 .9-4.5-1 .3 5 1.6 1.2c.5.4.3 1.2-.3 1.4l-2.2.5-1.5-4.4-1.5 4.4-2.2-.5c-.6-.2-.8-1-.3-1.4L9.8 18l.3-5-4.5 1-1-.9c-.5-.5-.4-1.3.2-1.7l6.5-4 .7-3.5z" strokeLinejoin="round" />
      </ShowMoreIcon>
      <ShowMoreIcon className="left-[28px] top-[264px]">
        <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2 2 2 0 000 4 2 2 0 00-2 2H5a2 2 0 01-2-2 2 2 0 000-4z" strokeLinejoin="round" />
        <path d="M10.5 9.5l1.5-1 1.5 1-.6 1.7 1.4 1.1h-1.8L12 15l-.5-1.7H9.7l1.4-1.1-.6-1.7z" strokeLinejoin="round" />
      </ShowMoreIcon>
      <ShowMoreIcon className="left-[122px] top-[264px]">
        <path d="M4 20l8-8M12 4v3M18 8v3M9 5l1.5 1.5M19 15l1.5 1.5M14 4l-1 2 2-1-1 2M8 14l6-6 2 2-6 6-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </ShowMoreIcon>
      <ShowMoreIcon className="left-[216px] top-[264px]">
        <path d="M4 17h16M5 17a7 7 0 0114 0M12 6V4.5M11 4.5h2" strokeLinecap="round" strokeLinejoin="round" />
      </ShowMoreIcon>
    </div>
  );
}

export default function PromoSection() {
  const now = new Date();

  return (
    <section
      id="promo"
      className="relative overflow-clip bg-gradient-to-b from-[#eef6fd] to-[#dcecfb] pb-24 pt-32"
    >
      {/* clove pattern — left & right, bleeding off the edges */}
      <img
        src="/assets/promo/bg-clove-product-1.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-256px] bottom-[-256px] h-auto w-auto opacity-100 blur-[2px]"
      />
      <img
        src="/assets/promo/bg-clove-product-2.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-720px] bottom-[-720px] h-auto w-auto opacity-60 blur-[2px]"
      />
      {/* confetti — top of the section (pure JS + CSS, see Confetti.tsx) */}
      <Confetti />

      <div className="relative z-10 mx-auto w-[1280px]">
        <div className="relative flex gap-10">
          <div className="flex w-60 shrink-0 items-center py-4">
            <p className="text-sm font-semibold uppercase leading-[14px] tracking-[2.1px] text-[#005caa]">
              Event &amp; Program
            </p>
          </div>
          <h2 className="w-[560px] text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#00335e]">
            Apresiasi Terbaik untuk Menemani Setiap Momen Berharga
          </h2>
          {/* 3D percentage glass (three.js), floating to the right of the title.
              Falls back to /assets/promo/percentage-glass.webp when WebGL is
              unavailable or reduced-motion is requested. */}
          <PercentGlass />
        </div>

        

        <div className="mt-10 flex flex-wrap content-center items-start gap-6">
          {PROMOS.map((promo) => (
            <PromoCard key={promo.id} promo={promo} now={now} />
          ))}
          <MorePromoCard />
        </div>
      </div>
    </section>
  );
}
