// Search-recommendation dataset for the hero widget.
//
// Titles, descriptions and categories are transcribed from the live bca.co.id
// site (product/service pages under /id/Individu, Edukatips + News & Features
// articles under /id/informasi, and promos under /id/promo-bca), so the dummy
// search returns things a real BCA visitor would actually see. `href` stays "#"
// because the revamp doesn't have its own routes yet — the copy is real, the
// destinations are placeholders.
//
// Matching lives in two other files:
//   - search-synonyms.ts — the concept graph ("rumah" ⇢ KPR, "nabung" ⇢ Tahapan)
//   - search-engine.ts   — normalization, scoring and ranking
// Each record carries a `tags` list, which is how it opts into intent matching
// beyond its own wording. When a search *should* have found something and
// didn't, the fix is almost always a tag here or a term in the concept graph.
//
// TO GO LIVE LATER: keep the return shape identical and replace the body of
// `getSearchRecommendations` with a `fetch()` to our own backend route (a
// server-side proxy that queries BCA's real search endpoint and returns JSON).
// The component only depends on the shape, so the UI won't change.

import { rankBySearchScored, type Searchable } from "./search-engine";

export type ProductIcon =
  | "mybca"
  | "wallet"
  | "card"
  | "house"
  | "car"
  | "chart"
  | "phone"
  | "shield"
  | "cash"
  | "qr"
  | "transfer"
  | "support"
  | "location"
  | "star";

export type InfoCategory = "produk-layanan" | "artikel" | "promo";

export type ProductRec = Searchable & {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ProductIcon;
};

export type InfoRec = Searchable & {
  id: string;
  title: string;
  href: string;
  category: InfoCategory;
};

/** Which section led the ranking for this query — best top score first. */
export type SearchSectionKey = "products" | "program" | "information";

export type SearchRecommendations = {
  products: ProductRec[];
  information: InfoRec[];
  /** Image-led campaign cards (concerts, events) — see `PROGRAMS` below. */
  program: ProgramRec[];
  /** Section render order, best-matching group first (e.g. "The Weeknd" → program leads). */
  order: SearchSectionKey[];
};

// Badge palette per information category — the label is translated in
// SearchRecommendation via `t(\`categories.${category}\`)`. Colors come
// straight from the Figma "Categorical Badge" tokens.
export const INFO_CATEGORY_STYLE: Record<InfoCategory, { bg: string; text: string }> = {
  "produk-layanan": { bg: "#ccfffe", text: "#188b88" },
  artikel: { bg: "#f4e5f6", text: "#70257c" },
  promo: { bg: "#ffead1", text: "#c44d00" },
};

/* ---------------------------------------------------------------------------
 * Products & services
 *
 * `weight` is a tie-breaker, not a score: it only separates records the engine
 * rates equally. Flagship products carry 6–10 so that a broad query like
 * "kartu" leads with the main Kartu Kredit page rather than a sub-feature.
 * ------------------------------------------------------------------------- */

const PRODUCTS: ProductRec[] = [
  // --- Digital channels --------------------------------------------------
  {
    id: "mybca",
    title: "myBCA",
    description: "Satu aplikasi untuk semua kebutuhan perbankan kamu",
    href: "#",
    icon: "mybca",
    tags: ["aplikasi", "mobile banking", "digital", "online", "login", "transaksi", "do it better"],
    weight: 10,
  },
  {
    id: "bca-mobile",
    title: "BCA mobile",
    description: "Mobile banking untuk transfer, bayar tagihan, dan cek saldo",
    href: "#",
    icon: "phone",
    tags: ["aplikasi", "m-bca", "mbca", "mobile banking", "transfer", "cek saldo"],
    weight: 8,
  },
  {
    id: "klikbca",
    title: "KlikBCA",
    description: "Internet banking lengkap dari PC maupun smartphone",
    href: "#",
    icon: "phone",
    tags: ["internet banking", "klik bca", "online", "web", "transaksi"],
    weight: 6,
  },
  {
    id: "atm-bca",
    title: "ATM BCA",
    description: "ATM Setor Tarik, Multifungsi, dan Non Tunai di seluruh Indonesia",
    href: "#",
    icon: "location",
    tags: ["tarik tunai", "setor tunai", "mesin atm", "lokasi", "terdekat", "cash"],
    weight: 7,
  },
  {
    id: "qris",
    title: "QRIS BCA",
    description: "Bayar cukup dengan scan kode QR dari aplikasi BCA",
    href: "#",
    icon: "qr",
    tags: ["qr", "scan", "barcode", "pembayaran", "merchant", "tap"],
    weight: 6,
  },
  {
    id: "oneklik",
    title: "OneKlik",
    description: "Bayar belanja online cukup dengan satu klik",
    href: "#",
    icon: "qr",
    tags: ["pembayaran", "belanja online", "e-commerce", "checkout", "paspor bca"],
  },
  {
    id: "klikpay",
    title: "BCA KlikPay",
    description: "Pembayaran praktis dan aman untuk belanja online",
    href: "#",
    icon: "qr",
    tags: ["pembayaran", "belanja online", "e-commerce", "checkout"],
  },
  {
    id: "bca-by-phone",
    title: "BCA by Phone",
    description: "Transaksi non tunai dan info perbankan lewat telepon",
    href: "#",
    icon: "support",
    tags: ["telepon", "call center", "halo bca", "transaksi"],
  },
  {
    id: "cs-digital",
    title: "CS Digital",
    description: "Layanan customer service mandiri dengan verifikasi sidik jari",
    href: "#",
    icon: "support",
    tags: ["customer service", "cabang", "kartu hilang", "ganti kartu", "cetak kartu"],
  },
  {
    id: "virtual-account",
    title: "Virtual Account BCA",
    description: "Nomor rekening khusus untuk pembayaran tagihan apa pun",
    href: "#",
    icon: "transfer",
    tags: ["va", "pembayaran", "tagihan", "transfer", "billing"],
  },
  {
    id: "e-statement",
    title: "e-Statement myBCA",
    description: "Cek mutasi rekening sampai dengan tahun 2016",
    href: "#",
    icon: "mybca",
    tags: ["mutasi", "rekening koran", "riwayat transaksi", "laporan", "history"],
  },
  {
    id: "poket-rupiah",
    title: "Poket Rupiah",
    description: "Pisahkan dana sesuai kebutuhan dalam satu rekening",
    href: "#",
    icon: "wallet",
    tags: ["alokasi dana", "budgeting", "atur keuangan", "mybca", "amplop"],
  },
  {
    id: "bagibagi",
    title: "BagiBagi",
    description: "Kirim uang ke banyak orang sekaligus lewat BCA mobile",
    href: "#",
    icon: "transfer",
    tags: ["thr", "transfer", "bagi bagi", "kirim uang", "angpao", "hadiah"],
  },
  {
    id: "cardless",
    title: "Tarik & Setor Tunai Tanpa Kartu",
    description: "Ambil dan setor uang di ATM hanya bermodal HP",
    href: "#",
    icon: "cash",
    tags: ["cardless", "tanpa kartu", "tarik tunai", "setor tunai", "atm", "lupa kartu"],
  },
  {
    id: "donasi-zakat",
    title: "Donasi & Zakat",
    description: "Salurkan zakat, infak, dan donasi langsung dari myBCA",
    href: "#",
    icon: "mybca",
    tags: ["zakat", "sedekah", "amal", "infak", "wakaf", "ramadan", "ibadah"],
  },

  // --- Savings -----------------------------------------------------------
  {
    id: "tahapan",
    title: "Tahapan BCA",
    description: "Tabungan serba bisa untuk transaksi harian kamu",
    href: "#",
    icon: "wallet",
    tags: ["tabungan", "nabung", "rekening", "paspor bca", "buka rekening", "simpanan"],
    weight: 10,
  },
  {
    id: "tahapan-xpresi",
    title: "Tahapan Xpresi",
    description: "Setoran awal Rp50 ribu dan desain kartu sesuai gayamu",
    href: "#",
    icon: "wallet",
    tags: ["tabungan", "anak muda", "pelajar", "mahasiswa", "murah", "kartu lucu", "gen z"],
    weight: 8,
  },
  {
    id: "tahapan-berjangka",
    title: "Tahapan Berjangka",
    description: "Menabung rutin dengan setoran tetap tiap bulan",
    href: "#",
    icon: "wallet",
    tags: ["tabungan rencana", "nabung rutin", "target", "masa depan", "disiplin", "asuransi jiwa"],
    weight: 7,
  },
  {
    id: "tahapan-berjangka-simuda",
    title: "Tahapan Berjangka SiMuda",
    description: "Tabungan berjangka untuk usia 18–30 tahun",
    href: "#",
    icon: "wallet",
    tags: ["anak muda", "milenial", "tabungan rencana", "nabung rutin", "gen z"],
  },
  {
    id: "soulmitmen",
    title: "Tahapan Berjangka Soulmitmen",
    description: "Nabung bareng teman untuk wujudkan rencana bersama",
    href: "#",
    icon: "wallet",
    tags: ["nabung bareng", "patungan", "teman", "rencana", "hadiah"],
  },
  {
    id: "tapres",
    title: "Tapres BCA",
    description: "Tabungan dengan suku bunga lebih tinggi dari Tahapan",
    href: "#",
    icon: "wallet",
    tags: ["tabungan prestasi", "bunga tinggi", "nabung", "simpanan"],
  },
  {
    id: "tabunganku",
    title: "TabunganKu",
    description: "Tabungan tanpa biaya administrasi bulanan",
    href: "#",
    icon: "wallet",
    tags: ["gratis", "bebas biaya", "murah", "nabung", "setoran ringan", "pemula"],
  },
  {
    id: "simpanan-pelajar",
    title: "Simpanan Pelajar (SimPel)",
    description: "Tabungan khusus pelajar untuk belajar menabung sejak dini",
    href: "#",
    icon: "wallet",
    tags: ["pelajar", "anak", "sekolah", "siswa", "edukasi", "murah"],
  },
  {
    id: "bca-dollar",
    title: "BCA Dollar",
    description: "Tabungan valas dalam USD dan SGD",
    href: "#",
    icon: "transfer",
    tags: ["valas", "dollar", "usd", "sgd", "mata uang asing", "kurs"],
  },
  {
    id: "deposito",
    title: "Deposito Berjangka",
    description: "Simpanan berjangka dengan bunga lebih tinggi",
    href: "#",
    icon: "chart",
    tags: ["investasi", "bunga", "aman", "jangka waktu", "tenor", "bilyet"],
    weight: 7,
  },
  {
    id: "e-deposito",
    title: "e-Deposito",
    description: "Buka dan cairkan deposito tanpa perlu ke cabang",
    href: "#",
    icon: "chart",
    tags: ["deposito online", "investasi", "digital", "mybca", "bunga"],
  },

  // --- Cards -------------------------------------------------------------
  {
    id: "kartu-kredit",
    title: "Kartu Kredit BCA",
    description: "Beragam pilihan kartu sesuai gaya hidupmu",
    href: "#",
    icon: "card",
    tags: ["credit card", "cc", "cicilan", "reward", "limit", "pengajuan", "apply"],
    weight: 10,
  },
  {
    id: "pilihan-kartu",
    title: "Pilihan Kartu Kredit",
    description: "Bandingkan semua kartu kredit BCA dalam satu halaman",
    href: "#",
    icon: "card",
    tags: ["bandingkan", "jenis kartu", "visa", "mastercard", "everyday", "platinum"],
  },
  {
    id: "cicilan-bca",
    title: "Cicilan BCA",
    description: "Ubah transaksi kartu kredit jadi cicilan bunga ringan",
    href: "#",
    icon: "card",
    tags: ["cicilan 0", "angsuran", "bunga ringan", "installment", "tenor"],
    weight: 6,
  },
  {
    id: "paylater",
    title: "Paylater BCA",
    description: "Bayar nanti untuk transaksi di myBCA",
    href: "#",
    icon: "card",
    tags: ["pay later", "bayar nanti", "bnpl", "kredit", "limit", "aktivasi"],
    weight: 8,
  },
  {
    id: "reward-bca",
    title: "Reward BCA",
    description: "Kumpulkan poin dari tiap transaksi kartu kredit",
    href: "#",
    icon: "star",
    tags: ["poin", "loyalty", "tukar poin", "hadiah", "cashback", "merchant"],
  },
  {
    id: "debit-contactless",
    title: "Debit BCA Contactless",
    description: "Bayar cukup tap kartu tanpa perlu gesek atau dip",
    href: "#",
    icon: "card",
    tags: ["paspor bca", "tap", "nfc", "kartu debit", "mastercard", "cepat"],
  },
  {
    id: "kontrol-kartu-kredit",
    title: "Kontrol Kartu Kredit",
    description: "Atur limit, blokir, dan pantau kartu dari aplikasi",
    href: "#",
    icon: "card",
    tags: ["blokir", "keamanan", "limit", "kartu hilang", "aman", "atur"],
  },
  {
    id: "autopay",
    title: "Autopay BCA",
    description: "Bayar tagihan rutin otomatis tiap bulan",
    href: "#",
    icon: "card",
    tags: ["autodebet", "tagihan", "listrik", "telepon", "otomatis", "rutin"],
  },
  {
    id: "aktivasi-pin",
    title: "Aktivasi PIN Kartu Kredit",
    description: "Aktifkan PIN kartu kredit kapan pun dan di mana pun",
    href: "#",
    icon: "card",
    tags: ["pin", "aktivasi", "kartu baru", "keamanan"],
  },
  {
    id: "mastercard-world",
    title: "BCA Mastercard World",
    description: "Kartu premium dengan privilese travel dan dining",
    href: "#",
    icon: "star",
    tags: ["premium", "eksklusif", "lounge", "travel", "golf", "dining"],
  },
  {
    id: "singapore-airlines",
    title: "BCA Singapore Airlines Card",
    description: "Kumpulkan KrisFlyer miles dari transaksi harian",
    href: "#",
    icon: "star",
    tags: ["miles", "krisflyer", "penerbangan", "travel", "pesawat", "premium"],
  },
  {
    id: "flazz",
    title: "Flazz BCA",
    description: "Kartu uang elektronik untuk tol, transit, dan belanja",
    href: "#",
    icon: "card",
    tags: ["e-money", "uang elektronik", "tol", "transjakarta", "commuter", "top up", "saldo"],
    weight: 6,
  },
  {
    id: "sakuku",
    title: "Sakuku",
    description: "Dompet digital praktis untuk transaksi harian",
    href: "#",
    icon: "phone",
    tags: ["e-wallet", "dompet digital", "uang elektronik", "split bill", "top up"],
  },

  // --- Loans -------------------------------------------------------------
  {
    id: "kpr",
    title: "KPR BCA",
    description: "Wujudkan rumah impian dengan angsuran ringan",
    href: "#",
    icon: "house",
    tags: ["rumah", "properti", "hunian", "kredit pemilikan rumah", "mortgage", "pengajuan", "simulasi"],
    weight: 10,
  },
  {
    id: "kpr-first",
    title: "KPR First",
    description: "Kredit rumah dengan pilihan bunga paling menguntungkan",
    href: "#",
    icon: "house",
    tags: ["rumah", "bunga rendah", "properti", "fix", "cicilan rumah"],
  },
  {
    id: "kpr-refinancing",
    title: "KPR Refinancing",
    description: "Dana tunai dengan jaminan rumah yang sudah dimiliki",
    href: "#",
    icon: "house",
    tags: ["rumah", "agunan", "dana tunai", "properti", "pinjaman"],
  },
  {
    id: "kpr-renovasi",
    title: "KPR Renovasi",
    description: "Biaya renovasi rumah dengan cicilan terjangkau",
    href: "#",
    icon: "house",
    tags: ["renovasi", "rumah", "perbaikan", "bangun", "properti"],
  },
  {
    id: "kpr-takeover",
    title: "KPR Take Over",
    description: "Pindahkan KPR dari bank lain, angsuran jadi lebih ringan",
    href: "#",
    icon: "house",
    tags: ["take over", "pindah bank", "rumah", "angsuran ringan", "properti"],
  },
  {
    id: "kkb",
    title: "KKB BCA",
    description: "Kredit kendaraan bermotor dengan bunga kompetitif",
    href: "#",
    icon: "car",
    tags: ["mobil", "kendaraan", "kredit kendaraan bermotor", "mobil baru", "mobil bekas", "otomotif"],
    weight: 9,
  },
  {
    id: "kkb-refinancing",
    title: "KKB Refinancing",
    description: "Dana tunai dengan jaminan BPKB kendaraan",
    href: "#",
    icon: "car",
    tags: ["mobil", "bpkb", "dana tunai", "agunan", "kendaraan", "pinjaman"],
  },
  {
    id: "ksm",
    title: "KSM BCA",
    description: "Kredit sepeda motor dengan syarat mudah",
    href: "#",
    icon: "car",
    tags: ["motor", "sepeda motor", "roda dua", "kredit motor", "kendaraan"],
  },
  {
    id: "pinjaman-personal",
    title: "BCA Personal Loan",
    description: "Kredit tanpa agunan untuk berbagai kebutuhan",
    href: "#",
    icon: "cash",
    tags: ["kta", "tanpa agunan", "pinjaman", "dana tunai", "butuh dana", "modal"],
    weight: 7,
  },
  {
    id: "secured-personal-loan",
    title: "Secured Personal Loan",
    description: "Pinjaman berjaminan investasi, plafon hingga Rp5 miliar",
    href: "#",
    icon: "cash",
    tags: ["pinjaman", "agunan", "investasi", "plafon besar", "dana tunai"],
  },

  // --- Investment --------------------------------------------------------
  {
    id: "reksa-dana",
    title: "Reksa Dana BCA",
    description: "Mulai investasi dari nominal kecil lewat myBCA",
    href: "#",
    icon: "chart",
    tags: ["investasi", "reksadana", "pemula", "manajer investasi", "pasar uang", "saham", "cuan"],
    weight: 9,
  },
  {
    id: "obligasi",
    title: "Obligasi BCA",
    description: "Surat Berharga Negara dengan imbal hasil menarik",
    href: "#",
    icon: "chart",
    tags: ["investasi", "sbn", "ori", "sukuk", "surat berharga", "kupon", "negara"],
    weight: 6,
  },
  {
    id: "investasi-mybca",
    title: "Investasi di myBCA",
    description: "Beli reksa dana, obligasi, dan asuransi dari satu aplikasi",
    href: "#",
    icon: "chart",
    tags: ["welma", "investasi online", "digital", "portofolio", "aplikasi"],
  },
  {
    id: "rdn",
    title: "Rekening Dana Nasabah (RDN)",
    description: "Rekening khusus untuk transaksi jual beli saham",
    href: "#",
    icon: "chart",
    tags: ["saham", "sekuritas", "bursa", "trading", "investasi", "idx"],
  },
  {
    id: "simulasi-investasi",
    title: "Simulasi Investasi",
    description: "Hitung target dan estimasi hasil investasimu",
    href: "#",
    icon: "chart",
    tags: ["kalkulator", "hitung", "simulasi", "target", "perencanaan", "estimasi"],
  },
  {
    id: "profil-risiko",
    title: "Profil Risiko Investasi",
    description: "Kenali profil risikomu sebelum mulai berinvestasi",
    href: "#",
    icon: "chart",
    tags: ["kuesioner", "risiko", "konservatif", "agresif", "pemula", "cek profil"],
  },
  {
    id: "goodplan",
    title: "GoodPlan BCA",
    description: "Perencanaan keuangan sesuai tahap kehidupanmu",
    href: "#",
    icon: "chart",
    tags: ["financial planner", "perencanaan", "rencana keuangan", "tujuan", "masa depan"],
  },

  // --- Insurance ---------------------------------------------------------
  {
    id: "bancassurance",
    title: "Asuransi BCA (Bancassurance)",
    description: "Proteksi jiwa, kesehatan, dan harta benda dari mitra BCA",
    href: "#",
    icon: "shield",
    tags: ["asuransi", "proteksi", "perlindungan", "premi", "polis", "aia", "prudential"],
    weight: 7,
  },
  {
    id: "asuransi-kesehatan",
    title: "Asuransi Kesehatan",
    description: "Perlindungan biaya rawat inap dan penyakit kritis",
    href: "#",
    icon: "shield",
    tags: ["kesehatan", "rawat inap", "rumah sakit", "penyakit kritis", "medis", "kanker"],
  },
  {
    id: "asuransi-jiwa",
    title: "Asuransi Jiwa",
    description: "Jaminan finansial untuk keluarga yang kamu sayangi",
    href: "#",
    icon: "shield",
    tags: ["jiwa", "keluarga", "warisan", "santunan", "proteksi", "meninggal"],
  },
  {
    id: "asuransi-kendaraan",
    title: "Asuransi Kendaraan Bermotor",
    description: "Lindungi mobil dan motor dari risiko tak terduga",
    href: "#",
    icon: "shield",
    tags: ["mobil", "motor", "kendaraan", "kecelakaan", "all risk", "tlo"],
  },
  {
    id: "asuransi-perjalanan",
    title: "Asuransi Perjalanan",
    description: "Proteksi perjalanan untuk pemegang Kartu Kredit BCA",
    href: "#",
    icon: "shield",
    tags: ["travel", "liburan", "luar negeri", "pesawat", "bagasi", "delay"],
  },
  {
    id: "asuransi-pendidikan",
    title: "Asuransi Pendidikan",
    description: "Siapkan biaya sekolah dan kuliah anak sejak dini",
    href: "#",
    icon: "shield",
    tags: ["pendidikan", "anak", "sekolah", "kuliah", "masa depan", "edukasi"],
  },

  // --- Transfers & FX ----------------------------------------------------
  {
    id: "kurs",
    title: "Kurs BCA",
    description: "Kurs e-Rate, TT Counter, dan Bank Notes hari ini",
    href: "#",
    icon: "transfer",
    tags: ["kurs hari ini", "valas", "dollar", "usd", "tukar uang", "e-rate", "kalkulator kurs"],
    weight: 8,
  },
  {
    id: "remittance",
    title: "Remittance BCA",
    description: "Kirim dan terima uang dari luar negeri dalam valas",
    href: "#",
    icon: "transfer",
    tags: ["transfer luar negeri", "kiriman uang", "valas", "internasional", "tki", "swift"],
  },
  {
    id: "firecash",
    title: "FireCash",
    description: "Terima kiriman valas tanpa biaya di cabang BCA",
    href: "#",
    icon: "transfer",
    tags: ["valas", "luar negeri", "kiriman uang", "cepat", "gratis biaya"],
  },

  // --- Service & network -------------------------------------------------
  {
    id: "halobca",
    title: "Halo BCA 1500888",
    description: "Layanan customer service resmi BCA 24 jam",
    href: "#",
    icon: "support",
    tags: ["call center", "bantuan", "komplain", "keluhan", "kontak", "telepon", "24 jam"],
    weight: 7,
  },
  {
    id: "whatsapp-bca",
    title: "WhatsApp & Webchat BCA",
    description: "Chat resmi BCA di 0811-1500-998",
    href: "#",
    icon: "support",
    tags: ["whatsapp", "wa", "chat", "bantuan", "customer service", "verified"],
  },
  {
    id: "vira",
    title: "VIRA BCA",
    description: "Asisten chat virtual untuk info perbankan instan",
    href: "#",
    icon: "support",
    tags: ["chatbot", "asisten", "bantuan", "chat", "virtual assistant"],
  },
  {
    id: "lokasi-bca",
    title: "Lokasi BCA",
    description: "Cari kantor cabang, ATM, dan myBCA Store terdekat",
    href: "#",
    icon: "location",
    tags: ["cabang", "atm", "terdekat", "alamat", "maps", "jaringan", "dimana"],
    weight: 8,
  },
  {
    id: "mybca-store",
    title: "myBCA Store",
    description: "Cabang modern dengan layanan digital mandiri",
    href: "#",
    icon: "location",
    tags: ["cabang", "digital", "lokasi", "self service"],
  },
  {
    id: "bca-express",
    title: "BCA Express",
    description: "Transaksi cepat tanpa antre di kantor cabang",
    href: "#",
    icon: "location",
    tags: ["cabang", "antre", "cepat", "setor tunai", "transaksi"],
  },
  {
    id: "bca-prioritas",
    title: "BCA Prioritas",
    description: "Layanan perbankan prestisius untuk nasabah terpilih",
    href: "#",
    icon: "star",
    tags: ["premium", "eksklusif", "priority", "wealth", "relationship officer", "lounge"],
  },
  {
    id: "pengkinian-data",
    title: "Pengkinian Data",
    description: "Perbarui data nasabah agar layanan tetap optimal",
    href: "#",
    icon: "support",
    tags: ["update data", "ganti alamat", "ganti nomor", "ktp", "data diri", "verifikasi"],
  },
  {
    id: "haji-umrah",
    title: "Setoran Haji (BPIH)",
    description: "Layanan setoran biaya penyelenggaraan ibadah haji",
    href: "#",
    icon: "wallet",
    tags: ["haji", "umrah", "ibadah", "porsi haji", "tabungan haji", "religi"],
  },
];

/* ---------------------------------------------------------------------------
 * Information — articles, promos, and product/service how-tos.
 * ------------------------------------------------------------------------- */

const INFORMATION: InfoRec[] = [
  // --- Account opening ---------------------------------------------------
  {
    id: "buka-rekening-online",
    title: "Buka Rekening BCA Online di myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["buka rekening", "daftar", "online", "tanpa ke cabang", "rekening baru", "registrasi"],
    weight: 9,
  },
  {
    id: "buka-rekening-bca-mobile",
    title: "Buat Rekening Baru lewat BCA mobile",
    href: "#",
    category: "produk-layanan",
    tags: ["buka rekening", "aplikasi", "online", "daftar", "rekening baru"],
  },
  {
    id: "syarat-buka-rekening",
    title: "Syarat dan Dokumen Buka Rekening BCA",
    href: "#",
    category: "artikel",
    tags: ["syarat", "ktp", "npwp", "dokumen", "buka rekening", "setoran awal"],
  },
  {
    id: "pilih-tabungan",
    title: "Panduan Memilih Tabungan BCA yang Tepat",
    href: "#",
    category: "artikel",
    tags: ["tabungan", "nabung", "bandingkan", "tahapan", "pemula", "pilih"],
  },

  // --- myBCA / digital ---------------------------------------------------
  {
    id: "aktivasi-mybca",
    title: "Cara Install & Aktivasi myBCA",
    href: "#",
    category: "artikel",
    tags: ["install", "download", "aktivasi", "aplikasi", "mybca id", "daftar"],
    weight: 8,
  },
  {
    id: "transaksi-website-mybca",
    title: "Transaksi Lebih Mudah dan Nyaman di Website myBCA",
    href: "#",
    category: "artikel",
    tags: ["website", "mybca", "browser", "online", "transaksi"],
  },
  {
    id: "aplikasi-keybca",
    title: "Kenal Lebih Dekat dengan Aplikasi keyBCA",
    href: "#",
    category: "artikel",
    tags: ["keybca", "token", "otp", "kode akses", "keamanan", "klikbca"],
  },
  {
    id: "verifikasi-email-klikbca",
    title: "Yuk Verifikasi Email KlikBCA-mu Agar Transaksi Terpantau",
    href: "#",
    category: "artikel",
    tags: ["email", "verifikasi", "klikbca", "keamanan", "notifikasi"],
  },
  {
    id: "lupa-pin-mybca",
    title: "Cara Reset PIN dan Password myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["lupa pin", "lupa password", "reset", "keamanan", "akses", "terblokir"],
    weight: 6,
  },
  {
    id: "smartwatch",
    title: "Cek Saldo dari Smartwatch dengan myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["smartwatch", "jam tangan", "wearable", "cek saldo", "gadget"],
  },
  {
    id: "persetujuan-digital",
    title: "Persetujuan Digital untuk Transaksi Cabang",
    href: "#",
    category: "produk-layanan",
    tags: ["digital", "approval", "cabang", "tanda tangan", "paperless"],
  },

  // --- Cards & paylater --------------------------------------------------
  {
    id: "pengajuan-kartu-kredit",
    title: "Pengajuan Kartu Kredit BCA Online",
    href: "#",
    category: "produk-layanan",
    tags: ["apply", "ajukan", "kartu kredit", "syarat", "online", "pengajuan"],
    weight: 8,
  },
  {
    id: "aktivasi-paylater",
    title: "Aktivasi Paylater BCA di myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["paylater", "aktivasi", "bayar nanti", "limit", "daftar"],
    weight: 7,
  },
  {
    id: "bayar-tagihan-kartu-kredit",
    title: "Cara Bayar Tagihan Kartu Kredit BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["bayar tagihan", "kartu kredit", "jatuh tempo", "pembayaran", "autodebet"],
  },
  {
    id: "ubah-cicilan",
    title: "Cara Ubah Transaksi Jadi Cicilan BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["cicilan", "installment", "angsuran", "kartu kredit", "tenor"],
  },
  {
    id: "earning-reward",
    title: "Penyesuaian Earning Reward Kartu Kredit BCA",
    href: "#",
    category: "artikel",
    tags: ["reward", "poin", "kartu kredit", "perubahan", "loyalty"],
  },
  {
    id: "ganti-kartu-chip",
    title: "Ganti Kartu Debit BCA Non-Chip ke Kartu Chip",
    href: "#",
    category: "produk-layanan",
    tags: ["ganti kartu", "chip", "recarding", "kartu debit", "tukar", "cs digital"],
  },
  {
    id: "kartu-hilang",
    title: "Kartu Hilang atau Tertelan? Ini Cara Blokirnya",
    href: "#",
    category: "artikel",
    tags: ["blokir", "hilang", "tertelan", "keamanan", "halo bca", "darurat"],
    weight: 6,
  },
  {
    id: "limit-transaksi",
    title: "Perubahan Limit Transaksi & Biaya Administrasi Bulanan",
    href: "#",
    category: "artikel",
    tags: ["limit", "biaya admin", "tarif", "perubahan", "transaksi"],
  },

  // --- Loans -------------------------------------------------------------
  {
    id: "ajukan-kpr",
    title: "Ajukan KPR BCA Secara Online",
    href: "#",
    category: "produk-layanan",
    tags: ["kpr", "rumah", "pengajuan", "apply", "syarat", "properti"],
    weight: 8,
  },
  {
    id: "simulasi-kpr",
    title: "Simulasi Angsuran KPR BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["simulasi", "kalkulator", "angsuran", "kpr", "rumah", "hitung", "cicilan"],
    weight: 7,
  },
  {
    id: "kpr-fix-berjenjang",
    title: "Miliki Rumah dengan KPR BCA Fix Berjenjang",
    href: "#",
    category: "produk-layanan",
    tags: ["kpr", "rumah", "bunga", "fix", "berjenjang", "properti"],
  },
  {
    id: "kpr-sejahtera",
    title: "KPR Sejahtera BCA untuk Rumah Pertama",
    href: "#",
    category: "produk-layanan",
    tags: ["kpr", "subsidi", "rumah pertama", "fltp", "terjangkau"],
  },
  {
    id: "simulasi-kredit-kendaraan",
    title: "Simulasi Kredit Kendaraan KKB BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["simulasi", "kkb", "mobil", "kendaraan", "angsuran", "hitung", "dp"],
    weight: 6,
  },
  {
    id: "apply-kkb",
    title: "Form Pengajuan KKB BCA Online",
    href: "#",
    category: "produk-layanan",
    tags: ["kkb", "mobil", "pengajuan", "apply", "form", "kendaraan"],
  },
  {
    id: "pengajuan-ksm",
    title: "Form Pengajuan KSM BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["ksm", "motor", "pengajuan", "apply", "form", "sepeda motor"],
  },
  {
    id: "sbdk",
    title: "Suku Bunga Dasar Kredit (SBDK) BCA",
    href: "#",
    category: "artikel",
    tags: ["bunga", "suku bunga", "kredit", "sbdk", "acuan", "pinjaman"],
  },
  {
    id: "tips-ajukan-pinjaman",
    title: "Tips Agar Pengajuan Pinjaman Cepat Disetujui",
    href: "#",
    category: "artikel",
    tags: ["pinjaman", "approve", "syarat", "bi checking", "tips", "kredit"],
  },

  // --- Investment --------------------------------------------------------
  {
    id: "mulai-reksa-dana",
    title: "Cara Mulai Investasi Reksa Dana di myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["reksa dana", "investasi", "pemula", "mulai", "beli", "mybca"],
    weight: 7,
  },
  {
    id: "beli-obligasi",
    title: "Cara Beli Obligasi Negara Ritel di BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["obligasi", "ori", "sukuk", "sbn", "investasi", "pemesanan"],
  },
  {
    id: "welma-jadi-investasi",
    title: "Perubahan Nama Fitur Welma Menjadi Fitur Investasi di myBCA",
    href: "#",
    category: "artikel",
    tags: ["welma", "investasi", "mybca", "perubahan", "fitur"],
  },
  {
    id: "reksa-dana-usd",
    title: "Batavia USD Money Market, Reksa Dana Pasar Uang USD di BCA",
    href: "#",
    category: "artikel",
    tags: ["reksa dana", "usd", "dollar", "pasar uang", "investasi", "valas"],
  },
  {
    id: "reksa-dana-syariah",
    title: "BNP Paribas Titan, Reksa Dana Saham Syariah Baru di BCA",
    href: "#",
    category: "artikel",
    tags: ["reksa dana", "syariah", "saham", "offshore", "investasi", "halal"],
  },
  {
    id: "sr021",
    title: "Masa Depan Lebih Sejahtera dengan SR021 di BCA",
    href: "#",
    category: "artikel",
    tags: ["sukuk", "sr021", "obligasi", "investasi", "negara", "syariah"],
  },
  {
    id: "deposito-vs-reksadana",
    title: "Deposito atau Reksa Dana? Ini Bedanya",
    href: "#",
    category: "artikel",
    tags: ["deposito", "reksa dana", "bandingkan", "investasi", "risiko", "bunga"],
  },

  // --- Everyday how-tos --------------------------------------------------
  {
    id: "cara-transfer-luar-negeri",
    title: "Cara Transfer ke Luar Negeri lewat BCA",
    href: "#",
    category: "artikel",
    tags: ["transfer", "luar negeri", "remittance", "valas", "swift", "kirim uang"],
    weight: 6,
  },
  {
    id: "tarik-tunai-tanpa-kartu",
    title: "Cara Tarik Tunai Tanpa Kartu di ATM BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["tarik tunai", "cardless", "tanpa kartu", "atm", "lupa kartu", "hp"],
    weight: 6,
  },
  {
    id: "setor-tunai-atm",
    title: "Cara Setor Tunai di ATM Setor Tarik BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["setor tunai", "atm", "deposit", "uang tunai", "cash"],
  },
  {
    id: "bayar-tiket-whoosh",
    title: "Cara Bayar Tiket Kereta Whoosh Melalui Channel BCA",
    href: "#",
    category: "artikel",
    tags: ["kereta", "whoosh", "tiket", "transportasi", "pembayaran", "travel"],
  },
  {
    id: "top-up-flazz",
    title: "Cara Top Up Saldo Flazz BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["flazz", "top up", "isi ulang", "saldo", "e-money", "tol"],
  },
  {
    id: "bayar-tagihan-mybca",
    title: "Bayar Listrik, Pulsa, dan BPJS di myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["tagihan", "listrik", "pulsa", "bpjs", "pembayaran", "pln"],
    weight: 6,
  },
  {
    id: "qris-pembayaran",
    title: "Cara Bayar dengan QRIS di BCA mobile",
    href: "#",
    category: "produk-layanan",
    tags: ["qris", "qr", "scan", "bayar", "merchant", "barcode"],
  },
  {
    id: "cek-mutasi",
    title: "Cara Cek Mutasi Rekening di myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["mutasi", "riwayat", "e-statement", "transaksi", "rekening koran", "history"],
  },
  {
    id: "kurs-hari-ini",
    title: "Kurs Dollar Hari Ini dan Kalkulator Kurs BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["kurs", "dollar", "usd", "valas", "kalkulator", "tukar uang", "hari ini"],
    weight: 8,
  },
  {
    id: "perbedaan-kurs",
    title: "Perbedaan Kurs e-Rate, TT Counter, dan Bank Notes",
    href: "#",
    category: "artikel",
    tags: ["kurs", "e-rate", "tt counter", "bank notes", "valas", "beda"],
  },
  {
    id: "liburan-luar-negeri",
    title: "Liburan Nyaman dan Aman di Luar Negeri Pakai BCA",
    href: "#",
    category: "artikel",
    tags: ["liburan", "travel", "luar negeri", "kartu", "valas", "wisata", "tips"],
  },
  {
    id: "lokasi-atm-cabang",
    title: "Cari Lokasi ATM & Cabang BCA Terdekat",
    href: "#",
    category: "produk-layanan",
    tags: ["lokasi", "atm", "cabang", "terdekat", "maps", "alamat", "dimana"],
    weight: 7,
  },
  {
    id: "weekend-banking",
    title: "Daftar Cabang BCA yang Buka di Akhir Pekan",
    href: "#",
    category: "produk-layanan",
    tags: ["weekend", "sabtu", "minggu", "cabang", "jam operasional", "buka"],
  },
  {
    id: "pengkinian-data-cara",
    title: "Cara Pengkinian Data Nasabah BCA",
    href: "#",
    category: "produk-layanan",
    tags: ["update data", "ganti alamat", "ganti nomor hp", "ktp", "data diri"],
  },
  {
    id: "donasi-zakat-mybca",
    title: "Salurkan Zakat dan Donasi lewat myBCA",
    href: "#",
    category: "produk-layanan",
    tags: ["zakat", "donasi", "sedekah", "infak", "ramadan", "ibadah"],
  },

  // --- Security & tips ---------------------------------------------------
  {
    id: "waspada-penipuan",
    title: "Waspada Modus Penipuan Mengatasnamakan BCA",
    href: "#",
    category: "artikel",
    tags: ["penipuan", "fraud", "scam", "phishing", "keamanan", "soceng", "waspada"],
    weight: 7,
  },
  {
    id: "jaga-data-rahasia",
    title: "Jangan Pernah Bagikan PIN, OTP, dan Password",
    href: "#",
    category: "artikel",
    tags: ["otp", "pin", "password", "keamanan", "data rahasia", "penipuan"],
  },
  {
    id: "tips-atur-keuangan",
    title: "Tips Mengatur Keuangan untuk Pemula",
    href: "#",
    category: "artikel",
    tags: ["keuangan", "budgeting", "hemat", "atur uang", "finansial", "pemula", "gaji"],
  },
  {
    id: "dana-darurat",
    title: "Berapa Idealnya Dana Darurat yang Harus Disiapkan?",
    href: "#",
    category: "artikel",
    tags: ["dana darurat", "emergency fund", "tabungan", "keuangan", "perencanaan"],
  },
  {
    id: "nabung-gaji-pertama",
    title: "Cara Mengelola Gaji Pertama Agar Tidak Cepat Habis",
    href: "#",
    category: "artikel",
    tags: ["gaji", "fresh graduate", "keuangan", "nabung", "budgeting", "anak muda"],
  },
  {
    id: "pemeliharaan-layanan",
    title: "Informasi Pemeliharaan Layanan myBCA, BCA mobile, dan KlikBCA",
    href: "#",
    category: "artikel",
    tags: ["maintenance", "gangguan", "pemeliharaan", "layanan", "jadwal", "error"],
  },

  // --- Promos ------------------------------------------------------------
  {
    id: "promo-kartu-kredit",
    title: "Promo Kartu Kredit BCA Bulan Ini",
    href: "#",
    category: "promo",
    tags: ["promo", "diskon", "kartu kredit", "penawaran", "terbaru"],
    weight: 8,
  },
  {
    id: "promo-cicilan-nol",
    title: "Cicilan BCA 0% hingga 12 Bulan di Merchant Pilihan",
    href: "#",
    category: "promo",
    tags: ["cicilan 0", "installment", "kartu kredit", "merchant", "bunga nol"],
    weight: 7,
  },
  {
    id: "diskon-debit",
    title: "Diskon Belanja dengan Kartu Debit BCA",
    href: "#",
    category: "promo",
    tags: ["diskon", "debit", "belanja", "paspor bca", "potongan"],
  },
  {
    id: "voucher-buka-tabungan",
    title: "Buka Tabungan, Dapat Voucher Belanja hingga Rp100 Ribu",
    href: "#",
    category: "promo",
    tags: ["buka rekening", "voucher", "hadiah", "tabungan", "belanja", "gratis"],
  },
  {
    id: "promo-kuliner",
    title: "Promo Kuliner: Diskon hingga 50% di Resto Pilihan",
    href: "#",
    category: "promo",
    tags: ["makan", "kuliner", "restoran", "diskon", "food", "dining", "cafe"],
    weight: 6,
  },
  {
    id: "promo-travel-fair",
    title: "Travel Fair BCA: Cashback hingga Rp1 Juta",
    href: "#",
    category: "promo",
    tags: ["travel", "liburan", "tiket", "pesawat", "cashback", "wisata", "hotel"],
    weight: 6,
  },
  {
    id: "promo-hotel",
    title: "Diskon Menginap hingga 30% di Hotel & Resort Pilihan",
    href: "#",
    category: "promo",
    tags: ["hotel", "resort", "staycation", "liburan", "menginap", "travel"],
  },
  {
    id: "promo-elektronik",
    title: "Diskon Elektronik hingga Rp3 Juta di Electronic City",
    href: "#",
    category: "promo",
    tags: ["elektronik", "gadget", "diskon", "electronic city", "belanja", "cicilan"],
  },
  {
    id: "promo-groceries",
    title: "Promo Belanja Groceries di Supermarket Pilihan",
    href: "#",
    category: "promo",
    tags: ["groceries", "supermarket", "belanja", "sembako", "diskon", "bulanan"],
  },
  {
    id: "promo-fashion",
    title: "Potongan Belanja Fashion & Beauty di Merchant Pilihan",
    href: "#",
    category: "promo",
    tags: ["fashion", "beauty", "baju", "sepatu", "kecantikan", "diskon", "belanja"],
  },
  {
    id: "promo-grab",
    title: "Potongan hingga Rp50 Ribu di Grab dengan Kartu Kredit BCA",
    href: "#",
    category: "promo",
    tags: ["grab", "transportasi", "ojek", "diskon", "ride hailing", "gojek"],
  },
  {
    id: "promo-gaming",
    title: "Diskon Top Up Game hingga Rp1 Juta",
    href: "#",
    category: "promo",
    tags: ["game", "gaming", "top up", "voucher game", "esports", "diskon"],
  },
  {
    id: "promo-kkb",
    title: "Promo KKB BCA: Bunga 3% flat p.a. Tenor hingga 3 Tahun",
    href: "#",
    category: "promo",
    tags: ["kkb", "mobil", "bunga", "kendaraan", "kredit", "promo"],
  },
  {
    id: "promo-instant-cash",
    title: "BCA Instant Cash: Bunga Spesial 0,75%",
    href: "#",
    category: "promo",
    tags: ["instant cash", "dana tunai", "pinjaman", "kartu kredit", "bunga"],
  },
  {
    id: "promo-wealth-summit",
    title: "Wealth Summit BCA: Penawaran Spesial Produk Investasi",
    href: "#",
    category: "promo",
    tags: ["investasi", "wealth", "event", "reksa dana", "obligasi", "seminar"],
  },
];

/* ---------------------------------------------------------------------------
 * Programs — image-led campaigns (concerts, events) rendered as cards, same
 * shape as products. Distinct from a plain `InfoRec` promo (a badge + one
 * line of text) because a campaign like a concert presale reads much better
 * with the event's own key art than a generic category icon.
 *
 * Rendered as their own "Program Terkait" section, only when this group's
 * best match outscores products/information — see `getSearchRecommendations`.
 * ------------------------------------------------------------------------- */

export type ProgramRec = Searchable & {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Path under /public — e.g. "/assets/program/the-weeknd-presale.webp". */
  image: string;
};

// Artist/event names here so a query like "The Weeknd" or "Coldplay" surfaces
// the ticket presale and 0% installment campaign instead of only generic
// products — this is what someone typing an artist name is actually after.
const PROGRAMS: ProgramRec[] = [
  {
    id: "promo-konser-presale",
    title: "Presale Tiket Konser Khusus Kartu Kredit BCA",
    description: "Beli tiket lebih dulu sebelum public sale dengan Kartu Kredit BCA",
    href: "#",
    // Reuses the "After Hours Til Dawn Tour - The Weeknd" banner already
    // shipped for EventSlider (src/components/home/EventSlider.tsx) — same
    // real campaign, so no new asset needed here.
    image: "/assets/promo/event-banner-2.webp",
    tags: [
      "konser", "presale", "tiket", "the weeknd", "coldplay", "konser musik",
      "tiket konser", "musisi", "artis", "tour", "concert",
    ],
    weight: 9,
  },
  {
    id: "promo-cicilan-tiket-konser",
    title: "Cicilan 0% Tiket Konser dengan Kartu Kredit BCA",
    description: "Ubah pembelian tiket konser jadi cicilan ringan tanpa bunga",
    href: "#",
    image: "/assets/promo/event-banner-1.webp",
    tags: [
      "konser", "cicilan 0", "tiket", "installment", "the weeknd", "coldplay",
      "tiket konser", "event", "hiburan",
    ],
    weight: 8,
  },
  {
    id: "promo-live-in-concert",
    title: "BCA Live in Concert: Beli Tiket Lebih Dulu Pakai myBCA",
    description: "Akses prioritas tiket konser pilihan langsung dari myBCA",
    href: "#",
    image: "/assets/promo/event-banner-3.webp",
    tags: ["konser", "live in concert", "tiket", "myBCA", "event musik", "hiburan"],
  },
];
const MAX_PRODUCTS = 3;
const MAX_PROGRAM = 3;
const MAX_INFORMATION = 4;

const DEFAULT_SECTION_ORDER: SearchSectionKey[] = ["products", "information", "program"];

function byWeight<T extends { weight?: number }>(a: T, b: T): number {
  return (b.weight ?? 0) - (a.weight ?? 0);
}

/**
 * Returns the products + information + program cards to show in the
 * search-recommendation dropdown for a given keyword. Empty/whitespace
 * keyword returns a popular default set (so the dropdown is useful the
 * moment the field is focused).
 *
 * Ranking, synonym expansion and typo tolerance live in search-engine.ts.
 * This is the swap point for a real backend later — see the file header.
 */
export function getSearchRecommendations(keyword: string): SearchRecommendations {
  const q = keyword.trim();

  if (!q) {
    // Default set is ordered by `weight` so the empty state leads with the
    // products people actually open, not whatever sits first in the array.
    // Program cards don't have a generic "default" — they only show up when
    // a query actually matches one, so the empty state skips them.
    return {
      products: [...PRODUCTS].sort(byWeight).slice(0, MAX_PRODUCTS),
      information: [...INFORMATION].sort(byWeight).slice(0, MAX_INFORMATION),
      program: [],
      order: DEFAULT_SECTION_ORDER,
    };
  }

  const productsScored = rankBySearchScored(PRODUCTS, q, MAX_PRODUCTS);
  const informationScored = rankBySearchScored(INFORMATION, q, MAX_INFORMATION);
  const programScored = rankBySearchScored(PROGRAMS, q, MAX_PROGRAM);

  // Whichever group's best match is strongest leads the dropdown — this is
  // what lets a campaign-shaped query (an artist name, an event) surface
  // "Program Terkait" above "Produk Terkait" instead of never appearing.
  const topScore = (scored: { score: number }[]) => scored[0]?.score ?? -1;
  const order = (["products", "information", "program"] as SearchSectionKey[])
    .map((key, index) => ({
      key,
      index,
      top:
        key === "products" ? topScore(productsScored) : key === "information" ? topScore(informationScored) : topScore(programScored),
    }))
    .sort((a, b) => b.top - a.top || a.index - b.index)
    .map((entry) => entry.key);

  return {
    products: productsScored.map((entry) => entry.item),
    information: informationScored.map((entry) => entry.item),
    program: programScored.map((entry) => entry.item),
    order,
  };
}

/** Deep-link to BCA's real search-result page for the "see all results" action. */
export function bcaSearchResultUrl(keyword: string): string {
  return `https://www.bca.co.id/id/search-result?keyword=${encodeURIComponent(keyword.trim())}`;
}

/* ---------------------------------------------------------------------------
 * Empty state (field focused, nothing typed yet). Distinct from the results
 * state: it guides the user instead of showing filtered products/info.
 * ------------------------------------------------------------------------- */

/**
 * Trending keyword chips. Clicking one fills the field and runs the search
 * against `keyword` — the label shown is translated
 * (`t(\`popular.${id}\`)` in SearchRecommendation), but `keyword` is matched
 * against the Indonesian-only corpus below and must stay Indonesian in every
 * locale or the chip would return nothing on `/en` and `/zh`.
 */
export type PopularSearch = { id: string; keyword: string };

export const POPULAR_SEARCHES: PopularSearch[] = [
  { id: "openAccount", keyword: "Buka Rekening" },
  { id: "exchangeRate", keyword: "Kurs Hari Ini" },
  { id: "creditCardPromo", keyword: "Promo Kartu Kredit" },
  { id: "mortgage", keyword: "KPR BCA" },
  { id: "activateMybca", keyword: "Aktivasi myBCA" },
  { id: "atmLocation", keyword: "Lokasi ATM" },
];

/** Guided entry points — richer than a bare chip, but capped at 4 to stay light. */
export type PopularTopic = { id: string; keyword: string; icon: ProductIcon };

export const POPULAR_TOPICS: PopularTopic[] = [
  { id: "topic-rekening", keyword: "rekening", icon: "wallet" },
  { id: "topic-kartu", keyword: "kartu", icon: "card" },
  { id: "topic-kredit", keyword: "kpr", icon: "house" },
  { id: "topic-investasi", keyword: "investasi", icon: "chart" },
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
