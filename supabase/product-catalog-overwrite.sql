-- Ganti TOTAL isi `products` untuk semua kategori KECUALI Simpanan dengan
-- katalog resmi dari bca.co.id. Beda dari migration sebelumnya (yang cuma
-- menambah di atas data placeholder lama) — file ini menghapus dulu semua
-- produk lama di kategori terkait, baru mengisi ulang dari nol, jadi tidak ada
-- percampuran nama placeholder ("KPR BCA", "Welma", dst) dengan nama resmi.
--
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent) — delete lalu insert selalu menghasilkan
-- state yang sama, tidak pernah dobel.
--
-- Jalankan SETELAH product-section.sql, product-featured.sql,
-- product-category-image.sql, dan product-i18n.sql (kolom title_en/zh,
-- subtitle_en/zh dipakai di bagian terjemahan bawah).
--
-- Sumber:
--  Kartu Kredit https://www.bca.co.id/id/Individu/produk/Kartu-Kredit/pilihan-kartu
--  Pinjaman     https://www.bca.co.id/id/individu/produk/pinjaman
--  e-Banking    https://www.bca.co.id/id/individu/layanan/e-banking
--  Investasi    https://www.bca.co.id/id/individu/produk/investasi-dan-asuransi (non-asuransi saja)
--  Asuransi     https://www.bca.co.id/id/Individu/produk/Investasi-dan-Asuransi/Bancassurance
--                (grid kategori × partner, bukan produk bernama — diisi per
--                KATEGORI proteksi saja, tanpa nama partner)

-- --------------------------------------------------------- hapus data lama ----
-- Simpanan sengaja tidak disentuh.

delete from public.products where category_key <> 'Simpanan';

-- ----------------------------------------------------------- Kartu Kredit ----

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
values
  ('Kartu Kredit', 'BCA Everyday Card',                               'Tiap hari belanja, tiap hari untung',                '/assets/product/card-everyday.webp',   1,  true),
  ('Kartu Kredit', 'BCA Card Platinum',                                'Kartu istimewa untuk pribadi istimewa',              '/assets/product/card-mastercard.webp', 2,  true),
  ('Kartu Kredit', 'BCA American Express Platinum',                    'For the finest things in life',                      '/assets/product/card-amex.webp',       3,  true),
  ('Kartu Kredit', 'BCA Singapore Airlines KrisFlyer Visa Signature',  'Faster way to earn KrisFlyer miles',                 '/assets/product/card-everyday.webp',   4,  false),
  ('Kartu Kredit', 'BCA Singapore Airlines KrisFlyer Visa Infinite',   'Faster way to earn KrisFlyer miles',                 '/assets/product/card-mastercard.webp', 5,  false),
  ('Kartu Kredit', 'BCA Singapore Airlines PPS Club Visa Infinite',    'Faster way to earn KrisFlyer miles',                 '/assets/product/card-amex.webp',       6,  false),
  ('Kartu Kredit', 'BCA Visa Batman',                                  'My Card My Superhero',                               '/assets/product/card-everyday.webp',   7,  false),
  ('Kartu Kredit', 'BCA Visa Black',                                   'Experience the ultimate privilege',                  '/assets/product/card-mastercard.webp', 8,  false),
  ('Kartu Kredit', 'BCA Mastercard Black',                             'Experience the ultimate privilege',                  '/assets/product/card-amex.webp',       9,  false),
  ('Kartu Kredit', 'BCA Blibli Mastercard',                            'Belanja online lebih untung bersama Blibli',         '/assets/product/card-everyday.webp',   10, false),
  ('Kartu Kredit', 'BCA tiket.com Mastercard',                         'Belanja Every Day, Bikin Hemat Holiday',             '/assets/product/card-mastercard.webp', 11, false),
  ('Kartu Kredit', 'BCA Mastercard Globe',                             'My Card My Lifestyle Partner',                       '/assets/product/card-amex.webp',       12, false),
  ('Kartu Kredit', 'BCA Mastercard World',                             'Kartu kredit premium untuk gaya hidup global',       '/assets/product/card-everyday.webp',   13, false),
  ('Kartu Kredit', 'BCA JCB Black',                                    'Style specially for you',                            '/assets/product/card-mastercard.webp', 14, false),
  ('Kartu Kredit', 'BCA UnionPay',                                     'Let''s Live It Up!',                                 '/assets/product/card-amex.webp',       15, false);

-- --------------------------------------------------------------- Pinjaman ----

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
values
  ('Pinjaman', 'Kredit Pemilikan Rumah',               'Makin mudah mendapatkan rumah idaman',              '/assets/product/card-everyday.webp',   1, true),
  ('Pinjaman', 'Kredit Kendaraan Bermotor',             'Kenyamanan untuk mewujudkan kendaraan idaman',      '/assets/product/card-mastercard.webp', 2, true),
  ('Pinjaman', 'Pinjaman Kredit Tanpa Agunan Personal', 'Pinjaman untuk segala kebutuhan',                   '/assets/product/card-amex.webp',       3, true),
  ('Pinjaman', 'Kredit Sepeda Motor (KSM)',             'Kenyamanan untuk mewujudkan sepeda motor idaman',   '/assets/product/card-everyday.webp',   4, false),
  ('Pinjaman', 'Secured Personal Loan',                 'Fasilitas kredit dengan jaminan produk investasi',  '/assets/product/card-mastercard.webp', 5, false);

-- -------------------------------------------------------------- e-Banking ----

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
values
  ('e-Banking', 'myBCA',                            '#NyamannyaDunia myBCA untuk nyamannya transaksi hingga investasi', '/assets/product/card-simpanan-1.webp', 1,  true),
  ('e-Banking', 'BCA mobile',                        'Semua transaksi perbankan #DibikinSimpel',                        '/assets/product/card-simpanan-2.webp', 2,  true),
  ('e-Banking', 'KlikBCA',                           'Layanan perbankan aman dan nyaman',                                '/assets/product/card-simpanan-3.webp', 3,  true),
  ('e-Banking', 'CS Digital',                         'Solusi praktis ganti kartu',                                       '/assets/product/card-simpanan-1.webp', 4,  false),
  ('e-Banking', 'eBranch',                            'Reservasi di cabang jadi lebih nyaman',                            '/assets/product/card-simpanan-2.webp', 5,  false),
  ('e-Banking', 'Investasi Digital BCA',              'Investasi aman dan terkurasi mulai dari Rp10 ribu',                '/assets/product/card-simpanan-3.webp', 6,  false),
  ('e-Banking', 'OneKlik',                            'Transaksi online makin simpel dengan satu klik',                   '/assets/product/card-simpanan-1.webp', 7,  false),
  ('e-Banking', 'Persetujuan Digital',                'Verifikasi diri aman, mudah & cepat',                              '/assets/product/card-simpanan-2.webp', 8,  false),
  ('e-Banking', 'QRIS',                               'Scan QR untuk cara bayar praktis',                                 '/assets/product/card-simpanan-3.webp', 9,  false),
  ('e-Banking', 'Setor Tarik Tunai Mitra ATM BCA',    'Setor dan tarik tunai lewat aplikasi mitra di ATM BCA',            '/assets/product/card-simpanan-1.webp', 10, false),
  ('e-Banking', 'Virtual Account BCA',                'Pembayaran Lebih Mudah dengan Virtual Account BCA',                '/assets/product/card-simpanan-2.webp', 11, false),
  ('e-Banking', 'ATM BCA',                            'Layanan unggulan dengan jaringan luas',                            '/assets/product/card-simpanan-3.webp', 12, false),
  ('e-Banking', 'BCA by Phone',                       'Layanan perbankan menyapa ramah di telinga',                       '/assets/product/card-simpanan-1.webp', 13, false);

-- --------------------------------------------------------------- Investasi ----

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
values
  ('Investasi', 'Reksa Dana',                     'Investasi terjangkau untuk rencana masa depanmu',           '/assets/product/card-everyday.webp',   1, true),
  ('Investasi', 'Obligasi',                       'Berbagai macam pilihan obligasi dari BCA',                  '/assets/product/card-mastercard.webp', 2, true),
  ('Investasi', 'Rekening Dana Nasabah (RDN)',     'Rekening dana untuk transaksi investasi lebih aman',        '/assets/product/card-amex.webp',       3, true),
  ('Investasi', 'Rekening Dana Lender (RDL) BCA', 'Fasilitas rekening untuk transaksi pendanaan P2P lending',  '/assets/product/card-everyday.webp',   4, false);

-- ---------------------------------------------------------------- Asuransi ----
-- Halaman Bancassurance menyajikan kategori proteksi × partner (AIA, BCA Life,
-- Chubb General, Chubb Life, BCA Insurance), bukan produk bernama satu-satu —
-- jadi diisi per KATEGORI proteksi saja, tanpa nama partner.

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
values
  ('Asuransi', 'Asuransi Jiwa',               'Proteksi jiwa dengan premi terjangkau',                    '/assets/product/card-everyday.webp',   1, true),
  ('Asuransi', 'Asuransi Kesehatan',          'Perlindungan biaya rumah sakit lebih tenang',              '/assets/product/card-mastercard.webp', 2, true),
  ('Asuransi', 'Asuransi Kendaraan',          'Proteksi kendaraan dari risiko tak terduga',               '/assets/product/card-amex.webp',       3, true),
  ('Asuransi', 'Asuransi Harta Benda',        'Proteksi untuk rumah dan aset berharga Anda',              '/assets/product/card-everyday.webp',   4, false),
  ('Asuransi', 'Asuransi Kecelakaan Diri',    'Perlindungan finansial akibat risiko kecelakaan',          '/assets/product/card-mastercard.webp', 5, false),
  ('Asuransi', 'Asuransi Pendidikan',         'Persiapkan masa depan pendidikan anak lebih terjamin',     '/assets/product/card-amex.webp',       6, false),
  ('Asuransi', 'Asuransi Pensiun & Anuitas',  'Rencanakan masa pensiun dengan penghasilan tetap',         '/assets/product/card-everyday.webp',   7, false),
  ('Asuransi', 'Asuransi Perjalanan',         'Perlindungan menyeluruh selama perjalanan Anda',           '/assets/product/card-mastercard.webp', 8, false),
  ('Asuransi', 'Asuransi Warisan',            'Wariskan perlindungan finansial untuk keluarga tercinta',  '/assets/product/card-amex.webp',       9, false);

-- ------------------------------------------------------------ terjemahan ----
-- EN/ZH untuk seluruh produk di atas, mengikuti pola product-i18n.sql.
-- No-op kalau kolom title_en/dst belum ada.

update public.products p
   set title_en    = v.title_en,
       title_zh    = v.title_zh,
       subtitle_en = v.subtitle_en,
       subtitle_zh = v.subtitle_zh
  from (values
    ('BCA Everyday Card',                               'BCA Everyday Card',                              'BCA Everyday Card',                        'Shop every day, benefit every day',                              '天天购物，天天受益'),
    ('BCA Card Platinum',                               'BCA Card Platinum',                               'BCA白金卡',                                'A special card for special individuals',                         '为尊贵人士打造的尊贵卡片'),
    ('BCA American Express Platinum',                   'BCA American Express Platinum',                   'BCA美国运通白金卡',                        'For the finest things in life',                                  '尽享生活中最美好的事物'),
    ('BCA Singapore Airlines KrisFlyer Visa Signature', 'BCA Singapore Airlines KrisFlyer Visa Signature', 'BCA新加坡航空 KrisFlyer Visa Signature 卡', 'Faster way to earn KrisFlyer miles',                             '更快赚取 KrisFlyer 里程的方式'),
    ('BCA Singapore Airlines KrisFlyer Visa Infinite',  'BCA Singapore Airlines KrisFlyer Visa Infinite',  'BCA新加坡航空 KrisFlyer Visa Infinite 卡',  'Faster way to earn KrisFlyer miles',                             '更快赚取 KrisFlyer 里程的方式'),
    ('BCA Singapore Airlines PPS Club Visa Infinite',   'BCA Singapore Airlines PPS Club Visa Infinite',   'BCA新加坡航空 PPS Club Visa Infinite 卡',   'Faster way to earn KrisFlyer miles',                             '更快赚取 KrisFlyer 里程的方式'),
    ('BCA Visa Batman',                                 'BCA Visa Batman',                                 'BCA Visa 蝙蝠侠卡',                        'My Card My Superhero',                                           '我的卡，我的超级英雄'),
    ('BCA Visa Black',                                  'BCA Visa Black',                                  'BCA Visa黑卡',                             'Experience the ultimate privilege',                              '尊享至高特权体验'),
    ('BCA Mastercard Black',                            'BCA Mastercard Black',                             'BCA万事达黑卡',                            'Experience the ultimate privilege',                              '尊享至高特权体验'),
    ('BCA Blibli Mastercard',                           'BCA Blibli Mastercard',                            'BCA Blibli万事达卡',                       'More rewarding online shopping with Blibli',                     '与Blibli一起享受更超值的网购'),
    ('BCA tiket.com Mastercard',                        'BCA tiket.com Mastercard',                        'BCA tiket.com万事达卡',                    'Shop every day, save on holidays',                               '天天购物，假期更省钱'),
    ('BCA Mastercard Globe',                            'BCA Mastercard Globe',                            'BCA万事达Globe卡',                         'My Card My Lifestyle Partner',                                   '我的卡，我的生活方式伙伴'),
    ('BCA Mastercard World',                            'BCA Mastercard World',                            'BCA万事达World卡',                         'Premium credit card for a global lifestyle',                     '为全球生活方式打造的高级信用卡'),
    ('BCA JCB Black',                                   'BCA JCB Black',                                   'BCA JCB黑卡',                              'Style specially for you',                                        '专属你的风格'),
    ('BCA UnionPay',                                    'BCA UnionPay',                                     'BCA银联卡',                                 'Let''s Live It Up!',                                             '尽情享受生活！'),

    ('Kredit Pemilikan Rumah',                          'BCA Home Loan (KPR)',                             'BCA房屋贷款 (KPR)',                        'Easier way to get your ideal home',                              '更轻松实现理想家园'),
    ('Kredit Kendaraan Bermotor',                       'BCA Vehicle Loan (KKB)',                          'BCA车辆贷款 (KKB)',                        'Comfort in realizing your ideal vehicle',                        '轻松实现您理想的车辆'),
    ('Pinjaman Kredit Tanpa Agunan Personal',           'Personal Unsecured Loan',                         '个人无抵押贷款',                            'A loan for all your needs',                                      '满足您各种需求的贷款'),
    ('Kredit Sepeda Motor (KSM)',                       'Motorcycle Loan (KSM)',                            '摩托车贷款 (KSM)',                        'Comfort in realizing your dream motorcycle',                     '轻松实现您理想的摩托车'),
    ('Secured Personal Loan',                           'Secured Personal Loan',                            '有担保个人贷款',                          'Credit facility secured by investment products',                 '以投资产品作为担保的信贷额度'),

    ('myBCA',                                           'myBCA',                                            'myBCA',                                    'The comfort of myBCA, from transactions to investments',        'myBCA的便利，交易与投资尽在其中'),
    ('BCA mobile',                                      'BCA mobile',                                       'BCA mobile',                               'All your banking transactions, made simple',                     '所有银行交易，简单便捷'),
    ('KlikBCA',                                         'KlikBCA',                                          'KlikBCA',                                  'Safe and convenient internet banking',                           '安全便捷的网上银行服务'),
    ('CS Digital',                                      'CS Digital',                                       'CS Digital',                              'Practical solution for card replacement',                        '便捷换卡解决方案'),
    ('eBranch',                                         'eBranch',                                          'eBranch',                                 'More convenient branch reservations',                            '更便捷的网点预约服务'),
    ('Investasi Digital BCA',                           'BCA Digital Investment',                           'BCA数字投资',                              'Secure, curated investment starting from Rp10 thousand',         '从1万印尼盾起的安全精选投资'),
    ('OneKlik',                                         'OneKlik',                                          'OneKlik',                                 'Online transactions made simpler with one click',                '一键完成，让在线交易更简单'),
    ('Persetujuan Digital',                             'Digital Approval',                                 '数字签约确认',                             'Secure, easy, and fast self-verification',                       '安全、便捷、快速的身份验证'),
    ('QRIS',                                            'QRIS',                                             'QRIS',                                    'Scan QR for a practical way to pay',                             '扫码支付，简单便捷'),
    ('Setor Tarik Tunai Mitra ATM BCA',                 'Partner App Cash Deposit/Withdrawal at BCA ATM',   '通过合作应用在BCA ATM存取现金',            'Cash deposit and withdrawal via partner apps at BCA ATMs',       '通过合作应用在BCA ATM存取现金'),
    ('Virtual Account BCA',                             'BCA Virtual Account',                              'BCA虚拟账户',                              'Easier payments with BCA Virtual Account',                       '使用BCA虚拟账户，支付更轻松'),
    ('ATM BCA',                                         'BCA ATM',                                          'BCA自动柜员机',                            'A leading service with an extensive network',                   '网络广泛的优质服务'),
    ('BCA by Phone',                                    'BCA by Phone',                                     'BCA电话银行',                              'Friendly banking service, just a call away',                     '亲切贴心的电话银行服务'),

    ('Reksa Dana',                                      'Mutual Fund',                                     '共同基金',                                 'Affordable investment for your future plans',                   '为您的未来规划提供实惠的投资'),
    ('Obligasi',                                        'Bond',                                             '债券',                                     'A variety of bond options from BCA',                             'BCA提供的多种债券选择'),
    ('Rekening Dana Nasabah (RDN)',                     'Customer Fund Account (RDN)',                     '客户资金账户 (RDN)',                       'A dedicated fund account for safer investment transactions',    '让投资交易更安全的资金账户'),
    ('Rekening Dana Lender (RDL) BCA',                  'BCA Lender Fund Account (RDL)',                   'BCA出借人资金账户 (RDL)',                  'An account facility for P2P lending funding transactions',      '用于P2P借贷资金交易的账户设施'),

    ('Asuransi Jiwa',                                   'Life Insurance',                                  '人寿保险',                                 'Life protection with an affordable premium',                     '保费实惠的人寿保障'),
    ('Asuransi Kesehatan',                              'Health Insurance',                                '健康保险',                                 'Peace of mind with hospital cost coverage',                      '医院费用保障，安心无忧'),
    ('Asuransi Kendaraan',                               'Vehicle Insurance',                               '车辆保险',                                 'Vehicle protection against unforeseen risks',                    '为车辆提供意外风险保障'),
    ('Asuransi Harta Benda',                            'Property Insurance',                              '财产保险',                                 'Protection for your home and valuable assets',                   '为您的房屋和贵重财产提供保障'),
    ('Asuransi Kecelakaan Diri',                        'Personal Accident Insurance',                     '意外伤害保险',                             'Financial protection against accident risks',                    '应对意外风险的财务保障'),
    ('Asuransi Pendidikan',                             'Education Insurance',                              '教育保险',                                 'Secure your child''s education for the future',                 '为孩子的未来教育提供保障'),
    ('Asuransi Pensiun & Anuitas',                      'Pension & Annuity Insurance',                     '养老金与年金保险',                         'Plan for retirement with a steady income',                       '规划稳定收入的退休生活'),
    ('Asuransi Perjalanan',                             'Travel Insurance',                                '旅行保险',                                 'Comprehensive protection throughout your trip',                  '为您的旅程提供全面保障'),
    ('Asuransi Warisan',                                'Legacy Insurance',                                 '传承保险',                                 'Pass on financial protection to your loved ones',                '为挚爱家人留下财务保障')
  ) as v(title, title_en, title_zh, subtitle_en, subtitle_zh)
 where p.title = v.title
   and p.category_key <> 'Simpanan';

-- ------------------------------------------------------------- verifikasi ----
-- select category_key, title, subtitle, sort_order, is_featured from public.products
--  order by category_key, sort_order;
