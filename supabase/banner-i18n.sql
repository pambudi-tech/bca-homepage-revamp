-- Tambah dukungan multi-bahasa (EN, ZH) ke tabel `banners`.
--
-- Pola: kolom asli (title, alt, cta_label) tetap jadi versi Indonesia (default).
-- Kolom baru `_en` dan `_zh` opsional — kalau kosong, kode di `src/lib/banners.ts`
-- otomatis jatuh balik ke versi Indonesia, jadi banner yang belum diterjemahkan
-- tidak pernah tampil kosong.

alter table banners
  add column if not exists title_en text,
  add column if not exists title_zh text,
  add column if not exists alt_en text,
  add column if not exists alt_zh text,
  add column if not exists cta_label_en text,
  add column if not exists cta_label_zh text;

-- Isi terjemahan untuk 3 banner yang sudah ada, dicocokkan lewat `title`
-- (versi Indonesia) supaya aman dijalankan tanpa perlu tahu id barisnya.

update banners set
  title_en = 'Achieve Financial Freedom Sooner with BCA',
  title_zh = '与BCA一起更早实现财务自由',
  alt_en = 'BCA Family',
  alt_zh = 'BCA家庭',
  cta_label_en = 'Download myBCA',
  cta_label_zh = '下载 myBCA'
where title = 'Capai Kebebasan Finansial Lebih Dini bersama BCA';

update banners set
  title_en = 'BCA Presale: The Weeknd "After Hours Til Dawn Tour" - Jakarta',
  title_zh = 'BCA 预售：The Weeknd「After Hours Til Dawn Tour」- 雅加达',
  alt_en = 'BCA Presale The Weeknd',
  alt_zh = 'BCA 预售 The Weeknd',
  cta_label_en = 'Get Tickets',
  cta_label_zh = '获取门票'
where title = 'BCA Presale : The Weeknd "After Hour Til Down Tour" - Jakarta';

update banners set
  title_en = 'Keep Saving to Chase myBCA JRF 2026 Tickets!',
  title_zh = '持续储蓄，冲刺 myBCA JRF 2026 门票！',
  alt_en = 'Keep Saving to Chase myBCA JRF 2026 Tickets',
  alt_zh = '持续储蓄冲刺 myBCA JRF 2026 门票',
  cta_label_en = 'Learn More',
  cta_label_zh = '了解更多'
where title = 'Terus Nabung buat Kejar Tiket myBCA JRF 2026!';
