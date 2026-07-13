export type NewsArticle = {
  title: string;
  image: string;
  date: string;
  category: string;
};

export const NEWS_CATEGORIES = ["News & Feature", "EdukaTips", "#AwasModus"];

export const HIGHLIGHT_ARTICLE: NewsArticle = {
  title: "Informasi Waktu Pendebitan Biaya Administrasi Bulanan",
  image: "/assets/news/banner-news-1.webp",
  date: "13 Jul 2026",
  category: "Kartu Debit",
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    title: "Makin Praktis, Buka e-Deposito USD dan SGD Bisa melalui myBCA",
    image: "/assets/news/banner-news-2.png",
    date: "15 Jul 2024",
    category: "mybca",
  },
  {
    title: "Informasi Perubahan Jam Layanan Cabang",
    image: "/assets/news/banner-news-3.png",
    date: "10 Jul 2024",
    category: "Informasi perbankan",
  },
  {
    title: "Informasi Ketentuan Threshold Transaksi Valas",
    image: "/assets/news/banner-news-4.png",
    date: "3 Jul 2024",
    category: "keuangan",
  },
];
