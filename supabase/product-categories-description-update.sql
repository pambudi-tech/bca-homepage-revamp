-- Deskripsi kategori "Wealth Management" & "Transaksi", ditulis berdasarkan
-- produk yang benar-benar ada di masing-masing kategori setelah migrasi
-- sebelumnya (product-wealth-management-simplify-asuransi.sql,
-- product-transaksi-fix-products.sql):
--   Wealth Management: Reksa Dana, Obligasi, Asuransi, RDN, RDL
--   Transaksi:         Flazz, Firecash, Remittance
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent). No-op untuk kolom description_en/zh
-- kalau instalasi belum menjalankan product-category-image.sql /
-- product-i18n.sql.

update public.product_categories
   set description    = 'Kembangkan dana lewat Reksa Dana dan Obligasi, amankan transaksi investasi dengan RDN, serta lindungi masa depan Anda dengan Asuransi',
       description_en = 'Grow your funds with Mutual Funds and Bonds, secure investment transactions with an RDN, and protect your future with Insurance',
       description_zh = '通过共同基金和债券增长资金，用RDN账户保障投资交易安全，并通过保险守护您的未来'
 where key = 'Wealth Management';

update public.product_categories
   set description    = 'Bayar praktis dengan Flazz, setor tarik tunai lewat Firecash, dan kirim uang ke luar negeri dengan Remittance',
       description_en = 'Pay conveniently with Flazz, deposit and withdraw cash via Firecash, and send money abroad with Remittance',
       description_zh = '使用Flazz便捷支付，通过Firecash存取现金，并使用Remittance汇款至海外'
 where key = 'Transaksi';
