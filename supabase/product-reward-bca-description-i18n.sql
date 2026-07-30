-- Lengkapi description_en/description_zh untuk "Reward BCA" — kelewatan di
-- product-reward-bca-add-back.sql, yang cuma mengisi kolom description
-- (Indonesia) saja.
--
-- Jalankan di Supabase dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan ulang (idempotent). No-op kalau instalasi belum
-- menjalankan product-i18n.sql (kolom description_en/zh belum ada).

update public.product_categories
   set description_en = 'Collect and redeem points from BCA Credit Card transactions',
       description_zh = '积累并兑换BCA信用卡交易积分'
 where key = 'Reward BCA';
