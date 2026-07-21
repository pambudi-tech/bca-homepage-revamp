-- Tambah dukungan multi-bahasa (EN, ZH) ke `product_categories` dan `products`.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
--
-- Pola sama dengan supabase/banner-i18n.sql: kolom asli (label, description,
-- title, subtitle) tetap jadi versi Indonesia (default). Kolom
-- baru `_en`/`_zh` opsional — kalau kosong, kode di `src/lib/products.ts`
-- otomatis jatuh balik ke versi Indonesia, jadi kategori/produk yang belum
-- diterjemahkan tidak pernah tampil kosong.

alter table public.product_categories
  add column if not exists label_en text,
  add column if not exists label_zh text,
  add column if not exists description_en text,
  add column if not exists description_zh text;

alter table public.products
  add column if not exists title_en text,
  add column if not exists title_zh text,
  add column if not exists subtitle_en text,
  add column if not exists subtitle_zh text;

-- ------------------------------------------------------------- terjemahan ----
-- Dicocokkan lewat `key`/`title` (versi Indonesia) supaya aman dijalankan
-- tanpa perlu tahu id barisnya.

update public.product_categories c
   set label_en        = v.label_en,
       label_zh        = v.label_zh,
       description_en  = v.description_en,
       description_zh  = v.description_zh
  from (values
    ('Simpanan',     'Savings',       '存款',       'Savings & deposits for every need',                 '满足各种需求的储蓄与存款'),
    ('Kartu Kredit', 'Credit Card',   '信用卡',     'Cards for your lifestyle and every transaction',    '为您的生活方式和每一笔交易而设的卡片'),
    ('Pinjaman',     'Loan',          '贷款',       'Financing solutions for home, vehicle, and business', '房屋、车辆与企业融资解决方案'),
    ('e-Banking',    'e-Banking',     '电子银行',   'Digital banking in the palm of your hand',        '尽在掌握的数字银行服务'),
    ('Investasi',    'Investment',    '投资',       'Grow your funds through various instruments',       '通过多种工具增值您的资金'),
    ('Asuransi',     'Insurance',     '保险',       'Comprehensive protection for you and your family',  '为您和家人提供全面保障')
  ) as v(key, label_en, label_zh, description_en, description_zh)
 where c.key = v.key;

update public.products p
   set title_en    = v.title_en,
       title_zh    = v.title_zh,
       subtitle_en = v.subtitle_en,
       subtitle_zh = v.subtitle_zh
  from (values
    ('Tahapan BCA',                 'Tahapan BCA',               'Tahapan BCA',        'Everyday savings account for daily transactions',      '用于日常交易的常规储蓄账户'),
    ('Tahapan Xpresi',              'Tahapan Xpresi',            'Tahapan Xpresi',     'Youth savings account with a customizable card',       '带有可定制卡片的青年储蓄账户'),
    ('BCA Dollar',                  'BCA Dollar',                'BCA Dollar',         'Foreign currency savings in USD and SGD',              '美元和新加坡元外币储蓄'),
    ('Tahapan Berjangka',           'Tahapan Berjangka',         'Tahapan Berjangka',  'Regular savings with a fixed monthly deposit',         '每月固定存款的定期储蓄'),
    ('Tapres',                      'Tapres',                    'Tapres',             'Achievement savings with attractive interest rates',   '利率优惠的成就储蓄'),
    ('Simpanan Pelajar',            'Simpanan Pelajar',          'Simpanan Pelajar',   'Student savings with no administration fee',           '无管理费的学生储蓄'),
    ('TabunganKu',                  'TabunganKu',                'TabunganKu',         'Light savings account for everyone',                   '面向所有人的轻量储蓄账户'),
    ('Deposito Berjangka',          'Deposito Berjangka',        'Deposito Berjangka', 'Time deposit with competitive interest',               '利率具竞争力的定期存款'),
    ('Tahapan Gold',                'Tahapan Gold',              'Tahapan Gold',       'Savings to keep your business running smoothly',       '助力业务顺畅运营的储蓄'),
    ('BCA Everyday Card',           'BCA Everyday Card',         'BCA Everyday Card',  'Shop every day, benefit every day',                     '天天购物，天天受益'),
    ('BCA Mastercard Black',        'BCA Mastercard Black',      'BCA Mastercard Black','Experience the ultimate privilege',                    '尊享至高特权体验'),
    ('BCA American Express Platinum','BCA American Express Platinum','BCA American Express Platinum','For the finest things in life',        '尽享生活中最美好的事物'),
    ('KPR BCA',                     'BCA Home Loan',             'BCA房屋贷款',        'Realize your dream home with a competitive rate',       '以具竞争力的利率实现梦想家园'),
    ('KKB BCA',                     'BCA Vehicle Loan',          'BCA车辆贷款',        'Fast vehicle financing process',                        '快速办理车辆贷款'),
    ('Kredit Tanpa Agunan',         'Unsecured Loan',            '无抵押贷款',         'Fast funds without collateral for your needs',          '无需抵押即可满足您的资金需求'),
    ('myBCA',                       'myBCA',                      'myBCA',              'Digital banking super app in one application',         '一站式数字银行超级应用'),
    ('BCA mobile',                  'BCA mobile',                 'BCA mobile',         'Practical transactions straight from your phone',       '手机上便捷完成交易'),
    ('KlikBCA',                     'KlikBCA',                    'KlikBCA',            'Internet banking for daily needs',                      '满足日常需求的网上银行'),
    ('Reksa Dana BCA',              'BCA Mutual Fund',            'BCA共同基金',        'Easy investing starting from Rp100 thousand',           '从10万印尼盾起轻松投资'),
    ('Welma',                       'Welma',                      'Welma',              'BCA digital investment & insurance platform',           'BCA数字投资与保险平台'),
    ('Obligasi Negara',             'Government Bond',            '政府债券',           'Debt securities investment with fixed returns',         '收益固定的债券投资'),
    ('BCA Life Proteksi',           'BCA Life Protection',        'BCA人寿保障',        'Life protection with an affordable premium',            '保费实惠的人寿保障'),
    ('Asuransi Kesehatan',          'Health Insurance',           '健康保险',           'Peace of mind with hospital cost coverage',             '医院费用保障，安心无忧'),
    ('Asuransi Kendaraan',          'Vehicle Insurance',          '车辆保险',           'Vehicle protection against unforeseen risks',           '为车辆提供意外风险保障')
  ) as v(title, title_en, title_zh, subtitle_en, subtitle_zh)
 where p.title = v.title;

-- ------------------------------------------------------------- verifikasi ----
-- select key, label, label_en, label_zh from public.product_categories order by sort_order;
-- select title, title_en, title_zh from public.products order by category_key, sort_order;
