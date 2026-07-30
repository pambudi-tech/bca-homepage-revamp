-- Hapus permanen baris "Investasi" dan "Asuransi" dari product_categories.
-- Jalankan HANYA kalau Anda yakin tidak perlu mengembalikannya lagi —
-- product-wealth-management-merge.sql sudah memindahkan semua produknya ke
-- "Wealth Management" dan menonaktifkan (is_active = false) dua baris ini,
-- jadi keduanya sudah tidak tampil di homepage; file ini cuma membersihkan
-- sisa barisnya dari Table Editor.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.

delete from public.product_categories where key in ('Investasi', 'Asuransi');
