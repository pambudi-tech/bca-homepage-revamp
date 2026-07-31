-- Tambah dukungan multi-bahasa (EN, ZH) ke `news_channels` dan `news`.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
--
-- Pola sama dengan supabase/product-i18n.sql dan supabase/faq-section.sql:
-- kolom asli (label, title, category) tetap jadi versi Indonesia (default).
-- Kolom baru `_en`/`_zh` opsional — kalau kosong, kode di `src/lib/news.ts`
-- otomatis jatuh balik ke versi Indonesia, jadi artikel yang belum
-- diterjemahkan tidak pernah tampil kosong.

alter table public.news_channels
  add column if not exists label_en text,
  add column if not exists label_zh text;

alter table public.news
  add column if not exists title_en    text,
  add column if not exists title_zh    text,
  add column if not exists category_en text,
  add column if not exists category_zh text;

-- ------------------------------------------------------------- terjemahan ----
-- Dicocokkan lewat `key`/`href` (versi Indonesia) supaya aman dijalankan
-- tanpa perlu tahu id barisnya.

update public.news_channels c
   set label_en = v.label_en,
       label_zh = v.label_zh
  from (values
    ('news-and-features', 'News & Feature', '新闻资讯'),
    ('edukatips',         'EdukaTips',      '理财小贴士'),
    ('awas-modus',        'Fraud Alert',    '诈骗警示')
  ) as v(key, label_en, label_zh)
 where c.key = v.key;

update public.news n
   set title_en    = v.title_en,
       title_zh    = v.title_zh,
       category_en = v.category_en,
       category_zh = v.category_zh
  from (values
    -- News & Feature
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/15/14/50/fitur-bahasa-mandarin-kini-hadir-di-atm-bca',
     'Mandarin Language Feature Now Available at BCA ATMs', 'BCA ATM现已支持中文功能',
     'Banking information', '银行资讯'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/10/08/29/transaksi-virtual-account-bca-di-e-commerce-semakin-cepat-dan-praktis',
     'BCA Virtual Account Transactions on E-Commerce Are Now Faster and Easier', 'BCA电子商务虚拟账户交易更快捷便利',
     'Banking information', '银行资讯'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/06/08/34/kenali-keunggulan-investasi-ori030-di-bca',
     'Get to Know the Advantages of ORI030 Investment at BCA', '了解BCA ORI030投资的优势',
     'Investment', '投资'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/02/15/19/bca-business-case-competition-2026-know-the-market-own-the-game',
     'BCA Business Case Competition 2026: Know the Market, Own the Game', 'BCA商业案例大赛2026：洞悉市场，掌握全局',
     'Event', '活动'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/01/11/45/informasi-ketentuan-threshold-transaksi-valas',
     'Information on Foreign Exchange Transaction Threshold Provisions', '外汇交易门槛规定信息',
     'Finance', '金融'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/07/01/11/14/masa-singapore-2026-bca-dukung-penuh-gerakan-kreatif-indonesia',
     'MASA Singapore 2026: BCA Fully Supports Indonesia''s Creative Movement', 'MASA新加坡2026：BCA全力支持印尼创意运动',
     'Event', '活动'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/06/24/15/00/makin-praktis-buka-e-deposito-usd-dan-sgd-bisa-melalui-mybca',
     'Even More Convenient: Open USD and SGD e-Deposits via myBCA', '更加便捷：通过myBCA开立美元与新元电子定存',
     'myBCA', 'myBCA'),
    ('https://www.bca.co.id/id/informasi/news-and-features/2026/06/19/13/22/fitur-notifikasi-financial-diary-hadir-di-bca-mobile-untuk-seluruh-nasabah-bca',
     '"Financial Diary" Notification Feature Now Available in BCA mobile for All BCA Customers', '“财务日记”通知功能现已在BCA mobile向所有BCA客户开放',
     'BCA mobile', 'BCA mobile'),

    -- EdukaTips
    ('https://www.bca.co.id/id/informasi/edukatips/2026/07/02/16/41/beli-pulsa-paket-data-atau-bayar-tagihan-pascabayar-bisa-di-channel-bca',
     'Buying Credit, Data Packages, or Paying Postpaid Bills? You Can Do It via BCA e-Channel!', '购买话费、流量套餐或缴纳后付费账单？在BCA电子渠道即可完成！',
     'e-Channel', '电子渠道'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/29/17/44/investasi-hanya-dengan-uang-saku-bagaimana-caranya',
     'Investing With Just Pocket Money, How Is It Done?', '仅凭零花钱也能投资，该怎么做？',
     'Investment', '投资'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/25/15/14/otp-aman-transaksi-online-nyaman',
     'Secure OTP, Comfortable Online Transactions', 'OTP安全，网上交易更安心',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/22/08/34/mau-mulai-investasi-reksa-dana-pahami-cara-kerjanya-dulu-yuk',
     'Want to Start Investing in Mutual Funds? Understand How It Works First!', '想开始投资共同基金？先了解其运作方式吧！',
     'Investment', '投资'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/19/14/11/langkah-mudah-mengatur-notifikasi-di-bca-mobile',
     'Easy Steps to Manage Notifications in BCA mobile', '轻松设置BCA mobile通知的简单步骤',
     'BCA mobile', 'BCA mobile'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/19/10/23/cara-mudah-buka-rekening-efek-rdn-bca-sekuritas-di-mybca',
     'Easy Way to Open a Securities Account - BCA Sekuritas RDN via myBCA', '通过myBCA轻松开立证券账户 - BCA Sekuritas RDN',
     'myBCA', 'myBCA'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/18/16/31/e-deposito-valas-di-mybca-solusi-simpan-dana-mata-uang-asing-dari-genggaman',
     'Foreign Currency e-Deposit on myBCA: A Solution for Storing Foreign Currency Funds From Your Hand', 'myBCA外币电子定存：随手存放外币资金的解决方案',
     'myBCA', 'myBCA'),
    ('https://www.bca.co.id/id/informasi/edukatips/2026/06/18/10/19/perlindungan-rumah-itu-personal-kenapa-setiap-orang-bisa-berbeda',
     'Home Protection Is Personal: Why It Can Differ for Everyone', '房屋保障因人而异：为何每个人的选择都不同',
     'Insurance', '保险'),

    -- #AwasModus
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/06/22/14/13/hati-hati-modus-penipuan-transaksi-mencurigakan-dan-blokir-kartu-kredit-mengatasnamakan-bca',
     'Beware of Fraud Impersonating BCA Regarding Suspicious Transactions and Credit Card Blocking', '警惕冒充BCA的可疑交易及信用卡冻结诈骗手法',
     'Credit Card', '信用卡'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/06/09/16/57/modus-penipuan-paket-tertukar-atau-hilang-yang-perlu-diwaspadai',
     'Beware of Swapped or Lost Package Fraud Schemes', '警惕包裹调换或丢失的诈骗手法',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/05/26/16/34/waspada-modus-penipuan-melalui-email-dalam-transaksi-internasional',
     'Beware of Email Fraud Schemes in International Transactions', '警惕国际交易中的邮件诈骗手法',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/04/28/10/20/transaksi-yang-nyaman-dimulai-dari-menjaga-data-perbankan',
     'Comfortable Transactions Start With Protecting Your Banking Data', '便捷交易始于守护您的银行数据',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/04/27/16/17/mengatasnamakan-copartner',
     'Protect Your Personal Data, Beware of Fraud Impersonating BCA Company Partners', '守护个人数据，警惕冒充BCA合作伙伴的诈骗',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/04/13/11/06/waspada-nomor-halo-bca-palsu-di-website-instansi',
     'Beware of Fake Halo BCA Numbers on Institutional Websites', '警惕机构网站上的假冒Halo BCA号码',
     'Halo BCA', 'Halo BCA'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/03/17/16/16/hindari-penipuan-akses-informasi-dan-channel-resmi-bca-hanya-dari-bcacoid',
     'Avoid Fraud! Access BCA''s Official Information and Channels Only From bca.co.id', '避免受骗！仅通过bca.co.id获取BCA官方信息与渠道',
     'Security', '安全'),
    ('https://www.bca.co.id/id/informasi/awas-modus/2026/02/26/16/44/finansial-aman-mudik-nyaman-waspada-modus-penipuan-lebaran-2026',
     'Safe Finances, Comfortable Journey Home: Beware of 2026 Lebaran Fraud Schemes', '财务安全，返乡安心：警惕2026年开斋节诈骗手法',
     'Security', '安全')
  ) as v(href, title_en, title_zh, category_en, category_zh)
 where n.href = v.href;

-- ------------------------------------------------------------- verifikasi ----
-- select key, label, label_en, label_zh from public.news_channels order by sort_order;
-- select title, title_en, title_zh, category, category_en, category_zh from public.news order by published_at desc;
