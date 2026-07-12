export type Product = {
  title: string;
  subtitle: string;
  image: string;
};

export type ProductCategory = {
  key: string;
  label: string;
  ctaLabel: string;
  products: Product[];
};

// The Kartu Kredit trio is the one fully specced in the design; other categories
// reuse the same photography with their own copy for this revamp prototype.
const EVERYDAY = "/assets/product/card-everyday.jpg";
const MASTERCARD = "/assets/product/card-mastercard.jpg";
const AMEX = "/assets/product/card-amex.jpg";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    key: "Simpanan",
    label: "Simpanan",
    ctaLabel: "Lihat pilihan Simpanan lainnya",
    products: [
      { title: "Tahapan BCA", subtitle: "Tabungan andalan untuk transaksi sehari-hari", image: EVERYDAY },
      { title: "Tahapan Xpresi", subtitle: "Tabungan anak muda dengan kartu custom", image: MASTERCARD },
      { title: "BCA Dollar", subtitle: "Simpanan valuta asing USD dan SGD", image: AMEX },
    ],
  },
  {
    key: "Kartu Kredit",
    label: "Kartu Kredit",
    ctaLabel: "Lihat pilihan Kartu Kredit lainnya",
    products: [
      { title: "BCA Everyday Card", subtitle: "Tiap hari belanja, tiap hari untung", image: EVERYDAY },
      { title: "BCA Mastercard Black", subtitle: "Experience the ultimate privilege", image: MASTERCARD },
      { title: "BCA American Express Platinum", subtitle: "For the finest things in life", image: AMEX },
    ],
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    ctaLabel: "Lihat pilihan Pinjaman lainnya",
    products: [
      { title: "KPR BCA", subtitle: "Wujudkan rumah impian dengan bunga kompetitif", image: EVERYDAY },
      { title: "KKB BCA", subtitle: "Kredit kendaraan bermotor proses cepat", image: MASTERCARD },
      { title: "Kredit Tanpa Agunan", subtitle: "Dana cepat tanpa jaminan untuk kebutuhanmu", image: AMEX },
    ],
  },
  {
    key: "Investasi",
    label: "Investasi",
    ctaLabel: "Lihat pilihan Investasi lainnya",
    products: [
      { title: "Reksa Dana BCA", subtitle: "Investasi mudah mulai dari Rp100 ribu", image: EVERYDAY },
      { title: "Welma", subtitle: "Platform investasi & asuransi digital BCA", image: MASTERCARD },
      { title: "Obligasi Negara", subtitle: "Investasi surat utang dengan imbal hasil tetap", image: AMEX },
    ],
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    ctaLabel: "Lihat pilihan Asuransi lainnya",
    products: [
      { title: "BCA Life Proteksi", subtitle: "Proteksi jiwa dengan premi terjangkau", image: EVERYDAY },
      { title: "Asuransi Kesehatan", subtitle: "Perlindungan biaya rumah sakit lebih tenang", image: MASTERCARD },
      { title: "Asuransi Kendaraan", subtitle: "Proteksi kendaraan dari risiko tak terduga", image: AMEX },
    ],
  },
];
