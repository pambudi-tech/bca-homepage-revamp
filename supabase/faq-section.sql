-- FAQ section — schema + seed + EN/ZH translations.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).

-- ---------------------------------------------------------------- tabel ----

-- Kategori = tab di section: Keamanan, Layanan & Kontak, Transaksi.
create table if not exists public.faq_categories (
  -- key berupa slug (bukan identity) supaya gampang dirujuk manual dan tidak
  -- berubah kalau barisnya dihapus lalu dibuat lagi.
  key        text primary key,
  label      text    not null,
  sort_order int     not null default 0,
  is_active  boolean not null default true,
  label_en   text,
  label_zh   text
);

create table if not exists public.faq_items (
  id            bigint generated always as identity primary key,
  category_key  text not null references public.faq_categories(key) on delete cascade,
  question      text not null,
  answer        text not null,
  sort_order    int     not null default 0,
  is_active     boolean not null default true,
  question_en   text,
  question_zh   text,
  answer_en     text,
  answer_zh     text
);

create index if not exists faq_items_category_idx
  on public.faq_items (category_key, sort_order);

-- ------------------------------------------------------------------ RLS ----
-- Homepage membaca lewat anon key, jadi baris aktif harus bisa dibaca publik.
-- Tidak ada policy insert/update/delete: perubahan hanya lewat dashboard
-- (service role), tidak pernah dari browser.

alter table public.faq_categories enable row level security;
alter table public.faq_items      enable row level security;

drop policy if exists "public read active faq categories" on public.faq_categories;
create policy "public read active faq categories"
  on public.faq_categories for select to anon, authenticated
  using (is_active);

drop policy if exists "public read active faq items" on public.faq_items;
create policy "public read active faq items"
  on public.faq_items for select to anon, authenticated
  using (is_active);

-- ----------------------------------------------------------------- seed ----
-- Isi yang sama dengan FAQ_CATEGORIES di faq-data.ts. Setelah ini pertanyaan
-- ditambah/diedit lewat Table Editor.

insert into public.faq_categories (key, label, sort_order) values
  ('keamanan',        'Keamanan',        1),
  ('layanan-kontak',  'Layanan & Kontak', 2),
  ('transaksi',       'Transaksi',        3)
on conflict (key) do update
  set label      = excluded.label,
      sort_order = excluded.sort_order;

-- Dicocokkan lewat (category_key, question) supaya aman dijalankan ulang
-- tanpa perlu tahu id barisnya.
insert into public.faq_items (category_key, question, answer, sort_order)
values
  -- Keamanan
  ('keamanan', 'Bagaimana cara mengenali penipuan yang mengatasnamakan BCA?',
   'BCA tidak pernah meminta PIN, password, OTP, atau kode akses lain melalui telepon, SMS, email, atau chat pribadi. Waspadai tautan mencurigakan, permintaan transfer mendesak, atau akun yang mengaku sebagai petugas bank.', 1),
  ('keamanan', 'Apa yang harus dilakukan jika menerima OTP yang tidak diminta?',
   'Jangan bagikan kode OTP kepada siapa pun, termasuk pihak yang mengaku dari BCA. Segera hubungi Halo BCA di 1500888 jika Anda menerima OTP tanpa melakukan transaksi.', 2),
  ('keamanan', 'Bagaimana cara melaporkan dugaan penipuan atau akun palsu?',
   'Laporkan melalui Halo BCA di 1500888, email halobca@bca.co.id, atau fitur pelaporan di aplikasi myBCA. Sertakan bukti tangkapan layar dan nomor kontak pelaku jika tersedia.', 3),
  ('keamanan', 'Apakah tautan yang dikirim lewat WhatsApp atau SMS dari BCA aman diklik?',
   'Selalu periksa ulang pengirimnya. BCA hanya mengarahkan ke domain resmi bca.co.id. Jika ragu, jangan klik tautan tersebut dan buka aplikasi atau situs BCA secara langsung.', 4),
  ('keamanan', 'Bagaimana cara mengamankan akun myBCA dan KlikBCA?',
   'Gunakan PIN atau password yang unik, aktifkan notifikasi transaksi, jangan gunakan Wi-Fi publik untuk transaksi finansial, dan segera blokir akses jika perangkat Anda hilang.', 5),

  -- Layanan & Kontak
  ('layanan-kontak', 'Apa saja aplikasi dan platform resmi BCA?',
   'Platform resmi BCA meliputi aplikasi myBCA dan BCA mobile, internet banking KlikBCA, website bca.co.id, serta akun media sosial dan Halo BCA yang terverifikasi. Selalu pastikan mengunduh aplikasi dari App Store atau Google Play resmi dan mengakses situs melalui domain bca.co.id.', 1),
  ('layanan-kontak', 'Bagaimana cara menghubungi Halo BCA?',
   'Telepon 1500888 (24 jam, tanpa kode area), live chat di website bca.co.id, email halobca@bca.co.id, atau melalui fitur chat di myBCA. Untuk keperluan mendesak seperti kehilangan kartu, gunakan telepon agar lebih cepat.', 2),
  ('layanan-kontak', 'Jam operasional cabang BCA dan Halo BCA?',
   'Cabang BCA umumnya buka Senin–Jumat pukul 08.00–15.00 waktu setempat, dengan jam yang dapat berbeda tiap cabang. Halo BCA melalui telepon melayani selama 24 jam setiap hari.', 3),
  ('layanan-kontak', 'Apa bedanya myBCA, KlikBCA, dan BCA mobile?',
   'myBCA adalah aplikasi terbaru yang menggabungkan layanan mobile dan internet banking dalam satu platform. KlikBCA adalah internet banking berbasis web, sementara BCA mobile berangsur digantikan fungsinya oleh myBCA.', 4),
  ('layanan-kontak', 'Layanan BCA apa saja yang tersedia 24 jam?',
   'ATM BCA, Halo BCA melalui telepon, myBCA, dan KlikBCA dapat diakses 24 jam setiap hari untuk transaksi seperti transfer, cek saldo, dan pembayaran.', 5),

  -- Transaksi
  ('transaksi', 'Mengapa transaksi transfer saya gagal atau tertunda?',
   'Transaksi bisa gagal karena saldo tidak mencukupi, limit harian terlampaui, gangguan jaringan, atau data penerima tidak sesuai. Jika saldo sudah terpotong namun transfer gagal, dana akan otomatis dikembalikan dalam beberapa hari kerja.', 1),
  ('transaksi', 'Berapa limit transfer harian di myBCA dan KlikBCA?',
   'Limit transfer bergantung pada jenis kartu dan pengaturan akun Anda, dan dapat disesuaikan melalui myBCA. Untuk rincian limit terbaru, periksa menu pengaturan limit di aplikasi atau hubungi Halo BCA.', 2),
  ('transaksi', 'Bagaimana cara melakukan pengecekan mutasi rekening?',
   'Mutasi rekening dapat dicek langsung melalui aplikasi myBCA atau KlikBCA pada menu riwayat transaksi, tanpa perlu ke cabang.', 3),
  ('transaksi', 'Apa yang harus dilakukan jika salah transfer ke rekening lain?',
   'Segera hubungi Halo BCA di 1500888 dengan menyertakan bukti transaksi. Tim BCA akan membantu proses penelusuran dan permintaan pengembalian dana ke penerima yang salah.', 4),
  ('transaksi', 'Apakah ada biaya untuk transfer antarbank?',
   'Biaya transfer antarbank bervariasi tergantung metode yang digunakan, seperti transfer online biasa atau BI-FAST. Rincian biaya dapat dilihat langsung saat proses transaksi di myBCA atau KlikBCA.', 5)
on conflict do nothing;

-- ------------------------------------------------------------- terjemahan ----
-- Pola sama dengan supabase/product-i18n.sql: kolom asli (label, question,
-- answer) tetap jadi versi Indonesia (default). Kolom `_en`/`_zh` opsional —
-- kalau kosong, src/lib/faq.ts otomatis jatuh balik ke versi Indonesia.

update public.faq_categories c
   set label_en = v.label_en,
       label_zh = v.label_zh
  from (values
    ('keamanan',       'Security',            '安全'),
    ('layanan-kontak', 'Service & Contact',   '服务与联系'),
    ('transaksi',      'Transactions',        '交易')
  ) as v(key, label_en, label_zh)
 where c.key = v.key;

update public.faq_items i
   set question_en = v.question_en,
       question_zh = v.question_zh,
       answer_en   = v.answer_en,
       answer_zh   = v.answer_zh
  from (values
    ('keamanan', 'Bagaimana cara mengenali penipuan yang mengatasnamakan BCA?',
     'How can I recognize fraud impersonating BCA?',
     '如何识别冒充BCA的诈骗行为?',
     'BCA never asks for your PIN, password, OTP, or other access codes by phone, SMS, email, or private chat. Be wary of suspicious links, urgent transfer requests, or accounts claiming to be bank staff.',
     'BCA绝不会通过电话、短信、电子邮件或私人聊天索要您的PIN码、密码、一次性密码(OTP)或其他访问代码。请警惕可疑链接、紧急转账请求,或自称银行工作人员的账户。'),
    ('keamanan', 'Apa yang harus dilakukan jika menerima OTP yang tidak diminta?',
     'What should I do if I receive an unsolicited OTP?',
     '如果收到未经请求的一次性密码(OTP)应该怎么办?',
     'Never share your OTP with anyone, including those claiming to be from BCA. Contact Halo BCA at 1500888 immediately if you receive an OTP without making a transaction.',
     '切勿将OTP告知任何人,包括自称来自BCA的人员。如果您在未进行交易的情况下收到OTP,请立即致电1500888联系Halo BCA。'),
    ('keamanan', 'Bagaimana cara melaporkan dugaan penipuan atau akun palsu?',
     'How do I report suspected fraud or a fake account?',
     '如何举报涉嫌欺诈或虚假账户?',
     'Report it via Halo BCA at 1500888, email halobca@bca.co.id, or the reporting feature in the myBCA app. Include screenshots and the perpetrator''s contact number if available.',
     '请通过1500888致电Halo BCA、发送电子邮件至halobca@bca.co.id,或使用myBCA应用中的举报功能进行举报。如有可能,请附上截图证据和涉事人员的联系方式。'),
    ('keamanan', 'Apakah tautan yang dikirim lewat WhatsApp atau SMS dari BCA aman diklik?',
     'Is it safe to click links sent via WhatsApp or SMS claiming to be from BCA?',
     '通过WhatsApp或短信发送、自称来自BCA的链接点击是否安全?',
     'Always double-check the sender. BCA only directs you to the official bca.co.id domain. If in doubt, do not click the link — open the BCA app or website directly instead.',
     '请务必仔细核实发送者身份。BCA仅会引导您访问官方域名bca.co.id。如有疑虑,请勿点击该链接,应直接打开BCA应用程序或官方网站。'),
    ('keamanan', 'Bagaimana cara mengamankan akun myBCA dan KlikBCA?',
     'How can I keep my myBCA and KlikBCA accounts secure?',
     '如何保护myBCA和KlikBCA账户安全?',
     'Use a unique PIN or password, enable transaction notifications, avoid public Wi-Fi for financial transactions, and block access immediately if your device is lost.',
     '请使用独特的PIN码或密码,启用交易通知,避免在公共Wi-Fi环境下进行金融交易,并在设备丢失时立即锁定账户访问权限。')
  ) as v(category_key, question, question_en, question_zh, answer_en, answer_zh)
 where i.category_key = v.category_key and i.question = v.question;

update public.faq_items i
   set question_en = v.question_en,
       question_zh = v.question_zh,
       answer_en   = v.answer_en,
       answer_zh   = v.answer_zh
  from (values
    ('layanan-kontak', 'Apa saja aplikasi dan platform resmi BCA?',
     'What are BCA''s official apps and platforms?',
     'BCA的官方应用程序和平台有哪些?',
     'BCA''s official platforms include the myBCA and BCA mobile apps, KlikBCA internet banking, the bca.co.id website, and verified social media accounts and Halo BCA. Always download apps from the official App Store or Google Play and access the site only via the bca.co.id domain.',
     'BCA的官方平台包括myBCA和BCA mobile应用程序、KlikBCA网上银行、bca.co.id官方网站,以及经过验证的社交媒体账户和Halo BCA。请务必从官方App Store或Google Play下载应用程序,并仅通过bca.co.id域名访问网站。'),
    ('layanan-kontak', 'Bagaimana cara menghubungi Halo BCA?',
     'How can I contact Halo BCA?',
     '如何联系Halo BCA?',
     'Call 1500888 (24 hours, no area code needed), use live chat on bca.co.id, email halobca@bca.co.id, or use the chat feature in myBCA. For urgent matters like a lost card, calling is fastest.',
     '拨打1500888(全天24小时服务,无需区号)、使用bca.co.id网站的在线聊天功能、发送电子邮件至halobca@bca.co.id,或使用myBCA中的聊天功能。如遇卡片丢失等紧急情况,建议直接致电以获得最快处理。'),
    ('layanan-kontak', 'Jam operasional cabang BCA dan Halo BCA?',
     'What are the operating hours of BCA branches and Halo BCA?',
     'BCA分行及Halo BCA的营业时间是?',
     'BCA branches are generally open Monday–Friday, 08:00–15.00 local time, though hours may vary by branch. Halo BCA phone service is available 24 hours every day.',
     'BCA分行通常在当地时间周一至周五08:00至15:00营业,具体时间可能因分行而异。Halo BCA电话服务全天24小时提供。'),
    ('layanan-kontak', 'Apa bedanya myBCA, KlikBCA, dan BCA mobile?',
     'What is the difference between myBCA, KlikBCA, and BCA mobile?',
     'myBCA、KlikBCA和BCA mobile有什么区别?',
     'myBCA is the newest app, combining mobile and internet banking into a single platform. KlikBCA is web-based internet banking, while BCA mobile is gradually being replaced by myBCA.',
     'myBCA是最新推出的应用程序,将手机银行与网上银行服务整合于同一平台。KlikBCA是基于网页的网上银行服务,而BCA mobile的功能正逐步被myBCA所取代。'),
    ('layanan-kontak', 'Layanan BCA apa saja yang tersedia 24 jam?',
     'Which BCA services are available 24 hours a day?',
     'BCA提供哪些全天24小时服务?',
     'BCA ATMs, Halo BCA by phone, myBCA, and KlikBCA are accessible 24 hours a day for transactions such as transfers, balance checks, and payments.',
     'BCA自动取款机(ATM)、Halo BCA电话服务、myBCA以及KlikBCA均可全天24小时使用,支持转账、余额查询和缴费等各类交易。')
  ) as v(category_key, question, question_en, question_zh, answer_en, answer_zh)
 where i.category_key = v.category_key and i.question = v.question;

update public.faq_items i
   set question_en = v.question_en,
       question_zh = v.question_zh,
       answer_en   = v.answer_en,
       answer_zh   = v.answer_zh
  from (values
    ('transaksi', 'Mengapa transaksi transfer saya gagal atau tertunda?',
     'Why did my transfer fail or get delayed?',
     '为什么我的转账交易失败或延迟?',
     'Transfers can fail due to insufficient balance, exceeding the daily limit, network disruptions, or incorrect recipient details. If your balance was deducted but the transfer failed, the funds will be automatically refunded within a few business days.',
     '转账失败的原因可能包括余额不足、超出每日限额、网络故障或收款人信息有误。如果您的账户已被扣款但转账失败,资金将在几个工作日内自动退回。'),
    ('transaksi', 'Berapa limit transfer harian di myBCA dan KlikBCA?',
     'What is the daily transfer limit on myBCA and KlikBCA?',
     'myBCA和KlikBCA的每日转账限额是多少?',
     'Transfer limits depend on your card type and account settings, and can be adjusted through myBCA. For the latest limit details, check the limit settings menu in the app or contact Halo BCA.',
     '转账限额取决于您的卡类型和账户设置,可通过myBCA进行调整。如需了解最新的限额详情,请在应用程序的限额设置菜单中查看,或联系Halo BCA。'),
    ('transaksi', 'Bagaimana cara melakukan pengecekan mutasi rekening?',
     'How do I check my account transaction history?',
     '如何查询账户交易记录?',
     'Account transaction history can be checked directly through the myBCA or KlikBCA app in the transaction history menu, without needing to visit a branch.',
     '账户交易记录可直接通过myBCA或KlikBCA应用程序中的交易记录菜单进行查询,无需前往分行办理。'),
    ('transaksi', 'Apa yang harus dilakukan jika salah transfer ke rekening lain?',
     'What should I do if I transferred money to the wrong account?',
     '如果误将资金转到其他账户,应该怎么办?',
     'Contact Halo BCA at 1500888 immediately with proof of the transaction. The BCA team will assist with tracing the transaction and requesting a refund from the incorrect recipient.',
     '请立即致电1500888联系Halo BCA,并提供交易凭证。BCA团队将协助追踪交易情况,并向误收款方申请退款。'),
    ('transaksi', 'Apakah ada biaya untuk transfer antarbank?',
     'Are there fees for interbank transfers?',
     '跨行转账是否需要收取费用?',
     'Interbank transfer fees vary depending on the method used, such as regular online transfer or BI-FAST. Fee details are shown directly during the transaction process in myBCA or KlikBCA.',
     '跨行转账费用因所使用的转账方式而异,例如普通线上转账或BI-FAST快速转账。具体费用详情将在myBCA或KlikBCA交易过程中直接显示。')
  ) as v(category_key, question, question_en, question_zh, answer_en, answer_zh)
 where i.category_key = v.category_key and i.question = v.question;
