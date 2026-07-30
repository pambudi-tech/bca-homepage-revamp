-- Samakan "Asuransi" di Wealth Management dengan struktur asli
-- bca.co.id/id/individu/produk/investasi-dan-asuransi: Investasi tampil
-- sebagai 4 produk bernama (Reksa Dana, Obligasi, RDN, RDL), tapi Asuransi
-- cuma satu link/kategori tunggal ("Cari tahu tentang Asuransi" -> halaman
-- Bancassurance) — bukan daftar 9 produk asuransi bernama.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Jalankan SETELAH product-wealth-management-merge.sql.
-- Aman dijalankan ulang (idempotent).

-- Buang semua baris "Asuransi <sesuatu>" yang tersisa di Wealth Management —
-- hasil migrasi dari kategori "Asuransi" lama.
delete from public.products
 where category_key = 'Wealth Management'
   and title like 'Asuransi%';

-- Satu baris pengganti: "Asuransi" saja, sort_order setelah Obligasi supaya
-- urutannya sama dengan halaman resmi (Reksa Dana, Obligasi, Asuransi, RDN, RDL).
insert into public.products (category_key, title, subtitle, image, sort_order, is_featured)
select 'Wealth Management', 'Asuransi', 'Cari tahu tentang Asuransi', '/assets/product/card-amex.webp', 3, true
where not exists (
  select 1 from public.products
   where category_key = 'Wealth Management' and title = 'Asuransi'
);

-- Rapikan sort_order sisa produk (RDN/RDL) supaya tetap berurutan setelah
-- baris "Asuransi" yang baru — no-op kalau sudah begini.
update public.products set sort_order = 4
 where category_key = 'Wealth Management' and title = 'Rekening Dana Nasabah (RDN)';
update public.products set sort_order = 5
 where category_key = 'Wealth Management' and title = 'Rekening Dana Lender (RDL) BCA';

-- Terjemahan EN/ZH untuk baris "Asuransi" baru. No-op kalau kolom title_en/dst
-- belum ada (lihat product-i18n.sql).
update public.products
   set title_en    = 'Insurance',
       title_zh    = '保险',
       subtitle_en = 'Learn more about Insurance',
       subtitle_zh = '了解更多保险信息'
 where category_key = 'Wealth Management' and title = 'Asuransi';
