export type NewsArticle = {
  title: string;
  image: string;
  /** Pre-formatted for display ("15 Jul 2026") — the section never parses it. */
  date: string;
  category: string;
  href: string;
};

export type NewsCategory = {
  key: string;
  label: string;
  /** Newest article, rendered as the large card. */
  highlight: NewsArticle;
  /** The rest, newest first. The section shows the first few. */
  articles: NewsArticle[];
};

/** How many of `articles` fit beside the highlight card on mobile (single carousel row). */
export const NEWS_LIST_SIZE = 3;

/** How many of `articles` fit beside the highlight card on desktop (two columns of three). */
export const NEWS_LIST_SIZE_DESKTOP = 6;

const BASE = "https://www.bca.co.id";

// Only four banner images ship with the repo, so the seeds cycle through them.
// Rows coming from Supabase carry their own image path.
const IMAGES = [
  "/assets/news/banner-news-1.webp",
  "/assets/news/banner-news-2.webp",
  "/assets/news/banner-news-3.webp",
  "/assets/news/banner-news-4.webp",
];

/** Seed tuple: [title, date, category, path]. */
type Seed = [string, string, string, string];

function toCategory(key: string, label: string, seeds: Seed[]): NewsCategory {
  const items = seeds.map(([title, date, category, path], i) => ({
    title,
    image: IMAGES[i % IMAGES.length],
    date,
    category,
    href: `${BASE}${path}`,
  }));
  return { key, label, highlight: items[0], articles: items.slice(1) };
}

// ------------------------------------------------------------------ seeds ---
// 8 terbaru per kanal, disalin dari bca.co.id (per 19 Jul 2026), urut dari
// yang paling baru. Ini hanya fallback — sumber sebenarnya tabel `news` di
// Supabase (lihat supabase/news-section.sql).

const NEWS_FEATURE: Seed[] = [
  [
    "Fitur Bahasa Mandarin Kini Hadir di ATM BCA",
    "15 Jul 2026",
    "Informasi perbankan",
    "/id/informasi/news-and-features/2026/07/15/14/50/fitur-bahasa-mandarin-kini-hadir-di-atm-bca",
  ],
  [
    "Transaksi Virtual Account BCA di E-Commerce Semakin Cepat dan Praktis",
    "10 Jul 2026",
    "Informasi perbankan",
    "/id/informasi/news-and-features/2026/07/10/08/29/transaksi-virtual-account-bca-di-e-commerce-semakin-cepat-dan-praktis",
  ],
  [
    "Kenali Keunggulan Investasi ORI030 di BCA",
    "6 Jul 2026",
    "Investasi",
    "/id/informasi/news-and-features/2026/07/06/08/34/kenali-keunggulan-investasi-ori030-di-bca",
  ],
  [
    "BCA Business Case Competition 2026: Know the Market, Own the Game",
    "2 Jul 2026",
    "Event",
    "/id/informasi/news-and-features/2026/07/02/15/19/bca-business-case-competition-2026-know-the-market-own-the-game",
  ],
  [
    "Informasi Ketentuan Threshold Transaksi Valas",
    "1 Jul 2026",
    "Keuangan",
    "/id/informasi/news-and-features/2026/07/01/11/45/informasi-ketentuan-threshold-transaksi-valas",
  ],
  [
    "MASA Singapore 2026: BCA Dukung Penuh Gerakan Kreatif Indonesia",
    "1 Jul 2026",
    "Event",
    "/id/informasi/news-and-features/2026/07/01/11/14/masa-singapore-2026-bca-dukung-penuh-gerakan-kreatif-indonesia",
  ],
  [
    "Makin Praktis, Buka e-Deposito USD dan SGD Bisa melalui myBCA",
    "24 Jun 2026",
    "myBCA",
    "/id/informasi/news-and-features/2026/06/24/15/00/makin-praktis-buka-e-deposito-usd-dan-sgd-bisa-melalui-mybca",
  ],
  [
    'Fitur Notifikasi "Financial Diary" Hadir di BCA mobile untuk Seluruh Nasabah BCA',
    "19 Jun 2026",
    "BCA mobile",
    "/id/informasi/news-and-features/2026/06/19/13/22/fitur-notifikasi-financial-diary-hadir-di-bca-mobile-untuk-seluruh-nasabah-bca",
  ],
];

const EDUKATIPS: Seed[] = [
  [
    "Beli Pulsa, Paket Data atau Bayar Tagihan Pascabayar? Bisa di e-Channel BCA!",
    "2 Jul 2026",
    "e-Channel",
    "/id/informasi/edukatips/2026/07/02/16/41/beli-pulsa-paket-data-atau-bayar-tagihan-pascabayar-bisa-di-channel-bca",
  ],
  [
    "Investasi Hanya dengan Uang Saku, Bagaimana Caranya?",
    "29 Jun 2026",
    "Investasi",
    "/id/informasi/edukatips/2026/06/29/17/44/investasi-hanya-dengan-uang-saku-bagaimana-caranya",
  ],
  [
    "OTP Aman, Transaksi Online Nyaman",
    "25 Jun 2026",
    "Keamanan",
    "/id/informasi/edukatips/2026/06/25/15/14/otp-aman-transaksi-online-nyaman",
  ],
  [
    "Mau Mulai Investasi Reksa Dana? Pahami Cara Kerjanya Dulu Yuk!",
    "22 Jun 2026",
    "Investasi",
    "/id/informasi/edukatips/2026/06/22/08/34/mau-mulai-investasi-reksa-dana-pahami-cara-kerjanya-dulu-yuk",
  ],
  [
    "Langkah Mudah Mengatur Notifikasi di BCA mobile",
    "19 Jun 2026",
    "BCA mobile",
    "/id/informasi/edukatips/2026/06/19/14/11/langkah-mudah-mengatur-notifikasi-di-bca-mobile",
  ],
  [
    "Cara Mudah Buka Rekening Efek - RDN BCA Sekuritas di myBCA",
    "19 Jun 2026",
    "myBCA",
    "/id/informasi/edukatips/2026/06/19/10/23/cara-mudah-buka-rekening-efek-rdn-bca-sekuritas-di-mybca",
  ],
  [
    "e-Deposito Valas di myBCA: Solusi Simpan Dana Mata Uang Asing dari Genggaman",
    "18 Jun 2026",
    "myBCA",
    "/id/informasi/edukatips/2026/06/18/16/31/e-deposito-valas-di-mybca-solusi-simpan-dana-mata-uang-asing-dari-genggaman",
  ],
  [
    "Perlindungan Rumah itu Personal: Kenapa Setiap Orang Bisa Berbeda?",
    "18 Jun 2026",
    "Asuransi",
    "/id/informasi/edukatips/2026/06/18/10/19/perlindungan-rumah-itu-personal-kenapa-setiap-orang-bisa-berbeda",
  ],
];

const AWAS_MODUS: Seed[] = [
  [
    "Hati-Hati Modus Penipuan Transaksi Mencurigakan dan Blokir Kartu Kredit Mengatasnamakan BCA",
    "22 Jun 2026",
    "Kartu Kredit",
    "/id/informasi/awas-modus/2026/06/22/14/13/hati-hati-modus-penipuan-transaksi-mencurigakan-dan-blokir-kartu-kredit-mengatasnamakan-bca",
  ],
  [
    "Modus Penipuan Paket Tertukar atau Hilang yang Perlu Diwaspadai",
    "9 Jun 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/06/09/16/57/modus-penipuan-paket-tertukar-atau-hilang-yang-perlu-diwaspadai",
  ],
  [
    "Waspada Modus Penipuan melalui Email dalam Transaksi Internasional",
    "26 Mei 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/05/26/16/34/waspada-modus-penipuan-melalui-email-dalam-transaksi-internasional",
  ],
  [
    "Transaksi yang Nyaman Dimulai dari Menjaga Data Perbankan",
    "28 Apr 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/04/28/10/20/transaksi-yang-nyaman-dimulai-dari-menjaga-data-perbankan",
  ],
  [
    "Jaga Data Pribadi, Waspada Penipuan yang Mengatasnamakan Company Partner BCA!",
    "27 Apr 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/04/27/16/17/mengatasnamakan-copartner",
  ],
  [
    "Waspada Nomor Halo BCA Palsu di Website Instansi",
    "13 Apr 2026",
    "Halo BCA",
    "/id/informasi/awas-modus/2026/04/13/11/06/waspada-nomor-halo-bca-palsu-di-website-instansi",
  ],
  [
    "Hindari Penipuan! Akses Informasi dan Channel Resmi BCA hanya dari bca.co.id",
    "17 Mar 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/03/17/16/16/hindari-penipuan-akses-informasi-dan-channel-resmi-bca-hanya-dari-bcacoid",
  ],
  [
    "Finansial Aman, Mudik Nyaman: Waspada Modus Penipuan Lebaran 2026",
    "26 Feb 2026",
    "Keamanan",
    "/id/informasi/awas-modus/2026/02/26/16/44/finansial-aman-mudik-nyaman-waspada-modus-penipuan-lebaran-2026",
  ],
];

export const NEWS_CATEGORY_SEEDS: NewsCategory[] = [
  toCategory("news-and-features", "News & Feature", NEWS_FEATURE),
  toCategory("edukatips", "EdukaTips", EDUKATIPS),
  toCategory("awas-modus", "#AwasModus", AWAS_MODUS),
];
