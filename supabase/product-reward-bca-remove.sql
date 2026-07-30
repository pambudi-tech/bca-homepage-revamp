-- Batalkan kategori "Reward BCA" — ternyata halaman resminya
-- (bca.co.id/id/individu/produk/reward-bca) cuma satu program poin loyalti
-- dari Kartu Kredit BCA, bukan kumpulan produk terpisah, jadi tidak pantas
-- jadi kategori yang bisa di-expand di Product Section / Megamenu.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent).

delete from public.megamenu_links     where category_key = 'Reward BCA';
delete from public.megamenu_editorial where category_key = 'Reward BCA';
delete from public.products           where category_key = 'Reward BCA';
delete from public.product_categories where key = 'Reward BCA';
