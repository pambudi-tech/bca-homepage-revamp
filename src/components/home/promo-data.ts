// CMS-driven promo cards: each promo carries a period (start/end) and an
// "isMostLiked" signal (from redemption/engagement tracking). The badge shown
// on a card is derived from those two inputs, not hand-picked per card —
// see getPromoBadge below for the exact windows.
export type Promo = {
  id: string;
  title: string;
  brand: string;
  cover: string;
  logo: string;
  /** Absolute period, as stored in Supabase (`start_at` / `end_at`). */
  startAt: Date;
  endAt: Date;
  /**
   * Redemption count from analytics. A promo counts as popular once this
   * crosses POPULAR_REDEEM_THRESHOLD — see getPromoBadge.
   */
  redeemCount?: number;
};

/**
 * Bundled fallback. Kept as offsets relative to "now" rather than fixed dates
 * so the demo keeps showing one of every badge state no matter when it runs —
 * the Supabase rows use real timestamps instead (see `resolveFallbackPromos`).
 */
type PromoSeed = Omit<Promo, "startAt" | "endAt"> & {
  startOffsetDays: number;
  endOffsetDays: number;
};

export const PROMO_SEEDS: PromoSeed[] = [
  {
    id: "cashback-mybca",
    title: "Cashback hingga Rp100 Ribu",
    brand: "myBCA",
    cover: "/assets/promo/card1-cover.webp",
    logo: "/assets/promo/card1-logo.png",
    startOffsetDays: -60,
    endOffsetDays: 330,
    redeemCount: 4_820,
  },
  {
    id: "diskon-ebiga",
    title: "Diskon 15% All Beverages",
    brand: "Ebiga Jjampong",
    cover: "/assets/promo/card2-cover.webp",
    logo: "/assets/promo/card2-logo.png",
    startOffsetDays: -0.5,
    endOffsetDays: 140,
  },
  {
    id: "presale-musikal",
    title: `Presale BCA - Tiket Musikal "Senja Teduh Pelita"`,
    brand: "Jakarta Movin",
    cover: "/assets/promo/card3-cover.webp",
    logo: "/assets/promo/card3-logo.png",
    startOffsetDays: -100,
    endOffsetDays: 19,
  },
  {
    id: "voucher-tiket",
    title: "Voucher Hingga Rp300 Ribu Setiap Senin",
    brand: "Tiket.com",
    cover: "/assets/promo/card4-cover.webp",
    logo: "/assets/promo/card4-logo.png",
    startOffsetDays: -90,
    endOffsetDays: 79,
  },
  {
    id: "bluebird-javajazz",
    title: "Bluebird di Java Jazz 2026 - Potongan Rp15 Ribu",
    brand: "Bluebird",
    cover: "/assets/promo/card5-cover.webp",
    logo: "/assets/promo/card5-logo.png",
    startOffsetDays: -40,
    endOffsetDays: 20 / 24,
  },
  {
    id: "garuda-potongan",
    title: "Potongan Hingga Rp1,8 Juta",
    brand: "Garuda Indonesia",
    cover: "/assets/promo/card6-cover.webp",
    logo: "/assets/promo/card6-logo.png",
    startOffsetDays: -30,
    endOffsetDays: 45,
  },
  {
    id: "lunas-doughnuts",
    title: "Rp75 Ribu ½ Dozen Classic Doughnuts",
    brand: "Luna's Doughnuts",
    cover: "/assets/promo/card7-cover.webp",
    logo: "/assets/promo/card7-logo.png",
    startOffsetDays: 2,
    endOffsetDays: 30,
  },
];

export type PromoBadgeKey = "almostEnd" | "popular" | "default";

/**
 * Redemptions needed before a promo is labelled "Populer". A threshold rather
 * than a hand-set flag so the badge follows real demand and drops off on its
 * own when a promo stops moving.
 */
export const POPULAR_REDEEM_THRESHOLD = 1_000;

export type PromoBadge = {
  key: PromoBadgeKey;
  label: string | null;
};

const MS_HOUR = 3_600_000;
const MS_DAY = 24 * MS_HOUR;

/** Turn the bundled seeds into real periods anchored on `now`. */
export function resolveFallbackPromos(now: Date): Promo[] {
  return PROMO_SEEDS.map(({ startOffsetDays, endOffsetDays, ...promo }) => ({
    ...promo,
    startAt: new Date(now.getTime() + startOffsetDays * MS_DAY),
    endAt: new Date(now.getTime() + endOffsetDays * MS_DAY),
  }));
}

function resolvePeriod(promo: Promo) {
  return { start: promo.startAt, end: promo.endAt };
}

/**
 * Badge priority (highest first): an about-to-end promo takes precedence over
 * the popularity badge so users see the more time-sensitive signal first. A
 * promo that's already over gets no ribbon at all (see getPromoTimestamp for
 * its "Promo Berakhir" timestamp instead).
 */
export function getPromoBadge(promo: Promo, now: Date): PromoBadge {
  const { end } = resolvePeriod(promo);
  const toEnd = end.getTime() - now.getTime();

  if (toEnd > 0 && toEnd < MS_DAY) return { key: "almostEnd", label: "Segera Berakhir!" };

  if ((promo.redeemCount ?? 0) >= POPULAR_REDEEM_THRESHOLD) return { key: "popular", label: "Populer" };

  return { key: "default", label: null };
}

/** "Hingga 15 Jul 2026" — always in WIB, so the server and the browser agree. */
const PROMO_DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export function getPromoTimestamp(promo: Promo, now: Date, badge: PromoBadge) {
  const { end } = resolvePeriod(promo);

  if (now.getTime() > end.getTime()) return "Promo Berakhir";

  if (badge.key === "almostEnd") {
    // Ceil (not round) so a few minutes left still reads as "1 jam" rather than
    // "0 jam", and cap at 23 so it never contradicts the < 24h badge window above.
    const hours = Math.min(23, Math.max(1, Math.ceil((end.getTime() - now.getTime()) / MS_HOUR)));
    return `Berakhir dalam ${hours} jam`;
  }

  return `Hingga ${PROMO_DATE_FORMAT.format(end)}`;
}
