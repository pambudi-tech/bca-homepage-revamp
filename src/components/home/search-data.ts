// Curated search-recommendation dataset for the hero widget.
//
// This is intentionally a static, hand-picked dataset (no live BCA API exists
// yet, and calling bca.co.id from the browser is blocked by CORS). Everything
// the UI needs goes through `getSearchRecommendations()` below — that function
// is the single seam to swap later.
//
// TO GO LIVE LATER: keep the return shape identical and replace the body of
// `getSearchRecommendations` with a `fetch()` to our own backend route (a
// server-side proxy that queries BCA's real search endpoint and returns JSON).
// The component only depends on the shape, so the UI won't change.

export type ProductIcon = "mybca" | "wallet" | "card" | "house" | "chart" | "phone";

export type InfoCategory = "produk-layanan" | "artikel" | "promo";

export type ProductRec = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ProductIcon;
};

export type InfoRec = {
  id: string;
  title: string;
  href: string;
  category: InfoCategory;
};

export type SearchRecommendations = {
  products: ProductRec[];
  information: InfoRec[];
};

// Human label + badge palette per information category. Colors come straight
// from the Figma "Categorical Badge" tokens.
export const INFO_CATEGORY_META: Record<
  InfoCategory,
  { label: string; bg: string; text: string }
> = {
  "produk-layanan": { label: "Produk & Layanan", bg: "#ccfffe", text: "#188b88" },
  artikel: { label: "Artikel", bg: "#f4e5f6", text: "#70257c" },
  promo: { label: "Promo", bg: "#ffead1", text: "#c44d00" },
};

const PRODUCTS: ProductRec[] = [
  {
    id: "mybca",
    title: "myBCA",
    description: "Aplikasi untuk beragam kebutuhan perbankan",
    href: "#",
    icon: "mybca",
  },
  {
    id: "tahapan-bca",
    title: "Tahapan BCA",
    description: "Rekening serba bisa untuk transaksi harian",
    href: "#",
    icon: "wallet",
  },
  {
    id: "tahapan-xpresi",
    title: "Tahapan Xpresi",
    description: "Mulai Rp50 ribu, pilih sendiri desain kartumu",
    href: "#",
    icon: "wallet",
  },
  {
    id: "tabungan-berjangka",
    title: "Tahapan Berjangka",
    description: "Menabung rutin dengan setoran tetap tiap bulan",
    href: "#",
    icon: "wallet",
  },
  {
    id: "kartu-kredit",
    title: "Kartu Kredit BCA",
    description: "Beragam pilihan kartu sesuai gaya hidupmu",
    href: "#",
    icon: "card",
  },
  {
    id: "paylater",
    title: "Paylater BCA",
    description: "Bayar nanti untuk transaksi di myBCA",
    href: "#",
    icon: "card",
  },
  {
    id: "kpr",
    title: "KPR BCA",
    description: "Wujudkan rumah impian dengan bunga kompetitif",
    href: "#",
    icon: "house",
  },
  {
    id: "kkb",
    title: "KKB BCA",
    description: "Kredit kendaraan bermotor dengan bunga ringan",
    href: "#",
    icon: "house",
  },
  {
    id: "deposito",
    title: "Deposito BCA",
    description: "Investasi aman dengan bunga menarik",
    href: "#",
    icon: "chart",
  },
  {
    id: "reksa-dana",
    title: "Reksa Dana BCA",
    description: "Mulai investasi dari Rp10 ribu di myBCA",
    href: "#",
    icon: "chart",
  },
  {
    id: "welma",
    title: "Welma",
    description: "Aplikasi investasi dan asuransi dari BCA",
    href: "#",
    icon: "phone",
  },
  {
    id: "sakuku",
    title: "Sakuku",
    description: "Dompet digital praktis untuk transaksi harian",
    href: "#",
    icon: "phone",
  },
];

const INFORMATION: InfoRec[] = [
  { id: "buka-rekening-baru", title: "Buka rekening baru", href: "#", category: "produk-layanan" },
  {
    id: "buka-rekening-online",
    title: "Buka Rekening Online di myBCA, Jadi Makin Praktis",
    href: "#",
    category: "artikel",
  },
  {
    id: "voucher-buka-tabungan",
    title: "Buka Tabungan, Dapat Voucher belanja hingga Rp100 Ribu",
    href: "#",
    category: "promo",
  },
  { id: "aktivasi-mybca", title: "Cara Install & Aktivasi myBCA", href: "#", category: "artikel" },
  {
    id: "aktivasi-paylater",
    title: "Aktivasi Paylater BCA di myBCA",
    href: "#",
    category: "produk-layanan",
  },
  {
    id: "pengajuan-kartu-kredit",
    title: "Pengajuan Kartu Kredit BCA Online",
    href: "#",
    category: "produk-layanan",
  },
  {
    id: "tips-atur-keuangan",
    title: "Tips Mengatur Keuangan untuk Pemula",
    href: "#",
    category: "artikel",
  },
  {
    id: "promo-kartu-kredit",
    title: "Promo Kartu Kredit BCA Bulan Ini",
    href: "#",
    category: "promo",
  },
  { id: "ajukan-kpr", title: "Ajukan KPR BCA Secara Online", href: "#", category: "produk-layanan" },
  {
    id: "lokasi-atm-cabang",
    title: "Cari Lokasi ATM & Cabang BCA Terdekat",
    href: "#",
    category: "produk-layanan",
  },
  {
    id: "diskon-debit",
    title: "Diskon Belanja dengan Kartu Debit BCA",
    href: "#",
    category: "promo",
  },
  {
    id: "transfer-luar-negeri",
    title: "Cara Transfer ke Luar Negeri lewat BCA",
    href: "#",
    category: "artikel",
  },
  {
    id: "simulasi-kredit-kendaraan",
    title: "Simulasi Kredit Kendaraan KKB BCA",
    href: "#",
    category: "produk-layanan",
  },
  {
    id: "promo-cicilan-nol",
    title: "Promo Cicilan 0% di Merchant Pilihan",
    href: "#",
    category: "promo",
  },
];

const MAX_PRODUCTS = 3;
const MAX_INFORMATION = 4;

function matches(keyword: string, ...fields: string[]): boolean {
  return fields.some((f) => f.toLowerCase().includes(keyword));
}

/**
 * Returns the products + information to show in the search-recommendation
 * dropdown for a given keyword. Empty/whitespace keyword returns a popular
 * default set (so the dropdown is useful the moment the field is focused).
 *
 * This is the swap point for a real backend later — see the file header.
 */
export function getSearchRecommendations(keyword: string): SearchRecommendations {
  const q = keyword.trim().toLowerCase();

  if (!q) {
    return {
      products: PRODUCTS.slice(0, MAX_PRODUCTS),
      information: INFORMATION.slice(0, MAX_INFORMATION),
    };
  }

  const products = PRODUCTS.filter((p) => matches(q, p.title, p.description)).slice(0, MAX_PRODUCTS);
  const information = INFORMATION.filter((i) =>
    matches(q, i.title, INFO_CATEGORY_META[i.category].label)
  ).slice(0, MAX_INFORMATION);

  return { products, information };
}

/** Deep-link to BCA's real search-result page for the "see all results" action. */
export function bcaSearchResultUrl(keyword: string): string {
  return `https://www.bca.co.id/id/search-result?keyword=${encodeURIComponent(keyword.trim())}`;
}

/* ---------------------------------------------------------------------------
 * Empty state (field focused, nothing typed yet). Distinct from the results
 * state: it guides the user instead of showing filtered products/info.
 * ------------------------------------------------------------------------- */

/** Trending keyword chips. Clicking one fills the field and runs the search. */
export const POPULAR_SEARCHES: string[] = [
  "Buka Rekening",
  "Kurs Hari Ini",
  "Promo Kartu Kredit",
  "KPR BCA",
  "Aktivasi myBCA",
  "Lokasi ATM",
];

/** Guided entry points — richer than a bare chip, but capped at 4 to stay light. */
export type PopularTopic = { id: string; label: string; keyword: string; icon: ProductIcon };

export const POPULAR_TOPICS: PopularTopic[] = [
  { id: "topic-rekening", label: "Buka rekening & tabungan", keyword: "rekening", icon: "wallet" },
  { id: "topic-kartu", label: "Kartu kredit & Paylater", keyword: "kartu", icon: "card" },
  { id: "topic-kredit", label: "KPR & kredit kendaraan", keyword: "kpr", icon: "house" },
  { id: "topic-investasi", label: "Investasi & reksa dana", keyword: "investasi", icon: "chart" },
];

/* ---------------------------------------------------------------------------
 * Recent searches — persisted in localStorage. Pure helpers; the component
 * owns the in-memory copy and calls these to read/update the stored list.
 * ------------------------------------------------------------------------- */

const RECENT_KEY = "bca:recent-searches";
const RECENT_MAX = 6;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

function persistRecent(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* storage unavailable (private mode / quota) — recents just won't persist */
  }
}

/** Returns a new list with `term` moved to the front (deduped, capped). */
export function addRecentSearch(list: string[], term: string): string[] {
  const t = term.trim();
  if (!t) return list;
  const next = [t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
  persistRecent(next);
  return next;
}

export function removeRecentSearch(list: string[], term: string): string[] {
  const next = list.filter((x) => x.toLowerCase() !== term.toLowerCase());
  persistRecent(next);
  return next;
}

export function clearRecentSearches(): string[] {
  persistRecent([]);
  return [];
}
