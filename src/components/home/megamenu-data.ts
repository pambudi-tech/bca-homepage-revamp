export type MegaMenuLink = {
  label: string;
  type?: "article" | "video";
};

export type MegaMenuCategory = {
  key: string;
  label: string;
  /** Fixed sub-nav tab width from the design; omit to size to content. */
  width?: number;
  /** Transaksi renders without a chevron in the design even though it opens a panel. */
  chevron?: boolean;
  products: string[];
  ctaLabel: string;
  links: MegaMenuLink[];
  editorial: {
    title: string;
    image: string;
  };
};

export const MEGAMENU: MegaMenuCategory[] = [
  {
    key: "Simpanan",
    label: "Simpanan",
    width: 126,
    products: [
      "Tahapan",
      "Tahapan Xpresi",
      "Tahapan Berjangka",
      "Deposito Berjangka",
      "Lihat Semua Simpanan",
    ],
    ctaLabel: "Bandingkan Antar Simpanan",
    links: [
      { label: "Cara top up & transfer antar rekening", type: "video" },
      { label: "Perbedaan Tahapan, Tapres, dan Deposito" },
      { label: "Berapa saldo minimum dan biaya admin tiap produk simpanan?" },
      { label: "Syarat & dokumen pembukaan rekening BCA" },
    ],
    editorial: {
      title: "Buka Rekening, Dapatkan Cashback QRIS Hingga Rp100.000",
      image: "/assets/navbar/mm-simpanan.webp",
    },
  },
  {
    key: "Kartu Kredit",
    label: "Kartu Kredit",
    width: 142,
    products: [
      "BCA Everyday Card",
      "BCA Visa Batman",
      "BCA Mastercard Black",
      "Reward BCA",
      "Lihat Semua Kartu Kredit",
    ],
    ctaLabel: "Bandingkan Antar Kartu Kredit",
    links: [
      { label: "Cara ajukan kartu kredit via website", type: "video" },
      { label: "Kartu kredit mana yang cocok untuk saya?" },
      { label: "Syarat pengajuan kartu kredit BCA" },
      { label: "Cara bayar tagihan kartu kredit BCA" },
    ],
    editorial: {
      title:
        "Apply Kartu Kredit Sekarang, Gratis Iuran Tahunan Seumur Hidup & Welcome Bonus Rp500.000",
      image: "/assets/navbar/mm-kartu-kredit.webp",
    },
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    width: 121,
    products: [
      "Paylater BCA",
      "Kredit Pemilikan Rumah",
      "Kredit Kendaraan Bermotor",
      "BCA Personal Loan",
      "Lihat Semua Pinjaman",
    ],
    ctaLabel: "Hitung Estimasi Cicilan",
    links: [
      { label: "Proses pengajuan dari awal hingga cair", type: "video" },
      { label: "Cara mengajukan KPR online lewat myBCA" },
      { label: "Syarat & dokumen pengajuan pinjaman di BCA" },
      { label: "Berapa maksimal pinjaman yang bisa saya ajukan?" },
    ],
    editorial: {
      title: "Bunga KPR Spesial 2,99% di Tahun Pertama",
      image: "/assets/navbar/mm-pinjaman.webp",
    },
  },
  {
    key: "e-Banking",
    label: "e-Banking",
    width: 128,
    products: ["myBCA", "KlikBCA", "Sakuku", "e-Branch", "Lihat Semua e-Banking"],
    ctaLabel: "Bandingkan Antar e-Banking",
    links: [
      { label: "Proses pengajuan dari awal hingga cair", type: "video" },
      { label: "Cara mengajukan KPR online lewat myBCA" },
      { label: "Syarat & dokumen pengajuan pinjaman di BCA" },
      { label: "Berapa maksimal pinjaman yang bisa saya ajukan?" },
    ],
    editorial: {
      title:
        "Belanja Pakai QRIS di myBCA Banking, Dapatkan Diskon Hingga 50% di Merchant Pilihan",
      image: "/assets/navbar/mm-ebanking.webp",
    },
  },
  {
    key: "Investasi",
    label: "Investasi",
    width: 120,
    products: [
      "Reksa Dana",
      "Obligasi",
      "Surat Berharga Negara",
      "Rekening Dana Nasabah",
      "Lihat Semua Investasi",
    ],
    ctaLabel: "Hitung Potensi Investasi",
    links: [
      { label: "Panduan memilih produk investasi sesuai profil risiko", type: "video" },
      { label: "Cara beli Reksa Dana lewat myBCA" },
      { label: "Apa perbedaan Reksa Dana, Obligasi, dan SBN?" },
      { label: "Berapa minimal investasi di BCA?" },
    ],
    editorial: {
      title:
        "Beli SBN dan Obligasi Sekarang, Nikmati Imbal Hasil Spesial Lebih Tinggi dari Deposito",
      image: "/assets/navbar/mm-investasi.webp",
    },
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    width: 117,
    products: [
      "Asuransi Jiwa",
      "Asuransi Kesehatan",
      "Asuransi Properti",
      "Asuransi Kendaraan",
      "Lihat Semua Asuransi",
    ],
    ctaLabel: "Hitung Estimasi Premi Asuransi",
    links: [
      { label: "Apa perbedaan asuransi jiwa dan asuransi kesehatan?", type: "video" },
      { label: "Memilih asuransi yang tepat untuk keluargamu" },
      { label: "Apa perbedaan asuransi jiwa dan asuransi kesehatan?" },
    ],
    editorial: {
      title: "Dapatkan Diskon Premi 20% untuk Pendaftaran Tahun Pertama",
      image: "/assets/navbar/mm-asuransi.webp",
    },
  },
  {
    key: "Transaksi",
    label: "Transaksi",
    chevron: false,
    products: ["Flazz", "Firecash", "Remittence", "Lihat Semua Transaksi"],
    ctaLabel: "Hitung Estimasi Premi Asuransi",
    links: [
      { label: "Cara Praktis Top-Up Flazz Langsung dari myBCA", type: "video" },
      { label: "Panduan Lengkap Kirim Uang ke Luar Negeri" },
      {
        label:
          "Syarat dan Cara Mencairkan Dana Firecash di Kantor Cabang Terdekat Tanpa Potongan",
      },
    ],
    editorial: {
      title:
        "Kirim Uang ke Luar Negeri Bebas Biaya Telex & Dapatkan Nilai Tukar Kurs Paling Spesial",
      image: "/assets/navbar/mm-simpanan.webp",
    },
  },
];
