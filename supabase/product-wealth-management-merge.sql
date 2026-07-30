-- Gabungkan kategori Investasi + Asuransi -> "Wealth Management", dan tambah
-- kategori baru "Transaksi".
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent).
--
-- Jalankan SETELAH product-section.sql, product-featured.sql,
-- product-category-image.sql, product-i18n.sql.

-- ------------------------------------------------------- kategori baru ----

insert into public.product_categories (key, label, sort_order, is_default) values
  ('Wealth Management', 'Wealth Management', 4, false),
  ('Transaksi',         'Transaksi',         6, false)
on conflict (key) do update
  set label      = excluded.label,
      sort_order = excluded.sort_order;

-- --------------------------------------- pindahkan produk lama ke gabungan ----
-- Semua produk yang tadinya di Investasi/Asuransi ikut pindah ke
-- Wealth Management, tetap dengan sort_order & is_featured masing-masing.

update public.products
   set category_key = 'Wealth Management'
 where category_key in ('Investasi', 'Asuransi');

-- Investasi & Asuransi sekarang kosong -> nonaktifkan kategorinya supaya
-- tidak muncul dobel/kosong di Product Section (baris tidak dihapus, jadi
-- riwayat/id lama tetap ada kalau perlu dikembalikan).
update public.product_categories
   set is_active = false
 where key in ('Investasi', 'Asuransi');

-- -------------------------------------------- seed produk kategori baru ----
-- Transaksi belum punya produk -> section akan skip kategori kosong (lihat
-- getProductCategories di src/lib/products.ts), jadi diisi sesuai copy yang
-- sudah ada di messages/*.json ("megamenu.Transaksi"). Ganti lewat dashboard
-- Table Editor kapan saja.

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
select * from (values
  ('Transaksi', 'Flazz',      'Kartu prabayar untuk transaksi cepat sehari-hari', '/assets/product/card-simpanan-3.webp', 1, true),
  ('Transaksi', 'Firecash',   'Setor tarik tunai tanpa kartu di jaringan mitra',   '/assets/product/card-simpanan-2.webp', 2, true),
  ('Transaksi', 'Remittance', 'Kirim dan terima uang dari luar negeri',            '/assets/product/card-simpanan-1.webp', 3, true)
) as seed(category_key, title, subtitle, image, sort_order, is_featured)
where not exists (
  select 1 from public.products p where p.category_key = seed.category_key
);
