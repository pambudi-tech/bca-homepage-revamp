-- Lengkapi image, label_en, label_zh untuk Wealth Management, Transaksi, dan
-- Reward BCA — tiga kolom ini masih kosong sejak kategorinya dibuat.
--
-- Catatan soal `image`: untuk Wealth Management & Transaksi ini cuma
-- pemanis/konsistensi — foto kartu yang benar-benar tampil di Product
-- Section masih diprioritaskan dari MEGAMENU_CATEGORY_IMAGES (megamenu-data.ts)
-- selama kategorinya ada di MEGAMENU_STRUCTURE (lihat ProductSection.tsx).
-- Untuk Reward BCA (tidak ada di MEGAMENU_STRUCTURE), kolom `image` di sini
-- yang benar-benar dipakai.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent). label_en/label_zh no-op kalau instalasi
-- belum menjalankan product-i18n.sql; image no-op kalau belum menjalankan
-- product-category-image.sql.

update public.product_categories
   set image    = '/assets/category/asuransi.webp',
       label_en = 'Wealth Management',
       label_zh = '财富管理'
 where key = 'Wealth Management';

update public.product_categories
   set image    = '/assets/category/simpanan.webp',
       label_en = 'Transactions',
       label_zh = '交易'
 where key = 'Transaksi';

update public.product_categories
   set image    = '/assets/category/kartu-kredit.webp',
       label_en = 'BCA Rewards',
       label_zh = 'BCA奖励'
 where key = 'Reward BCA';
