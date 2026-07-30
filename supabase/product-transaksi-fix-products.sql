-- Ganti isi placeholder kategori "Transaksi" (QRIS, BCA mobile, Virtual
-- Account BCA — sisa dari seed awal) dengan Flazz, Firecash, Remittance,
-- sesuai copy yang sudah ada di messages/*.json ("megamenu.Transaksi").
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Jalankan SETELAH product-wealth-management-merge.sql.
-- Aman dijalankan ulang (idempotent).

delete from public.products where category_key = 'Transaksi';

insert into public.products (category_key, title, subtitle, image, sort_order, is_featured, title_en, title_zh, subtitle_en, subtitle_zh)
values
  ('Transaksi', 'Flazz',      'Kartu prabayar untuk transaksi cepat sehari-hari',   '/assets/product/card-simpanan-3.webp', 1, true,
    'Flazz',      'Flazz',   'A prepaid card for fast everyday transactions',        '日常快捷交易的预付卡'),
  ('Transaksi', 'Firecash',   'Setor tarik tunai tanpa kartu di jaringan mitra',     '/assets/product/card-simpanan-2.webp', 2, true,
    'Firecash',   'Firecash','Cardless deposit & withdrawal at partner networks',    '在合作网点无卡存取款'),
  ('Transaksi', 'Remittance', 'Kirim dan terima uang dari luar negeri',              '/assets/product/card-simpanan-1.webp', 3, true,
    'Remittance', '汇款',    'Send and receive money from abroad',                   '收发境外汇款');
