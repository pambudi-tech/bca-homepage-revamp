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
  /** Days relative to "now" (fractional allowed for sub-day windows). */
  startOffsetDays: number;
  endOffsetDays: number;
  /** From CMS/analytics: redemption frequency or other popularity signal. */
  isMostLiked?: boolean;
};

export const PROMOS: Promo[] = [
  {
    id: "cashback-mybca",
    title: "Cashback hingga Rp100 Ribu",
    brand: "myBCA",
    cover: "/assets/promo/card1-cover.jpg",
    logo: "/assets/promo/card1-logo.png",
    startOffsetDays: -60,
    endOffsetDays: 330,
    isMostLiked: true,
  },
  {
    id: "diskon-ebiga",
    title: "Diskon 15% All Beverages",
    brand: "Ebiga Jjampong",
    cover: "/assets/promo/card2-cover.jpg",
    logo: "/assets/promo/card2-logo.png",
    startOffsetDays: -0.5,
    endOffsetDays: 140,
  },
  {
    id: "presale-musikal",
    title: `Presale BCA - Tiket Musikal "Senja Teduh Pelita"`,
    brand: "Jakarta Movin",
    cover: "/assets/promo/card3-cover.jpg",
    logo: "/assets/promo/card3-logo.png",
    startOffsetDays: -100,
    endOffsetDays: 19,
  },
  {
    id: "voucher-tiket",
    title: "Voucher Hingga Rp300 Ribu Setiap Senin",
    brand: "Tiket.com",
    cover: "/assets/promo/card4-cover.jpg",
    logo: "/assets/promo/card4-logo.png",
    startOffsetDays: -90,
    endOffsetDays: 79,
  },
  {
    id: "bluebird-javajazz",
    title: "Bluebird di Java Jazz 2026 - Potongan Rp15 Ribu",
    brand: "Bluebird",
    cover: "/assets/promo/card5-cover.jpg",
    logo: "/assets/promo/card5-logo.png",
    startOffsetDays: -40,
    endOffsetDays: 20 / 24,
  },
  {
    id: "garuda-potongan",
    title: "Potongan Hingga Rp1,8 Juta",
    brand: "Garuda Indonesia",
    cover: "/assets/promo/card6-cover.jpg",
    logo: "/assets/promo/card6-logo.png",
    startOffsetDays: -30,
    endOffsetDays: 45,
  },
  {
    id: "lunas-doughnuts",
    title: "Rp75 Ribu ½ Dozen Classic Doughnuts",
    brand: "Luna's Doughnuts",
    cover: "/assets/promo/card7-cover.jpg",
    logo: "/assets/promo/card7-logo.png",
    startOffsetDays: 2,
    endOffsetDays: 30,
  },
];

export type PromoBadgeKey = "expired" | "upcoming" | "almostEnd" | "mostLiked" | "new" | "default";

export type PromoBadge = {
  key: PromoBadgeKey;
  label: string | null;
};

const MS_HOUR = 3_600_000;
const MS_DAY = 24 * MS_HOUR;

function resolvePeriod(promo: Promo, now: Date) {
  const start = new Date(now.getTime() + promo.startOffsetDays * MS_DAY);
  const end = new Date(now.getTime() + promo.endOffsetDays * MS_DAY);
  return { start, end };
}

/**
 * Badge priority (highest first): a promo that's already over always shows
 * "Kadaluarsa" regardless of how popular it is; an about-to-start or
 * about-to-end promo takes precedence over the "most liked" flag so users
 * see the more time-sensitive signal first.
 */
export function getPromoBadge(promo: Promo, now: Date): PromoBadge {
  const { start, end } = resolvePeriod(promo, now);
  const nowMs = now.getTime();

  if (nowMs > end.getTime()) return { key: "expired", label: "Kadaluarsa" };

  const toStart = start.getTime() - nowMs;
  if (toStart > 0 && toStart <= 2 * MS_DAY) return { key: "upcoming", label: "Segera Hadir" };

  const toEnd = end.getTime() - nowMs;
  if (toEnd > 0 && toEnd < MS_DAY) return { key: "almostEnd", label: "Segera Berakhir!" };

  if (promo.isMostLiked) return { key: "mostLiked", label: "Paling Disukai" };

  const sinceStart = nowMs - start.getTime();
  if (sinceStart >= 0 && sinceStart <= 2 * MS_DAY) return { key: "new", label: "Promo Baru" };

  return { key: "default", label: null };
}

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatDateID(date: Date) {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function getPromoTimestamp(promo: Promo, now: Date, badge: PromoBadge) {
  const { start, end } = resolvePeriod(promo, now);

  if (badge.key === "expired") return "Promo Berakhir";

  if (badge.key === "almostEnd") {
    const hours = Math.max(1, Math.round((end.getTime() - now.getTime()) / MS_HOUR));
    return `Berakhir dalam ${hours} jam`;
  }

  if (badge.key === "upcoming") {
    const days = Math.ceil((start.getTime() - now.getTime()) / MS_DAY);
    if (days <= 0) return "Mulai hari ini";
    if (days === 1) return "Mulai besok";
    return `${days} hari lagi`;
  }

  return `Hingga ${formatDateID(end)}`;
}
