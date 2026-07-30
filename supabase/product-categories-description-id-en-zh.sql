-- Deskripsi (id/en/zh) untuk Wealth Management, Transaksi, dan Reward BCA —
-- tagline pendek, mengikuti pola kategori lain (Simpanan, Kartu Kredit, dst):
-- generik, bukan menyebut nama produk satu-satu.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent). description_en/description_zh no-op
-- kalau instalasi belum menjalankan product-i18n.sql.

update public.product_categories
   set description    = 'Investasi dan proteksi untuk masa depan finansial Anda',
       description_en = 'Investment and protection for your financial future',
       description_zh = '为您的财务未来提供投资与保障'
 where key = 'Wealth Management';

update public.product_categories
   set description    = 'Bayar, transfer, dan kirim uang lebih praktis',
       description_en = 'Pay, transfer, and send money more conveniently',
       description_zh = '让支付、转账与汇款更便捷'
 where key = 'Transaksi';

update public.product_categories
   set description    = 'Kumpulkan dan tukar poin dari setiap transaksi',
       description_en = 'Collect and redeem points from every transaction',
       description_zh = '积累并兑换每笔交易的积分'
 where key = 'Reward BCA';
