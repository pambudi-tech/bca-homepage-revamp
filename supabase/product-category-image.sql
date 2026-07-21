-- Foto & deskripsi kategori untuk layout "Accordion Cards" homepage.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).
--
-- Latar belakang: layout Accordion tidak lagi menampilkan produk, melainkan
-- KATEGORI (Simpanan, Kartu Kredit, Pinjaman, e-Banking, Investasi, Asuransi) —
-- enam kartu berjajar selebar 1280px. Tiap kartu butuh foto + deskripsi singkat,
-- yang belum ada di tabel `product_categories`.

-- ---------------------------------------------------------------- kolom ----

alter table public.product_categories
  add column if not exists image       text,
  add column if not exists description text;

comment on column public.product_categories.image is
  'Foto kartu kategori di layout Accordion. Path relatif (/assets/product/x.webp) atau URL Storage.';
comment on column public.product_categories.description is
  'Deskripsi singkat kategori, tampil saat kartu Accordion melebar.';

-- ------------------------------------------------------------- backfill ----
-- Kolom baru default null, yang berarti tanpa langkah ini kartu Accordion tampil
-- tanpa foto. Sementara belum ada aset khusus kategori, arahkan ke enam foto
-- contoh yang sudah ada (dari Simpanan & Kartu Kredit).
--
-- `where image is null` per kategori: hanya mengisi yang masih kosong, sehingga
-- menjalankan ulang file ini tidak menimpa foto yang sudah diatur lewat Table
-- Editor. Kategori 'e-Banking' ikut di-seed kalau belum ada.

insert into public.product_categories (key, label, cta_label, sort_order, is_default) values
  ('e-Banking', 'e-Banking', 'Lihat pilihan e-Banking lainnya', 4, false)
on conflict (key) do nothing;

update public.product_categories c
   set image       = coalesce(c.image, v.image),
       description = coalesce(c.description, v.description)
  from (values
    ('Simpanan',     '/assets/product/card-simpanan-1.webp', 'Tabungan & deposito untuk setiap kebutuhan'),
    ('Kartu Kredit', '/assets/product/card-everyday.webp',   'Kartu untuk gaya hidup dan setiap transaksi'),
    ('Pinjaman',     '/assets/product/card-mastercard.webp', 'Solusi pembiayaan rumah, kendaraan, dan usaha'),
    ('e-Banking',    '/assets/product/card-simpanan-2.webp', 'Perbankan digital dalam satu genggaman'),
    ('Investasi',    '/assets/product/card-amex.webp',       'Kembangkan dana lewat beragam instrumen'),
    ('Asuransi',     '/assets/product/card-simpanan-3.webp', 'Proteksi menyeluruh untuk Anda dan keluarga')
  ) as v(key, image, description)
 where c.key = v.key;

-- Produk contoh untuk kategori e-Banking (curved carousel & carousel mobile
-- masih menampilkan produk per kategori). Hanya jalan kalau kategori ini belum
-- punya produk sama sekali.
insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
select * from (values
  ('e-Banking', 'myBCA',      'Super app perbankan digital dalam satu aplikasi', '/assets/product/card-simpanan-1.webp', 1, true),
  ('e-Banking', 'BCA mobile', 'Transaksi praktis langsung dari ponsel',          '/assets/product/card-simpanan-2.webp', 2, true),
  ('e-Banking', 'KlikBCA',    'Internet banking untuk kebutuhan harian',         '/assets/product/card-simpanan-3.webp', 3, true)
) as seed(category_key, title, subtitle, image, sort_order, is_featured)
where not exists (
  select 1 from public.products where category_key = 'e-Banking'
);

-- ------------------------------------------------------------- verifikasi ----
-- select key, label, image, description from public.product_categories
--  where is_active order by sort_order;
