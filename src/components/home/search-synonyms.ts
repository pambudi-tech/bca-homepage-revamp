// Concept graph for the search engine — the part that makes search feel less
// like `String.includes()`.
//
// WHY THIS EXISTS: users don't type product names, they type intentions. Someone
// looking for KPR types "rumah"; someone looking for Tahapan types "nabung";
// someone looking for reksa dana types "cuan". None of those words appear in the
// product titles, so a literal substring match returns nothing and the dropdown
// looks broken.
//
// HOW IT WORKS: every cluster below is a set of terms that mean roughly the same
// thing *in a banking context*. Typing any term in a cluster also searches for
// every other term in it. Clusters are undirected and transitive-free — "rumah"
// pulls in "kpr" and "properti", but not whatever else "kpr" happens to sit
// beside in another cluster. That keeps expansion predictable instead of
// snowballing into "everything matches everything".
//
// Related-term hits always score BELOW literal hits (see search-engine.ts), so
// adding a synonym can never push a worse result above an exact title match.
//
// TO EXTEND: add a term to an existing cluster, or append a new cluster. No
// other file needs to change.

/** Terms that are interchangeable intents. Order within a cluster is irrelevant. */
export const CONCEPT_CLUSTERS: string[][] = [
  // --- Saving ------------------------------------------------------------
  [
    "nabung", "menabung", "tabungan", "simpanan", "saving", "savings",
    "celengan", "setoran", "menyimpan", "sisihkan",
  ],
  [
    "rekening", "account", "buka rekening", "bikin rekening", "buat rekening",
    "pembukaan rekening", "rekening baru", "daftar", "registrasi", "nomor rekening",
  ],
  ["tahapan", "tabungan bca", "paspor", "paspor bca"],
  ["deposito", "bunga tinggi", "jangka waktu", "tenor", "bilyet"],

  // --- Borrowing ---------------------------------------------------------
  [
    "pinjam", "pinjaman", "meminjam", "kredit", "utang", "hutang", "loan",
    "dana tunai", "butuh dana", "modal", "pembiayaan", "cicil", "cicilan",
    "angsuran", "kta", "tanpa agunan",
  ],
  [
    "rumah", "properti", "hunian", "kpr", "mortgage", "apartemen", "tempat tinggal",
    "beli rumah", "renovasi", "griya", "developer", "take over", "refinancing",
  ],
  [
    "mobil", "motor", "kendaraan", "kkb", "ksm", "otomotif", "car", "roda dua",
    "roda empat", "sepeda motor", "mobil bekas", "mobil baru", "kredit kendaraan",
  ],

  // --- Cards & payments --------------------------------------------------
  [
    "kartu", "card", "kartu kredit", "credit card", "cc", "kartu debit",
    "debit", "visa", "mastercard", "gpn",
  ],
  [
    "bayar", "pembayaran", "membayar", "tagihan", "billing", "payment",
    "transaksi", "belanja", "checkout", "top up", "isi ulang", "autodebet",
  ],
  [
    "transfer", "kirim uang", "mengirim uang", "tf", "pindah buku",
    "antar bank", "bi fast", "virtual account",
  ],
  [
    "qris", "qr", "scan", "barcode", "scan qr", "tap", "contactless", "nfc",
  ],
  [
    "paylater", "pay later", "bayar nanti", "bnpl", "buy now pay later",
    "talangan", "limit",
  ],
  [
    "uang elektronik", "e-money", "emoney", "e-wallet", "ewallet", "dompet digital",
    "flazz", "sakuku", "saldo", "tol", "transjakarta", "commuter",
  ],
  ["tarik tunai", "setor tunai", "cash", "tunai", "cardless", "tanpa kartu"],

  // --- Investment & insurance -------------------------------------------
  [
    "investasi", "invest", "berinvestasi", "reksa dana", "reksadana", "obligasi",
    "saham", "sukuk", "ori", "sbn", "surat berharga", "portofolio", "wealth",
    "cuan", "imbal hasil", "return", "yield", "bunga",
  ],
  [
    "asuransi", "proteksi", "perlindungan", "insurance", "premi", "klaim",
    "polis", "jaminan", "santunan",
  ],
  ["kesehatan", "sakit", "rawat inap", "rumah sakit", "medical", "penyakit kritis"],
  ["jiwa", "meninggal", "ahli waris", "warisan", "life"],
  ["pensiun", "hari tua", "retirement", "masa depan", "anuitas"],
  ["pendidikan", "sekolah", "kuliah", "biaya kuliah", "education", "anak"],

  // --- Foreign currency --------------------------------------------------
  [
    "kurs", "valas", "valuta asing", "dollar", "dolar", "usd", "mata uang",
    "exchange", "forex", "tukar uang", "money changer", "e-rate", "erate",
    "sgd", "eur", "jpy", "aud",
  ],
  [
    "luar negeri", "remittance", "kiriman uang", "transfer internasional",
    "overseas", "abroad", "tki", "pekerja migran",
  ],

  // --- Digital channels --------------------------------------------------
  [
    "aplikasi", "apps", "app", "mobile banking", "m-banking", "mbanking",
    "internet banking", "online", "digital", "hp", "handphone", "smartphone",
    "download", "install", "unduh",
  ],
  ["mybca", "my bca", "my-bca"],
  ["bca mobile", "m-bca", "mbca", "bca mobil"],
  ["klikbca", "klik bca"],
  ["oneklik", "one klik", "satu klik"],
  ["keybca", "key bca", "token", "otp", "kode akses", "pin", "password"],

  // --- Help & locations --------------------------------------------------
  [
    "bantuan", "help", "cs", "customer service", "kontak", "hubungi",
    "call center", "komplain", "keluhan", "lapor", "halo bca", "halobca",
    "1500888", "chat", "whatsapp", "wa", "vira",
  ],
  [
    "lokasi", "cabang", "kantor cabang", "atm", "terdekat", "alamat", "maps",
    "dimana", "jaringan", "weekend banking",
  ],

  // --- Lifestyle (drives promo matching) ---------------------------------
  [
    "promo", "diskon", "discount", "cashback", "potongan", "penawaran",
    "voucher", "deal", "hemat", "murah", "gratis", "reward", "poin",
  ],
  [
    "travel", "liburan", "jalan-jalan", "wisata", "tiket", "pesawat", "hotel",
    "holiday", "vacation", "penerbangan", "airlines", "resort", "staycation",
  ],
  [
    "makan", "kuliner", "restoran", "resto", "cafe", "kopi", "food", "fnb",
    "dining", "minuman", "jajan",
  ],
  [
    "belanja", "shopping", "e-commerce", "ecommerce", "marketplace",
    "online shop", "retail", "supermarket", "groceries", "sembako",
  ],
  ["elektronik", "gadget", "hp baru", "laptop", "smartphone", "electronic"],
  ["fashion", "baju", "sepatu", "tas", "outfit", "beauty", "kecantikan", "salon"],
  ["game", "gaming", "voucher game", "top up game", "esports"],

  // --- Life stage / segment ---------------------------------------------
  [
    "pelajar", "mahasiswa", "muda", "anak muda", "milenial", "remaja",
    "student", "gen z", "simuda", "xpresi",
  ],
  ["prioritas", "premium", "eksklusif", "priority", "nasabah utama", "solitaire"],
  ["bisnis", "usaha", "umkm", "merchant", "toko", "wirausaha", "edc", "dagang"],
  ["gaji", "payroll", "penghasilan", "income", "salary", "thr", "bonus"],
  ["zakat", "donasi", "sedekah", "infak", "wakaf", "amal", "haji", "umrah", "ibadah"],
];

/**
 * Product-name aliases. Directional on purpose: typing the alias should find the
 * product, but the product's own name shouldn't drag in the alias's other
 * meanings. Keys and values are matched after normalization.
 */
export const TERM_ALIASES: Record<string, string[]> = {
  atm: ["anjungan tunai mandiri", "mesin atm", "tarik tunai"],
  kpr: ["kredit pemilikan rumah"],
  kkb: ["kredit kendaraan bermotor"],
  ksm: ["kredit sepeda motor"],
  kta: ["kredit tanpa agunan", "pinjaman personal", "personal loan"],
  rdn: ["rekening dana nasabah"],
  rdl: ["rekening dana lender"],
  sbdk: ["suku bunga dasar kredit"],
  qris: ["quick response code indonesian standard"],
  edc: ["mesin edc", "electronic data capture"],
  bpih: ["biaya penyelenggaraan ibadah haji"],
};

/**
 * Words carrying no signal here — every record is a BCA record, and question
 * scaffolding ("bagaimana cara ...") shouldn't count as an unmatched term.
 * Stripped before scoring; a query made entirely of these falls back to the
 * popular/default set.
 */
export const STOPWORDS = new Set([
  "bca", "di", "ke", "dari", "yang", "untuk", "dan", "atau", "dengan", "pada",
  "adalah", "apa", "apakah", "itu", "ini", "saya", "aku", "kamu", "nya", "kah",
  "bagaimana", "gimana", "gmn", "mau", "ingin", "pengen", "tolong", "the", "a",
]);

/* ---------------------------------------------------------------------------
 * Lookup index — built once at module load.
 * ------------------------------------------------------------------------- */

function buildRelatedIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  const link = (from: string, to: string) => {
    if (from === to) return;
    let set = index.get(from);
    if (!set) {
      set = new Set<string>();
      index.set(from, set);
    }
    set.add(to);
  };

  for (const cluster of CONCEPT_CLUSTERS) {
    for (const term of cluster) {
      for (const other of cluster) link(term, other);
    }
  }

  // Aliases resolve one way: alias → canonical term.
  for (const [canonical, aliases] of Object.entries(TERM_ALIASES)) {
    for (const alias of aliases) link(alias, canonical);
  }

  return index;
}

const RELATED_INDEX = buildRelatedIndex();

/** Every term related to `term`, excluding `term` itself. Empty if unknown. */
export function relatedTerms(term: string): string[] {
  const set = RELATED_INDEX.get(term);
  return set ? [...set] : [];
}

/** Multi-word concept terms, longest first — used to spot phrases in a query. */
export const MULTIWORD_TERMS: string[] = [...RELATED_INDEX.keys()]
  .filter((t) => t.includes(" "))
  .sort((a, b) => b.length - a.length);
