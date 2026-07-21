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
    image: SAMPLE_CATEGORY_PHOTOS[1],
    description: "Kartu untuk gaya hidup dan setiap transaksi",
    products: withFeaturedDefaults([
      { title: "BCA Everyday Card", subtitle: "Tiap hari belanja, tiap hari untung", ...EVERYDAY },
      { title: "BCA Mastercard Black", subtitle: "Experience the ultimate privilege", ...MASTERCARD },
      { title: "BCA American Express Platinum", subtitle: "For the finest things in life", ...AMEX },
      { title: "BCA Card Platinum", subtitle: "Kartu istimewa untuk pribadi istimewa", ...EVERYDAY },
      { title: "BCA Singapore Airlines KrisFlyer Visa Signature", subtitle: "Faster way to earn KrisFlyer miles", ...MASTERCARD },
      { title: "BCA Singapore Airlines KrisFlyer Visa Infinite", subtitle: "Faster way to earn KrisFlyer miles", ...AMEX },
      { title: "BCA Singapore Airlines PPS Club Visa Infinite", subtitle: "Faster way to earn KrisFlyer miles", ...EVERYDAY },
      { title: "BCA Visa Batman", subtitle: "My Card My Superhero", ...MASTERCARD },
      { title: "BCA Visa Black", subtitle: "Experience the ultimate privilege", ...AMEX },
      { title: "BCA Blibli Mastercard", subtitle: "Belanja online lebih untung bersama Blibli", ...EVERYDAY },
      { title: "BCA tiket.com Mastercard", subtitle: "Belanja Every Day, Bikin Hemat Holiday", ...MASTERCARD },
      { title: "BCA Mastercard Globe", subtitle: "My Card My Lifestyle Partner", ...AMEX },
      { title: "BCA Mastercard World", subtitle: "Kartu kredit premium untuk gaya hidup global", ...EVERYDAY },
      { title: "BCA JCB Black", subtitle: "Style specially for you", ...MASTERCARD },
      { title: "BCA UnionPay", subtitle: "Let's Live It Up!", ...AMEX },
    ]),
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    image: SAMPLE_CATEGORY_PHOTOS[2],
    description: "Solusi pembiayaan rumah, kendaraan, dan usaha",
    products: withFeaturedDefaults([
      { title: "Kredit Pemilikan Rumah", subtitle: "Makin mudah mendapatkan rumah idaman", ...EVERYDAY },
      { title: "Kredit Kendaraan Bermotor", subtitle: "Kenyamanan untuk mewujudkan kendaraan idaman", ...MASTERCARD },
      { title: "Pinjaman Kredit Tanpa Agunan Personal", subtitle: "Pinjaman untuk segala kebutuhan", ...AMEX },
      { title: "Kredit Sepeda Motor (KSM)", subtitle: "Kenyamanan untuk mewujudkan sepeda motor idaman", ...EVERYDAY },
      { title: "Secured Personal Loan", subtitle: "Fasilitas kredit dengan jaminan produk investasi", ...MASTERCARD },
    ]),
  },
  {
    key: "e-Banking",
    label: "e-Banking",
    image: SAMPLE_CATEGORY_PHOTOS[3],
    description: "Perbankan digital dalam satu genggaman",
    products: withFeaturedDefaults([
      { title: "myBCA", subtitle: "#NyamannyaDunia myBCA untuk nyamannya transaksi hingga investasi", ...SIMPANAN_1 },
      { title: "BCA mobile", subtitle: "Semua transaksi perbankan #DibikinSimpel", ...SIMPANAN_2 },
      { title: "KlikBCA", subtitle: "Layanan perbankan aman dan nyaman", ...SIMPANAN_3 },
      { title: "CS Digital", subtitle: "Solusi praktis ganti kartu", ...SIMPANAN_1 },
      { title: "eBranch", subtitle: "Reservasi di cabang jadi lebih nyaman", ...SIMPANAN_2 },
      { title: "Investasi Digital BCA", subtitle: "Investasi aman dan terkurasi mulai dari Rp10 ribu", ...SIMPANAN_3 },
      { title: "OneKlik", subtitle: "Transaksi online makin simpel dengan satu klik", ...SIMPANAN_1 },
      { title: "Persetujuan Digital", subtitle: "Verifikasi diri aman, mudah & cepat", ...SIMPANAN_2 },
      { title: "QRIS", subtitle: "Scan QR untuk cara bayar praktis", ...SIMPANAN_3 },
      { title: "Setor Tarik Tunai Mitra ATM BCA", subtitle: "Setor dan tarik tunai lewat aplikasi mitra di ATM BCA", ...SIMPANAN_1 },
      { title: "Virtual Account BCA", subtitle: "Pembayaran Lebih Mudah dengan Virtual Account BCA", ...SIMPANAN_2 },
      { title: "ATM BCA", subtitle: "Layanan unggulan dengan jaringan luas", ...SIMPANAN_3 },
      { title: "BCA by Phone", subtitle: "Layanan perbankan menyapa ramah di telinga", ...SIMPANAN_1 },
    ]),
  },
  {
    key: "Investasi",
    label: "Investasi",
    image: SAMPLE_CATEGORY_PHOTOS[4],
    description: "Kembangkan dana lewat beragam instrumen",
    products: withFeaturedDefaults([
      { title: "Reksa Dana", subtitle: "Investasi terjangkau untuk rencana masa depanmu", ...EVERYDAY },
      { title: "Obligasi", subtitle: "Berbagai macam pilihan obligasi dari BCA", ...MASTERCARD },
      { title: "Rekening Dana Nasabah (RDN)", subtitle: "Rekening dana untuk transaksi investasi lebih aman", ...AMEX },
      { title: "Rekening Dana Lender (RDL) BCA", subtitle: "Fasilitas rekening untuk transaksi pendanaan P2P lending", ...EVERYDAY },
    ]),
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    image: SAMPLE_CATEGORY_PHOTOS[5],
    description: "Proteksi menyeluruh untuk Anda dan keluarga",
    products: withFeaturedDefaults([
      { title: "Asuransi Jiwa", subtitle: "Proteksi jiwa dengan premi terjangkau", ...EVERYDAY },
      { title: "Asuransi Kesehatan", subtitle: "Perlindungan biaya rumah sakit lebih tenang", ...MASTERCARD },
      { title: "Asuransi Kendaraan", subtitle: "Proteksi kendaraan dari risiko tak terduga", ...AMEX },
      { title: "Asuransi Harta Benda", subtitle: "Proteksi untuk rumah dan aset berharga Anda", ...EVERYDAY },
      { title: "Asuransi Kecelakaan Diri", subtitle: "Perlindungan finansial akibat risiko kecelakaan", ...MASTERCARD },
      { title: "Asuransi Pendidikan", subtitle: "Persiapkan masa depan pendidikan anak lebih terjamin", ...AMEX },
      { title: "Asuransi Pensiun & Anuitas", subtitle: "Rencanakan masa pensiun dengan penghasilan tetap", ...EVERYDAY },
      { title: "Asuransi Perjalanan", subtitle: "Perlindungan menyeluruh selama perjalanan Anda", ...MASTERCARD },
      { title: "Asuransi Warisan", subtitle: "Wariskan perlindungan finansial untuk keluarga tercinta", ...AMEX },
    ]),
  },
];
