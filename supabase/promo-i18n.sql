-- Tambah dukungan multi-bahasa (EN, ZH) ke `promos`.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
--
-- Pola sama dengan supabase/product-i18n.sql dan supabase/faq-section.sql:
-- kolom asli (title) tetap jadi versi Indonesia (default). Kolom baru
-- `_en`/`_zh` opsional — kalau kosong, kode di `src/lib/promos.ts` otomatis
-- jatuh balik ke versi Indonesia, jadi promo yang belum diterjemahkan tidak
-- pernah tampil kosong.
--
-- `brands.name` sengaja tidak ditambah kolom terjemahan — nama brand
-- (myBCA, Bluebird, Garuda Indonesia, dst.) adalah nama produk/perusahaan,
-- sama di semua bahasa.

alter table public.promos
  add column if not exists title_en text,
  add column if not exists title_zh text;

-- ------------------------------------------------------------- terjemahan ----
-- Dicocokkan lewat `id` (slug, bukan judul) supaya aman dijalankan tanpa
-- perlu tahu row id-nya dan tidak salah cocok kalau judul ID pernah diedit.

update public.promos p
   set title_en = v.title_en,
       title_zh = v.title_zh
  from (values
    ('cashback-mybca',    'Cashback up to Rp100 Thousand',                 '现金返还高达10万印尼盾'),
    ('diskon-ebiga',      '15% Off All Beverages',                         '全饮品85折'),
    ('presale-musikal',   'BCA Presale - "Senja Teduh Pelita" Musical Tickets', 'BCA预售 - 音乐剧《Senja Teduh Pelita》门票'),
    ('voucher-tiket',     'Vouchers up to Rp300 Thousand Every Monday',    '每周一优惠券高达30万印尼盾'),
    ('bluebird-javajazz', 'Bluebird at Java Jazz 2026 - Rp15 Thousand Off', 'Bluebird携手2026爪哇爵士音乐节 - 立减1.5万印尼盾'),
    ('garuda-potongan',   'Discount up to Rp1.8 Million',                  '最高优惠180万印尼盾'),
    ('lunas-doughnuts',   'Rp75 Thousand for ½ Dozen Classic Doughnuts',   '7.5万印尼盾享半打经典甜甜圈')
  ) as v(id, title_en, title_zh)
 where p.id = v.id;

-- ------------------------------------------------------------- verifikasi ----
-- select id, title, title_en, title_zh from public.promos order by sort_order;
