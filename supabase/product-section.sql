-- Produk & Layanan section — schema + seed.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).

-- ---------------------------------------------------------------- tabel ----

create table if not exists public.product_categories (
  key        text primary key,
  label      text    not null,
  cta_label  text    not null,
  -- Urutan tampil di daftar kategori (kiri pada desktop, chip pada mobile).
  sort_order int     not null default 0,
  -- Kategori yang terbuka saat halaman pertama dimuat. Hanya satu yang boleh
  -- true; unique index di bawah yang menjaganya.
  is_default boolean not null default false,
  is_active  boolean not null default true
);

create unique index if not exists product_categories_one_default
  on public.product_categories (is_default)
  where is_default;

create table if not exists public.products (
  id           bigint generated always as identity primary key,
  category_key text not null
               references public.product_categories(key) on delete cascade,
  title        text    not null,
  subtitle     text    not null,
  -- Path relatif (/assets/product/x.webp) atau URL penuh ke Supabase Storage.
  image        text    not null,
  sort_order   int     not null default 0,
  is_active    boolean not null default true
);

create index if not exists products_category_sort_idx
  on public.products (category_key, sort_order);

-- ------------------------------------------------------------------ RLS ----
-- Homepage membaca lewat anon key, jadi baris aktif harus bisa dibaca publik.
-- Tidak ada policy insert/update/delete: perubahan hanya lewat dashboard
-- (service role), tidak pernah dari browser.

alter table public.product_categories enable row level security;
alter table public.products           enable row level security;

drop policy if exists "public read active categories" on public.product_categories;
create policy "public read active categories"
  on public.product_categories for select to anon, authenticated
  using (is_active);

drop policy if exists "public read active products" on public.products;
create policy "public read active products"
  on public.products for select to anon, authenticated
  using (is_active);

-- ----------------------------------------------------------------- seed ----
-- Isi yang sama persis dengan product-data.ts, supaya tampilan tidak berubah
-- saat pertama kali tersambung. Gambar masih menunjuk ke /public; ganti ke
-- Storage lewat query UPDATE di bagian paling bawah setelah upload.

insert into public.product_categories (key, label, cta_label, sort_order, is_default) values
  ('Simpanan',     'Simpanan',     'Lihat pilihan Simpanan lainnya',     1, false),
  ('Kartu Kredit', 'Kartu Kredit', 'Lihat pilihan Kartu Kredit lainnya', 2, true),
  ('Pinjaman',     'Pinjaman',     'Lihat pilihan Pinjaman lainnya',     3, false),
  ('Investasi',    'Investasi',    'Lihat pilihan Investasi lainnya',    4, false),
  ('Asuransi',     'Asuransi',     'Lihat pilihan Asuransi lainnya',     5, false)
on conflict (key) do update
  set label      = excluded.label,
      cta_label  = excluded.cta_label,
      sort_order = excluded.sort_order;

-- Seed produk ditulis sebagai "hapus lalu isi" supaya menjalankan ulang file
-- ini tidak menggandakan kartu.
delete from public.products;

insert into public.products (category_key, title, subtitle, image, sort_order) values
  ('Simpanan', 'Tahapan BCA',    'Tabungan andalan untuk transaksi sehari-hari', '/assets/product/card-simpanan-1.webp', 1),
  ('Simpanan', 'Tahapan Xpresi', 'Tabungan anak muda dengan kartu custom',       '/assets/product/card-simpanan-2.webp', 2),
  ('Simpanan', 'BCA Dollar',     'Simpanan valuta asing USD dan SGD',            '/assets/product/card-simpanan-3.webp', 3),

  ('Kartu Kredit', 'BCA Everyday Card',            'Tiap hari belanja, tiap hari untung', '/assets/product/card-everyday.webp',   1),
  ('Kartu Kredit', 'BCA Mastercard Black',         'Experience the ultimate privilege',   '/assets/product/card-mastercard.webp', 2),
  ('Kartu Kredit', 'BCA American Express Platinum','For the finest things in life',       '/assets/product/card-amex.webp',       3),

  ('Pinjaman', 'KPR BCA',             'Wujudkan rumah impian dengan bunga kompetitif', '/assets/product/card-everyday.webp',   1),
  ('Pinjaman', 'KKB BCA',             'Kredit kendaraan bermotor proses cepat',        '/assets/product/card-mastercard.webp', 2),
  ('Pinjaman', 'Kredit Tanpa Agunan', 'Dana cepat tanpa jaminan untuk kebutuhanmu',    '/assets/product/card-amex.webp',       3),

  ('Investasi', 'Reksa Dana BCA',   'Investasi mudah mulai dari Rp100 ribu',          '/assets/product/card-everyday.webp',   1),
  ('Investasi', 'Welma',            'Platform investasi & asuransi digital BCA',      '/assets/product/card-mastercard.webp', 2),
  ('Investasi', 'Obligasi Negara',  'Investasi surat utang dengan imbal hasil tetap', '/assets/product/card-amex.webp',       3),

  ('Asuransi', 'BCA Life Proteksi',   'Proteksi jiwa dengan premi terjangkau',   '/assets/product/card-everyday.webp',   1),
  ('Asuransi', 'Asuransi Kesehatan',  'Perlindungan biaya rumah sakit lebih tenang', '/assets/product/card-mastercard.webp', 2),
  ('Asuransi', 'Asuransi Kendaraan',  'Proteksi kendaraan dari risiko tak terduga',  '/assets/product/card-amex.webp',       3);

-- ------------------------------------------- pindah gambar ke Storage ----
-- Jalankan HANYA setelah semua .webp diunggah ke bucket `product-images`
-- (lihat langkah di supabase/README.md). Ganti <PROJECT_REF> dengan ref
-- proyekmu — bagian sebelum ".supabase.co" pada NEXT_PUBLIC_SUPABASE_URL.
--
-- update public.products
--    set image = replace(
--          image,
--          '/assets/product/',
--          'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/product-images/'
--        )
--  where image like '/assets/product/%';
