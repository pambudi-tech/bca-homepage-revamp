export type Product = {
  title: string;
  subtitle: string;
  image: string;
  /**
   * Tampil di layout accordion, yang hanya punya 3 slot. Curved carousel
   * memutar seluruh produk kategori terlepas dari flag ini. Lihat
   * `supabase/product-featured.sql`.
   */
  featured?: boolean;
};

export type ProductCategory = {
  key: string;
  label: string;
  ctaLabel: string;
  /**
   * Foto & deskripsi kategori — dipakai kartu di layout Accordion, yang kini
   * menampilkan kategori (bukan produk). Opsional karena kolomnya baru; kalau
   * Supabase belum punya kolomnya, section mengisi dari `SAMPLE_CATEGORY_PHOTOS`.
   * Lihat `supabase/product-category-image.sql`.
   */
  image?: string;
  description?: string;
  products: Product[];
};

const photo = (name: string): string => `/assets/product/${name}.webp`;

const asset = (name: string): Pick<Product, "image"> => ({ image: photo(name) });

/**
 * Enam foto produk yang sudah ada (dari Simpanan & Kartu Kredit). Dipakai
 * sebagai foto contoh kartu kategori Accordion selama kolom `image` di Supabase
 * belum diisi — cukup untuk enam kategori tanpa aset baru.
 */
export const SAMPLE_CATEGORY_PHOTOS = [
  photo("card-simpanan-1"),
  photo("card-everyday"),
  photo("card-mastercard"),
  photo("card-simpanan-2"),
  photo("card-amex"),
  photo("card-simpanan-3"),
];

/**
 * Tiga kartu pertama tiap kategori jadi pilihan accordion secara default —
 * cocok dengan backfill di `supabase/product-featured.sql`, jadi tampilan
 * fallback sama dengan tampilan saat Supabase tersambung.
 */
function withFeaturedDefaults(products: Product[]): Product[] {
  return products.map((p, i) => ({ ...p, featured: i < 3 }));
}

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
    image: SAMPLE_CATEGORY_PHOTOS[0],
    description: "Tabungan & deposito untuk setiap kebutuhan",
    products: withFeaturedDefaults([
      { title: "Tahapan BCA", subtitle: "Tabungan andalan untuk transaksi sehari-hari", ...SIMPANAN_1 },
      { title: "Tahapan Xpresi", subtitle: "Tabungan anak muda dengan kartu custom", ...SIMPANAN_2 },
      { title: "BCA Dollar", subtitle: "Simpanan valuta asing USD dan SGD", ...SIMPANAN_3 },
      { title: "Tahapan Berjangka", subtitle: "Menabung rutin dengan setoran bulanan tetap", ...SIMPANAN_1 },
      { title: "Tapres", subtitle: "Tabungan prestasi dengan suku bunga menarik", ...SIMPANAN_2 },
      { title: "Simpanan Pelajar", subtitle: "Tabungan untuk pelajar tanpa biaya administrasi", ...SIMPANAN_3 },
      { title: "TabunganKu", subtitle: "Tabungan ringan untuk semua kalangan", ...SIMPANAN_1 },
      { title: "Deposito Berjangka", subtitle: "Simpanan berjangka dengan bunga kompetitif", ...SIMPANAN_2 },
      { title: "Tahapan Gold", subtitle: "Tabungan untuk kelancaran usaha Anda", ...SIMPANAN_3 },
    ]),
  },
  {
    key: "Kartu Kredit",
    label: "Kartu Kredit",
    ctaLabel: "Lihat pilihan Kartu Kredit lainnya",
    image: SAMPLE_CATEGORY_PHOTOS[1],
    description: "Kartu untuk gaya hidup dan setiap transaksi",
    products: withFeaturedDefaults([
      { title: "BCA Everyday Card", subtitle: "Tiap hari belanja, tiap hari untung", ...EVERYDAY },
      { title: "BCA Mastercard Black", subtitle: "Experience the ultimate privilege", ...MASTERCARD },
      { title: "BCA American Express Platinum", subtitle: "For the finest things in life", ...AMEX },
    ]),
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    ctaLabel: "Lihat pilihan Pinjaman lainnya",
    image: SAMPLE_CATEGORY_PHOTOS[2],
    description: "Solusi pembiayaan rumah, kendaraan, dan usaha",
    products: withFeaturedDefaults([
      { title: "KPR BCA", subtitle: "Wujudkan rumah impian dengan bunga kompetitif", ...EVERYDAY },
      { title: "KKB BCA", subtitle: "Kredit kendaraan bermotor proses cepat", ...MASTERCARD },
      { title: "Kredit Tanpa Agunan", subtitle: "Dana cepat tanpa jaminan untuk kebutuhanmu", ...AMEX },
    ]),
  },
  {
    key: "e-Banking",
    label: "e-Banking",
    ctaLabel: "Lihat pilihan e-Banking lainnya",
    image: SAMPLE_CATEGORY_PHOTOS[3],
    description: "Perbankan digital dalam satu genggaman",
    products: withFeaturedDefaults([
      { title: "myBCA", subtitle: "Super app perbankan digital dalam satu aplikasi", ...SIMPANAN_1 },
      { title: "BCA mobile", subtitle: "Transaksi praktis langsung dari ponsel", ...SIMPANAN_2 },
      { title: "KlikBCA", subtitle: "Internet banking untuk kebutuhan harian", ...SIMPANAN_3 },
    ]),
  },
  {
    key: "Investasi",
    label: "Investasi",
    ctaLabel: "Lihat pilihan Investasi lainnya",
    image: SAMPLE_CATEGORY_PHOTOS[4],
    description: "Kembangkan dana lewat beragam instrumen",
    products: withFeaturedDefaults([
      { title: "Reksa Dana BCA", subtitle: "Investasi mudah mulai dari Rp100 ribu", ...EVERYDAY },
      { title: "Welma", subtitle: "Platform investasi & asuransi digital BCA", ...MASTERCARD },
      { title: "Obligasi Negara", subtitle: "Investasi surat utang dengan imbal hasil tetap", ...AMEX },
    ]),
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    ctaLabel: "Lihat pilihan Asuransi lainnya",
    image: SAMPLE_CATEGORY_PHOTOS[5],
    description: "Proteksi menyeluruh untuk Anda dan keluarga",
    products: withFeaturedDefaults([
      { title: "BCA Life Proteksi", subtitle: "Proteksi jiwa dengan premi terjangkau", ...EVERYDAY },
      { title: "Asuransi Kesehatan", subtitle: "Perlindungan biaya rumah sakit lebih tenang", ...MASTERCARD },
      { title: "Asuransi Kendaraan", subtitle: "Proteksi kendaraan dari risiko tak terduga", ...AMEX },
    ]),
  },
];
