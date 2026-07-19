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

const asset = (name: string): Pick<Product, "image"> => ({
  image: `/assets/product/${name}.webp`,
});

const EVERYDAY = asset("card-everyday");
const MASTERCARD = asset("card-mastercard");
const AMEX = asset("card-amex");
const SIMPANAN_1 = asset("card-simpanan-1");
const SIMPANAN_2 = asset("card-simpanan-2");
const SIMPANAN_3 = asset("card-simpanan-3");

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    key: "Simpanan",
    label: "Simpanan",
    ctaLabel: "Lihat pilihan Simpanan lainnya",
    products: [
      { title: "Tahapan BCA", subtitle: "Tabungan andalan untuk transaksi sehari-hari", ...SIMPANAN_1 },
      { title: "Tahapan Xpresi", subtitle: "Tabungan anak muda dengan kartu custom", ...SIMPANAN_2 },
      { title: "BCA Dollar", subtitle: "Simpanan valuta asing USD dan SGD", ...SIMPANAN_3 },
    ],
  },
  {
    key: "Kartu Kredit",
    label: "Kartu Kredit",
    ctaLabel: "Lihat pilihan Kartu Kredit lainnya",
    products: [
      { title: "BCA Everyday Card", subtitle: "Tiap hari belanja, tiap hari untung", ...EVERYDAY },
      { title: "BCA Mastercard Black", subtitle: "Experience the ultimate privilege", ...MASTERCARD },
      { title: "BCA American Express Platinum", subtitle: "For the finest things in life", ...AMEX },
    ],
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    ctaLabel: "Lihat pilihan Pinjaman lainnya",
    products: [
      { title: "KPR BCA", subtitle: "Wujudkan rumah impian dengan bunga kompetitif", ...EVERYDAY },
      { title: "KKB BCA", subtitle: "Kredit kendaraan bermotor proses cepat", ...MASTERCARD },
      { title: "Kredit Tanpa Agunan", subtitle: "Dana cepat tanpa jaminan untuk kebutuhanmu", ...AMEX },
    ],
  },
  {
    key: "Investasi",
    label: "Investasi",
    ctaLabel: "Lihat pilihan Investasi lainnya",
    products: [
      { title: "Reksa Dana BCA", subtitle: "Investasi mudah mulai dari Rp100 ribu", ...EVERYDAY },
      { title: "Welma", subtitle: "Platform investasi & asuransi digital BCA", ...MASTERCARD },
      { title: "Obligasi Negara", subtitle: "Investasi surat utang dengan imbal hasil tetap", ...AMEX },
    ],
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    ctaLabel: "Lihat pilihan Asuransi lainnya",
    products: [
      { title: "BCA Life Proteksi", subtitle: "Proteksi jiwa dengan premi terjangkau", ...EVERYDAY },
      { title: "Asuransi Kesehatan", subtitle: "Perlindungan biaya rumah sakit lebih tenang", ...MASTERCARD },
      { title: "Asuransi Kendaraan", subtitle: "Proteksi kendaraan dari risiko tak terduga", ...AMEX },
    ],
  },
];
