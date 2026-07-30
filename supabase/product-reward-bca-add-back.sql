-- Kembalikan "Reward BCA" ke product_categories — bukan sebagai katalog
-- produk (halaman resminya cuma satu program poin loyalti dari Kartu Kredit
-- BCA, lihat bca.co.id/id/individu/produk/reward-bca), tapi tetap sebagai
-- baris kategori aktif TANPA produk sama sekali.
--
-- Kode (Navbar.tsx, MobileMenu.tsx, ProductSection via src/lib/products.ts)
-- sudah diubah supaya sepenuhnya data-driven: kategori apa pun yang aktif di
-- tabel ini otomatis muncul di Product Section maupun tab navbar; tab hanya
-- dapat ikon chevron & bisa expand kalau kategori itu punya baris di
-- `products` — jadi "Reward BCA" (0 produk) akan tampil sebagai card, tapi
-- tabnya di navbar tidak bisa di-expand.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent).

insert into public.product_categories (key, label, sort_order, is_default, description) values
  ('Reward BCA', 'Reward BCA', 7, false, 'Kumpulkan dan tukar poin dari transaksi Kartu Kredit BCA')
on conflict (key) do update
  set label       = excluded.label,
      sort_order  = excluded.sort_order,
      description = excluded.description,
      is_active   = true;

-- Sengaja TIDAK mengisi tabel `products` untuk 'Reward BCA' — kalau nanti
-- BCA merilis produk bernama di bawah payung Reward BCA, tambahkan lewat
-- Table Editor; begitu ada >=1 baris produk aktif, tab navbar-nya otomatis
-- dapat chevron dan bisa expand (lihat NAV_TABS di Navbar.tsx).
