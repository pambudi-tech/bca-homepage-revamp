-- Promo section — schema + seed.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).

-- ---------------------------------------------------------------- tabel ----

-- Brand pemilik promo. Dipisah dari `promos` karena satu brand bisa punya
-- banyak promo: logonya cukup diganti sekali di sini, bukan per promo.
create table if not exists public.brands (
  id   text primary key,
  name text not null,
  -- Path relatif (/assets/promo/x.png) atau URL penuh ke Supabase Storage.
  logo text not null
);

create table if not exists public.promos (
  -- id berupa slug (bukan identity) supaya gampang dirujuk manual dan tidak
  -- berubah kalau barisnya dihapus lalu dibuat lagi.
  id            text primary key,
  title         text        not null,
  brand_id      text        not null references public.brands(id) on delete restrict,
  -- Path relatif (/assets/promo/x.webp) atau URL penuh ke Supabase Storage.
  -- Cover tetap di sini (beda tiap promo); logo ikut brand.
  cover         text        not null,
  -- Periode promo. Badge di kartu ("Segera Hadir", "Segera Berakhir!",
  -- "Kadaluarsa", "Promo Baru") dihitung dari dua kolom ini di sisi aplikasi —
  -- tidak ada kolom badge yang perlu diisi manual.
  start_at      timestamptz not null,
  end_at        timestamptz not null,
  -- Jumlah redeem dari analytics. Badge "Populer" muncul begitu angka ini
  -- tembus ambang POPULAR_REDEEM_THRESHOLD di promo-data.ts (default 1000).
  -- Kalah prioritas dari badge berbasis waktu.
  redeem_count  int         not null default 0,
  sort_order    int         not null default 0,
  is_active     boolean     not null default true,
  constraint promos_period_valid check (end_at > start_at)
);

create index if not exists promos_sort_idx  on public.promos (sort_order);
create index if not exists promos_brand_idx on public.promos (brand_id);

-- ------------------------------------------------------------------ RLS ----
-- Homepage membaca lewat anon key, jadi baris aktif harus bisa dibaca publik.
-- Tidak ada policy insert/update/delete: perubahan hanya lewat dashboard
-- (service role), tidak pernah dari browser.

alter table public.brands enable row level security;
alter table public.promos enable row level security;

-- Brand tidak punya kolom is_active: barisnya hanya tampil kalau ada promo
-- aktif yang menunjuk ke sana, jadi cukup dibuka semua.
drop policy if exists "public read brands" on public.brands;
create policy "public read brands"
  on public.brands for select to anon, authenticated
  using (true);

drop policy if exists "public read active promos" on public.promos;
create policy "public read active promos"
  on public.promos for select to anon, authenticated
  using (is_active);

-- ----------------------------------------------------------------- seed ----
-- Isi yang sama dengan PROMO_SEEDS di promo-data.ts. Offset relatif di file TS
-- diterjemahkan jadi tanggal absolut relatif terhadap saat query ini dijalankan,
-- supaya tiap jenis badge langsung kelihatan sekali seed. Setelah ini periode
-- diedit manual lewat Table Editor.
--
-- Seed hanya jalan saat tabel masih kosong, jadi menjalankan ulang file ini
-- tidak menimpa promo yang sudah ditambah lewat dashboard.
insert into public.brands (id, name, logo) values
  ('mybca',     'myBCA',            '/assets/promo/card1-logo.png'),
  ('ebiga',     'Ebiga Jjampong',   '/assets/promo/card2-logo.png'),
  ('jkt-movin', 'Jakarta Movin',    '/assets/promo/card3-logo.png'),
  ('tiket-com', 'Tiket.com',        '/assets/promo/card4-logo.png'),
  ('bluebird',  'Bluebird',         '/assets/promo/card5-logo.png'),
  ('garuda',    'Garuda Indonesia', '/assets/promo/card6-logo.png'),
  ('lunas',     'Luna''s Doughnuts','/assets/promo/card7-logo.png')
on conflict (id) do update
  set name = excluded.name,
      logo = excluded.logo;

insert into public.promos (id, title, brand_id, cover, start_at, end_at, redeem_count, sort_order)
select id, title, brand_id, cover,
       now() + (start_offset_days || ' days')::interval,
       now() + (end_offset_days   || ' days')::interval,
       redeem_count, sort_order
from (values
  ('cashback-mybca',    'Cashback hingga Rp100 Ribu',                       'mybca',     '/assets/promo/card1-cover.webp',  -60,   330, 4820, 1),
  ('diskon-ebiga',      'Diskon 15% All Beverages',                         'ebiga',     '/assets/promo/card2-cover.webp', -0.5,   140,    0, 2),
  ('presale-musikal',   'Presale BCA - Tiket Musikal "Senja Teduh Pelita"', 'jkt-movin', '/assets/promo/card3-cover.webp', -100,    19,    0, 3),
  ('voucher-tiket',     'Voucher Hingga Rp300 Ribu Setiap Senin',           'tiket-com', '/assets/promo/card4-cover.webp',  -90,    79,    0, 4),
  ('bluebird-javajazz', 'Bluebird di Java Jazz 2026 - Potongan Rp15 Ribu',  'bluebird',  '/assets/promo/card5-cover.webp',  -40, 0.833,    0, 5),
  ('garuda-potongan',   'Potongan Hingga Rp1,8 Juta',                       'garuda',    '/assets/promo/card6-cover.webp',  -30,    45,    0, 6),
  ('lunas-doughnuts',   'Rp75 Ribu ½ Dozen Classic Doughnuts',              'lunas',     '/assets/promo/card7-cover.webp',    2,    30,    0, 7)
) as seed(id, title, brand_id, cover, start_offset_days, end_offset_days, redeem_count, sort_order)
where not exists (select 1 from public.promos);

-- ------------------------------------------- pindah gambar ke Storage ----
-- Jalankan HANYA setelah semua cover/logo diunggah ke bucket `promo-images`
-- (lihat langkah di supabase/README.md). Ganti <PROJECT_REF> dengan ref
-- proyekmu — bagian sebelum ".supabase.co" pada NEXT_PUBLIC_SUPABASE_URL.
--
-- update public.promos
--    set cover = replace(cover, '/assets/promo/', 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/promo-images/')
--  where cover like '/assets/promo/%';
--
-- update public.brands
--    set logo = replace(logo, '/assets/promo/', 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/promo-images/')
--  where logo like '/assets/promo/%';
