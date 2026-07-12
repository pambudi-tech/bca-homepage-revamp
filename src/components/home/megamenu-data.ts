export type MegaMenuProduct = {
  title: string;
  description: string;
};

export type MegaMenuTool = {
  icon: string;
  title: string;
};

export type MegaMenuLink = {
  label: string;
  type?: "article" | "video";
};

export type MegaMenuCategory = {
  key: string;
  label: string;
  width: number;
  promo: {
    title: string;
    description: string;
    cta: string;
    image: string;
  };
  listTitle: string;
  products: MegaMenuProduct[];
  ctaLabel: string;
  tools: MegaMenuTool[];
  links: MegaMenuLink[];
};

export const MEGAMENU: MegaMenuCategory[] = [
  {
    key: "Simpanan",
    label: "Simpanan",
    width: 126,
    promo: {
      title: "Temukan Simpanan yang Tepat",
      description: "Bandingkan jenis tabungan dan giro BCA sesuai kebutuhanmu.",
      cta: "Mulai Bandingkan",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "SIMPANAN PILIHAN",
    products: [
      { title: "Tahapan BCA", description: "Tabungan andalan untuk transaksi sehari-hari" },
      { title: "Tahapan Xpresi", description: "Tabungan anak muda dengan desain kartu custom" },
      { title: "Tahapan Gold", description: "Limit transaksi lebih besar untuk kebutuhanmu" },
      { title: "BCA Dollar", description: "Simpanan valuta asing USD dan SGD" },
    ],
    ctaLabel: "Lihat Semua Pilihan Simpanan",
    tools: [
      { icon: "/assets/navbar/icon-calc.svg", title: "Hitung Potensi Simpanan Anda" },
      { icon: "/assets/navbar/icon-doc-blue.svg", title: "Buka Rekening Secara Online" },
    ],
    links: [
      { label: "Cara buka rekening via myBCA", type: "video" },
      { label: "Simulasi bunga tabungan" },
      { label: "Syarat pembukaan rekening" },
      { label: "Biaya administrasi tabungan" },
    ],
  },
  {
    key: "Kartu Kredit",
    label: "Kartu Kredit",
    width: 142,
    promo: {
      title: "Bandingkan Kartu Kredit BCA",
      description:
        "Pilih hingga 3 kartu dan lihat perbandingan benefit, biaya, dan limit secara berdampingan.",
      cta: "Mulai Bandingkan",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "KARTU KREDIT PILIHAN",
    products: [
      { title: "BCA Everyday Card", description: "Kartu andalan untuk setiap kesempatan, dari belanja harian hingga tagihan rutin" },
      { title: "BCA Visa Batman", description: "Cashback harian & reward yang bisa ditukar untuk hiburan favoritmu" },
      { title: "BCA Mastercard Black", description: "Lounge, concierge & privilege eksklusif untuk gaya hidup premium" },
      { title: "BCA tiket.com Mastercard", description: "Extra poin tiap transaksi untuk hotel, penerbangan & perjalananmu" },
    ],
    ctaLabel: "Lihat Semua Pilihan Kartu Kredit",
    tools: [
      { icon: "/assets/navbar/icon-calc.svg", title: "Simulasi Cicilan Kartu Kredit" },
      { icon: "/assets/navbar/kk-reward-image.png", title: "Cek Reward BCA" },
    ],
    links: [
      { label: "Cara ajukan kartu kredit via website", type: "video" },
      { label: "Kartu kredit mana yang cocok untuk saya?" },
      { label: "Syarat pengajuan kartu kredit BCA" },
      { label: "Cara bayar tagihan kartu kredit BCA" },
    ],
  },
  {
    key: "Pinjaman",
    label: "Pinjaman",
    width: 121,
    promo: {
      title: "Wujudkan Rencanamu",
      description: "Simulasikan cicilan KPR, KKB, atau kredit tanpa agunan bersama BCA.",
      cta: "Mulai Simulasi",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "PINJAMAN PILIHAN",
    products: [
      { title: "KPR BCA", description: "Wujudkan rumah impian dengan bunga kompetitif" },
      { title: "KKB BCA", description: "Kredit kendaraan bermotor proses cepat" },
      { title: "Kredit Tanpa Agunan", description: "Dana cepat tanpa jaminan untuk kebutuhanmu" },
    ],
    ctaLabel: "Lihat Semua Pilihan Pinjaman",
    tools: [
      { icon: "/assets/navbar/icon-calc.svg", title: "Simulasi Cicilan Pinjaman" },
      { icon: "/assets/navbar/icon-doc-blue.svg", title: "Ajukan Pinjaman Online" },
    ],
    links: [
      { label: "Simulasi cicilan KPR" },
      { label: "Syarat pengajuan KKB" },
      { label: "Cara pengajuan pinjaman online", type: "video" },
    ],
  },
  {
    key: "e-Banking",
    label: "e-Banking",
    width: 128,
    promo: {
      title: "Transaksi Digital Tanpa Batas",
      description: "Kelola keuanganmu kapan saja lewat myBCA dan KlikBCA.",
      cta: "Unduh myBCA",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "LAYANAN E-BANKING",
    products: [
      { title: "myBCA", description: "Aplikasi perbankan digital untuk semua kebutuhanmu" },
      { title: "KlikBCA", description: "Internet banking untuk transaksi lebih leluasa" },
      { title: "BCA mobile", description: "Transaksi perbankan dalam genggaman" },
    ],
    ctaLabel: "Lihat Semua Layanan e-Banking",
    tools: [
      { icon: "/assets/navbar/icon-youtube.svg", title: "Tutorial Aktivasi myBCA" },
      { icon: "/assets/navbar/icon-doc-blue.svg", title: "Atasi Kendala Login" },
    ],
    links: [
      { label: "Cara aktivasi myBCA", type: "video" },
      { label: "Daftar KlikBCA Individu" },
      { label: "Atasi kendala login e-Banking" },
    ],
  },
  {
    key: "Investasi",
    label: "Investasi",
    width: 120,
    promo: {
      title: "Mulai Investasi Sekarang",
      description: "Reksa dana, obligasi, hingga saham dalam satu aplikasi BCA.",
      cta: "Mulai Investasi",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "INVESTASI PILIHAN",
    products: [
      { title: "Reksa Dana BCA", description: "Investasi mudah mulai dari Rp100 ribu" },
      { title: "Welma", description: "Platform investasi & asuransi digital BCA" },
      { title: "Obligasi Negara", description: "Investasi surat utang dengan imbal hasil tetap" },
    ],
    ctaLabel: "Lihat Semua Pilihan Investasi",
    tools: [
      { icon: "/assets/navbar/icon-calc.svg", title: "Simulasi Imbal Hasil Investasi" },
      { icon: "/assets/navbar/icon-doc-blue.svg", title: "Mulai Investasi Reksa Dana" },
    ],
    links: [
      { label: "Cara mulai investasi reksa dana", type: "video" },
      { label: "Panduan investasi untuk pemula" },
      { label: "Simulasi imbal hasil investasi" },
    ],
  },
  {
    key: "Asuransi",
    label: "Asuransi",
    width: 117,
    promo: {
      title: "Lindungi yang Berharga",
      description: "Asuransi jiwa, kesehatan, dan proteksi aset dari BCA Life.",
      cta: "Cari Proteksi",
      image: "/assets/navbar/kk-card-image.png",
    },
    listTitle: "ASURANSI PILIHAN",
    products: [
      { title: "BCA Life Info Proteksi", description: "Proteksi jiwa dengan premi terjangkau" },
      { title: "Asuransi Kesehatan", description: "Perlindungan biaya rumah sakit lebih tenang" },
      { title: "Asuransi Kendaraan", description: "Proteksi kendaraan dari risiko tak terduga" },
    ],
    ctaLabel: "Lihat Semua Pilihan Asuransi",
    tools: [
      { icon: "/assets/navbar/icon-calc.svg", title: "Hitung Premi Asuransi" },
      { icon: "/assets/navbar/icon-doc-blue.svg", title: "Ajukan Klaim Online" },
    ],
    links: [
      { label: "Cara klaim asuransi BCA Life", type: "video" },
      { label: "Pilih proteksi sesuai kebutuhan" },
      { label: "Simulasi premi asuransi" },
    ],
  },
];
