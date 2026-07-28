export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  key: string;
  label: string;
  items: FaqItem[];
};

// Content is Indonesian-only, matching the Figma card copy — same convention
// as news-data.ts, where article content isn't translated per locale.
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: "keamanan",
    label: "Keamanan",
    items: [
      {
        question: "Bagaimana cara mengenali penipuan yang mengatasnamakan BCA?",
        answer:
          "BCA tidak pernah meminta PIN, password, OTP, atau kode akses lain melalui telepon, SMS, email, atau chat pribadi. Waspadai tautan mencurigakan, permintaan transfer mendesak, atau akun yang mengaku sebagai petugas bank.",
      },
      {
        question: "Apa yang harus dilakukan jika menerima OTP yang tidak diminta?",
        answer:
          "Jangan bagikan kode OTP kepada siapa pun, termasuk pihak yang mengaku dari BCA. Segera hubungi Halo BCA di 1500888 jika Anda menerima OTP tanpa melakukan transaksi.",
      },
      {
        question: "Bagaimana cara melaporkan dugaan penipuan atau akun palsu?",
        answer:
          "Laporkan melalui Halo BCA di 1500888, email halobca@bca.co.id, atau fitur pelaporan di aplikasi myBCA. Sertakan bukti tangkapan layar dan nomor kontak pelaku jika tersedia.",
      },
      {
        question: "Apakah tautan yang dikirim lewat WhatsApp atau SMS dari BCA aman diklik?",
        answer:
          "Selalu periksa ulang pengirimnya. BCA hanya mengarahkan ke domain resmi bca.co.id. Jika ragu, jangan klik tautan tersebut dan buka aplikasi atau situs BCA secara langsung.",
      },
      {
        question: "Bagaimana cara mengamankan akun myBCA dan KlikBCA?",
        answer:
          "Gunakan PIN atau password yang unik, aktifkan notifikasi transaksi, jangan gunakan Wi-Fi publik untuk transaksi finansial, dan segera blokir akses jika perangkat Anda hilang.",
      },
    ],
  },
  {
    key: "layanan-kontak",
    label: "Layanan & Kontak",
    items: [
      {
        question: "Apa saja aplikasi dan platform resmi BCA?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et quam mattis, posuere dolor quis, laoreet dolor. Pellentesque sit amet commodo sapien, sit amet euismod tellus. Proin ac est nec massa commodo tristique.",
      },
      {
        question: "Bagaimana cara menghubungi Halo BCA?",
        answer:
          "Telepon 1500888 (24 jam, tanpa kode area), live chat di website bca.co.id, email halobca@bca.co.id, atau melalui fitur chat di myBCA. Untuk keperluan mendesak seperti kehilangan kartu, gunakan telepon agar lebih cepat.",
      },
      {
        question: "Jam operasional cabang BCA dan Halo BCA?",
        answer:
          "Cabang BCA umumnya buka Senin–Jumat pukul 08.00–15.00 waktu setempat, dengan jam yang dapat berbeda tiap cabang. Halo BCA melalui telepon melayani selama 24 jam setiap hari.",
      },
      {
        question: "Apa bedanya myBCA, KlikBCA, dan BCA mobile?",
        answer:
          "myBCA adalah aplikasi terbaru yang menggabungkan layanan mobile dan internet banking dalam satu platform. KlikBCA adalah internet banking berbasis web, sementara BCA mobile berangsur digantikan fungsinya oleh myBCA.",
      },
      {
        question: "Layanan BCA apa saja yang tersedia 24 jam?",
        answer:
          "ATM BCA, Halo BCA melalui telepon, myBCA, dan KlikBCA dapat diakses 24 jam setiap hari untuk transaksi seperti transfer, cek saldo, dan pembayaran.",
      },
    ],
  },
  {
    key: "transaksi",
    label: "Transaksi",
    items: [
      {
        question: "Mengapa transaksi transfer saya gagal atau tertunda?",
        answer:
          "Transaksi bisa gagal karena saldo tidak mencukupi, limit harian terlampaui, gangguan jaringan, atau data penerima tidak sesuai. Jika saldo sudah terpotong namun transfer gagal, dana akan otomatis dikembalikan dalam beberapa hari kerja.",
      },
      {
        question: "Berapa limit transfer harian di myBCA dan KlikBCA?",
        answer:
          "Limit transfer bergantung pada jenis kartu dan pengaturan akun Anda, dan dapat disesuaikan melalui myBCA. Untuk rincian limit terbaru, periksa menu pengaturan limit di aplikasi atau hubungi Halo BCA.",
      },
      {
        question: "Bagaimana cara melakukan pengecekan mutasi rekening?",
        answer:
          "Mutasi rekening dapat dicek langsung melalui aplikasi myBCA atau KlikBCA pada menu riwayat transaksi, tanpa perlu ke cabang.",
      },
      {
        question: "Apa yang harus dilakukan jika salah transfer ke rekening lain?",
        answer:
          "Segera hubungi Halo BCA di 1500888 dengan menyertakan bukti transaksi. Tim BCA akan membantu proses penelusuran dan permintaan pengembalian dana ke penerima yang salah.",
      },
      {
        question: "Apakah ada biaya untuk transfer antarbank?",
        answer:
          "Biaya transfer antarbank bervariasi tergantung metode yang digunakan, seperti transfer online biasa atau BI-FAST. Rincian biaya dapat dilihat langsung saat proses transaksi di myBCA atau KlikBCA.",
      },
    ],
  },
];
