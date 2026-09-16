-- Update konten kategori Produk & Layanan berdasarkan revisi klien.
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent).
--
-- Key internal `Simpanan` sengaja dipertahankan agar foreign key produk lama
-- tetap aman; hanya label yang tampil diubah menjadi `Tabungan`.

begin;

-- Pastikan kategori Investasi dan Asuransi tersedia kembali sebelum produk
-- dipindahkan keluar dari Wealth Management.
insert into public.product_categories
  (key, label, label_en, label_zh, description, description_en, description_zh, image, sort_order, is_default, is_active)
values
  (
    'Investasi',
    'Investasi',
    'Investment',
    '投资',
    'Pilihan investasi untuk mendukung rencana finansial.',
    'Investment options to support your financial plans.',
    '支持财务规划的多种投资选择。',
    '/assets/category/investasi.webp',
    5,
    false,
    true
  ),
  (
    'Asuransi',
    'Asuransi',
    'Insurance',
    '保险',
    'Perlindungan asuransi untuk diri, keluarga, dan aset.',
    'Insurance protection for you, your family, and your assets.',
    '为个人、家庭和资产提供保险保障。',
    '/assets/category/asuransi.webp',
    6,
    false,
    true
  )
on conflict (key) do update
set label          = excluded.label,
    label_en       = excluded.label_en,
    label_zh       = excluded.label_zh,
    description    = excluded.description,
    description_en = excluded.description_en,
    description_zh = excluded.description_zh,
    image          = excluded.image,
    sort_order     = excluded.sort_order,
    is_active      = true;

-- Pulihkan kepemilikan produk yang sebelumnya digabung ke Wealth Management.
update public.products
   set category_key = 'Asuransi'
 where category_key = 'Wealth Management'
   and title ilike 'Asuransi%';

update public.products
   set category_key = 'Investasi'
 where category_key = 'Wealth Management';

-- Wealth Management tidak lagi ditampilkan, tetapi barisnya tidak dihapus
-- agar histori dan relasi lama tetap dapat ditelusuri.
update public.product_categories
   set is_active = false,
       is_default = false
 where key = 'Wealth Management';

-- Reward BCA tidak ada dalam daftar kategori terbaru dari klien. Barisnya
-- tetap disimpan dan hanya disembunyikan dari Product Section.
update public.product_categories
   set is_active = false,
       is_default = false
 where key = 'Reward BCA';

-- Copy kategori terbaru untuk ID, EN, dan ZH. Urutan mengikuti daftar klien.
update public.product_categories
   set label          = 'Tabungan',
       label_en       = 'Savings',
       label_zh       = '储蓄',
       description    = 'Pilihan tabungan untuk berbagai kebutuhan finansial.',
       description_en = 'Savings options for various financial needs.',
       description_zh = '满足各种财务需求的储蓄选择。',
       image           = '/assets/category/tabungan.webp',
       sort_order      = 1,
       is_active       = true
 where key = 'Simpanan';

update public.product_categories
   set description    = 'Beragam kartu kredit untuk transaksi dan kebutuhan pembayaran.',
       description_en = 'A range of credit cards for transactions and payment needs.',
       description_zh = '满足交易和支付需求的多种信用卡选择。',
       sort_order      = 2,
       is_active       = true
 where key = 'Kartu Kredit';

update public.product_categories
   set description    = 'Solusi pinjaman untuk kebutuhan rumah, usaha, dan kendaraan.',
       description_en = 'Loan solutions for home, business, and vehicle needs.',
       description_zh = '满足住房、经营和购车需求的贷款解决方案。',
       sort_order      = 3,
       is_active       = true
 where key = 'Pinjaman';

update public.product_categories
   set description    = 'Layanan e-banking untuk transaksi digital yang lebih praktis.',
       description_en = 'E-banking services for more convenient digital transactions.',
       description_zh = '让数字交易更便捷的电子银行服务。',
       sort_order      = 4,
       is_active       = true
 where key = 'e-Banking';

update public.product_categories
   set description    = 'Layanan transaksi untuk transfer, pembayaran, dan kebutuhan sehari-hari.',
       description_en = 'Transaction services for transfers, payments, and everyday needs.',
       description_zh = '满足转账、支付和日常需求的交易服务。',
       sort_order      = 7,
       is_active       = true
 where key = 'Transaksi';

commit;

-- Verifikasi hasil:
-- select key, label, label_en, label_zh, description, description_en,
--        description_zh, image, sort_order, is_active
--   from public.product_categories
--  order by sort_order;
