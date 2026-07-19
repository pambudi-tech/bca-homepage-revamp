-- News section (Kabar & Wawasan) — schema + seed.
-- Jalankan di Supabase dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempotent).

-- ---------------------------------------------------------------- tabel ----

-- Kanal = tab di section: News & Feature, EdukaTips, #AwasModus.
create table if not exists public.news_channels (
  -- key berupa slug (bukan identity) supaya gampang dirujuk manual dan tidak
  -- berubah kalau barisnya dihapus lalu dibuat lagi.
  key        text primary key,
  label      text    not null,
  sort_order int     not null default 0,
  is_active  boolean not null default true
);

create table if not exists public.news (
  id           bigint generated always as identity primary key,
  channel_key  text not null references public.news_channels(key) on delete cascade,
  title        text not null,
  -- Path relatif (/assets/news/x.webp) atau URL penuh ke Supabase Storage.
  image        text not null,
  -- Tanggal terbit. Disimpan sebagai date (bukan string) supaya urutan
  -- "terbaru dulu" ditentukan database; formatnya ("15 Jul 2026") dirender
  -- di sisi aplikasi, jadi tidak ada kolom tanggal tampilan yang perlu diisi.
  published_at date not null,
  -- Label kecil di sebelah tanggal ("Investasi", "Keamanan", ...). Bebas teks,
  -- bukan kanal — satu kanal bisa punya banyak label seperti ini.
  category     text not null,
  href         text not null,
  -- Artikel yang dipajang sebagai kartu besar di tab ini. Kalau tidak ada baris
  -- yang ditandai, aplikasi jatuh ke artikel terbaru — jadi kolom ini murni
  -- untuk "pin artikel lama ke atas", bukan sesuatu yang wajib diisi.
  is_highlight boolean not null default false,
  is_active    boolean not null default true,
  -- Satu artikel hanya boleh muncul sekali per kanal.
  unique (channel_key, href)
);

create index if not exists news_channel_date_idx
  on public.news (channel_key, published_at desc);

-- Untuk database yang sudah terlanjur dibuat sebelum kolom ini ada.
alter table public.news add column if not exists is_highlight boolean not null default false;

-- Satu kanal maksimal satu highlight: menandai artikel kedua akan ditolak,
-- jadi tidak mungkin ada dua kartu besar yang berebut di tab yang sama.
create unique index if not exists news_one_highlight_per_channel_idx
  on public.news (channel_key) where is_highlight;

-- ------------------------------------------------------------------ RLS ----
-- Homepage membaca lewat anon key, jadi baris aktif harus bisa dibaca publik.
-- Tidak ada policy insert/update/delete: perubahan hanya lewat dashboard
-- (service role), tidak pernah dari browser.

alter table public.news_channels enable row level security;
alter table public.news          enable row level security;

drop policy if exists "public read active news channels" on public.news_channels;
create policy "public read active news channels"
  on public.news_channels for select to anon, authenticated
  using (is_active);

drop policy if exists "public read active news" on public.news;
create policy "public read active news"
  on public.news for select to anon, authenticated
  using (is_active);

-- ----------------------------------------------------------------- seed ----
-- Isi yang sama dengan NEWS_CATEGORY_SEEDS di news-data.ts: 8 artikel terbaru
-- per kanal per 19 Jul 2026. Setelah ini artikel ditambah/diedit lewat
-- Table Editor.

insert into public.news_channels (key, label, sort_order) values
  ('news-and-features', 'News & Feature', 1),
  ('edukatips',         'EdukaTips',      2),
  ('awas-modus',        '#AwasModus',     3)
on conflict (key) do update
  set label      = excluded.label,
      sort_order = excluded.sort_order;

-- `on conflict do nothing` di unique (channel_key, href): menjalankan ulang
-- file ini tidak menggandakan artikel dan tidak menimpa editan manual.
-- is_highlight sengaja dibiarkan false untuk semua baris seed: default-nya
-- "artikel terbaru", dan pin diatur belakangan lewat Table Editor.
insert into public.news (channel_key, title, image, published_at, category, href) values
  -- News & Feature
  ('news-and-features', 'Fitur Bahasa Mandarin Kini Hadir di ATM BCA', '/assets/news/banner-news-1.webp', '2026-07-15', 'Informasi perbankan', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/15/14/50/fitur-bahasa-mandarin-kini-hadir-di-atm-bca'),
  ('news-and-features', 'Transaksi Virtual Account BCA di E-Commerce Semakin Cepat dan Praktis', '/assets/news/banner-news-2.webp', '2026-07-10', 'Informasi perbankan', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/10/08/29/transaksi-virtual-account-bca-di-e-commerce-semakin-cepat-dan-praktis'),
  ('news-and-features', 'Kenali Keunggulan Investasi ORI030 di BCA', '/assets/news/banner-news-3.webp', '2026-07-06', 'Investasi', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/06/08/34/kenali-keunggulan-investasi-ori030-di-bca'),
  ('news-and-features', 'BCA Business Case Competition 2026: Know the Market, Own the Game', '/assets/news/banner-news-4.webp', '2026-07-02', 'Event', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/02/15/19/bca-business-case-competition-2026-know-the-market-own-the-game'),
  ('news-and-features', 'Informasi Ketentuan Threshold Transaksi Valas', '/assets/news/banner-news-1.webp', '2026-07-01', 'Keuangan', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/01/11/45/informasi-ketentuan-threshold-transaksi-valas'),
  ('news-and-features', 'MASA Singapore 2026: BCA Dukung Penuh Gerakan Kreatif Indonesia', '/assets/news/banner-news-2.webp', '2026-07-01', 'Event', 'https://www.bca.co.id/id/informasi/news-and-features/2026/07/01/11/14/masa-singapore-2026-bca-dukung-penuh-gerakan-kreatif-indonesia'),
  ('news-and-features', 'Makin Praktis, Buka e-Deposito USD dan SGD Bisa melalui myBCA', '/assets/news/banner-news-3.webp', '2026-06-24', 'myBCA', 'https://www.bca.co.id/id/informasi/news-and-features/2026/06/24/15/00/makin-praktis-buka-e-deposito-usd-dan-sgd-bisa-melalui-mybca'),
  ('news-and-features', 'Fitur Notifikasi "Financial Diary" Hadir di BCA mobile untuk Seluruh Nasabah BCA', '/assets/news/banner-news-4.webp', '2026-06-19', 'BCA mobile', 'https://www.bca.co.id/id/informasi/news-and-features/2026/06/19/13/22/fitur-notifikasi-financial-diary-hadir-di-bca-mobile-untuk-seluruh-nasabah-bca'),

  -- EdukaTips
  ('edukatips', 'Beli Pulsa, Paket Data atau Bayar Tagihan Pascabayar? Bisa di e-Channel BCA!', '/assets/news/banner-news-1.webp', '2026-07-02', 'e-Channel', 'https://www.bca.co.id/id/informasi/edukatips/2026/07/02/16/41/beli-pulsa-paket-data-atau-bayar-tagihan-pascabayar-bisa-di-channel-bca'),
  ('edukatips', 'Investasi Hanya dengan Uang Saku, Bagaimana Caranya?', '/assets/news/banner-news-2.webp', '2026-06-29', 'Investasi', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/29/17/44/investasi-hanya-dengan-uang-saku-bagaimana-caranya'),
  ('edukatips', 'OTP Aman, Transaksi Online Nyaman', '/assets/news/banner-news-3.webp', '2026-06-25', 'Keamanan', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/25/15/14/otp-aman-transaksi-online-nyaman'),
  ('edukatips', 'Mau Mulai Investasi Reksa Dana? Pahami Cara Kerjanya Dulu Yuk!', '/assets/news/banner-news-4.webp', '2026-06-22', 'Investasi', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/22/08/34/mau-mulai-investasi-reksa-dana-pahami-cara-kerjanya-dulu-yuk'),
  ('edukatips', 'Langkah Mudah Mengatur Notifikasi di BCA mobile', '/assets/news/banner-news-1.webp', '2026-06-19', 'BCA mobile', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/19/14/11/langkah-mudah-mengatur-notifikasi-di-bca-mobile'),
  ('edukatips', 'Cara Mudah Buka Rekening Efek - RDN BCA Sekuritas di myBCA', '/assets/news/banner-news-2.webp', '2026-06-19', 'myBCA', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/19/10/23/cara-mudah-buka-rekening-efek-rdn-bca-sekuritas-di-mybca'),
  ('edukatips', 'e-Deposito Valas di myBCA: Solusi Simpan Dana Mata Uang Asing dari Genggaman', '/assets/news/banner-news-3.webp', '2026-06-18', 'myBCA', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/18/16/31/e-deposito-valas-di-mybca-solusi-simpan-dana-mata-uang-asing-dari-genggaman'),
  ('edukatips', 'Perlindungan Rumah itu Personal: Kenapa Setiap Orang Bisa Berbeda?', '/assets/news/banner-news-4.webp', '2026-06-18', 'Asuransi', 'https://www.bca.co.id/id/informasi/edukatips/2026/06/18/10/19/perlindungan-rumah-itu-personal-kenapa-setiap-orang-bisa-berbeda'),

  -- #AwasModus
  ('awas-modus', 'Hati-Hati Modus Penipuan Transaksi Mencurigakan dan Blokir Kartu Kredit Mengatasnamakan BCA', '/assets/news/banner-news-1.webp', '2026-06-22', 'Kartu Kredit', 'https://www.bca.co.id/id/informasi/awas-modus/2026/06/22/14/13/hati-hati-modus-penipuan-transaksi-mencurigakan-dan-blokir-kartu-kredit-mengatasnamakan-bca'),
  ('awas-modus', 'Modus Penipuan Paket Tertukar atau Hilang yang Perlu Diwaspadai', '/assets/news/banner-news-2.webp', '2026-06-09', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/06/09/16/57/modus-penipuan-paket-tertukar-atau-hilang-yang-perlu-diwaspadai'),
  ('awas-modus', 'Waspada Modus Penipuan melalui Email dalam Transaksi Internasional', '/assets/news/banner-news-3.webp', '2026-05-26', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/05/26/16/34/waspada-modus-penipuan-melalui-email-dalam-transaksi-internasional'),
  ('awas-modus', 'Transaksi yang Nyaman Dimulai dari Menjaga Data Perbankan', '/assets/news/banner-news-4.webp', '2026-04-28', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/04/28/10/20/transaksi-yang-nyaman-dimulai-dari-menjaga-data-perbankan'),
  ('awas-modus', 'Jaga Data Pribadi, Waspada Penipuan yang Mengatasnamakan Company Partner BCA!', '/assets/news/banner-news-1.webp', '2026-04-27', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/04/27/16/17/mengatasnamakan-copartner'),
  ('awas-modus', 'Waspada Nomor Halo BCA Palsu di Website Instansi', '/assets/news/banner-news-2.webp', '2026-04-13', 'Halo BCA', 'https://www.bca.co.id/id/informasi/awas-modus/2026/04/13/11/06/waspada-nomor-halo-bca-palsu-di-website-instansi'),
  ('awas-modus', 'Hindari Penipuan! Akses Informasi dan Channel Resmi BCA hanya dari bca.co.id', '/assets/news/banner-news-3.webp', '2026-03-17', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/03/17/16/16/hindari-penipuan-akses-informasi-dan-channel-resmi-bca-hanya-dari-bcacoid'),
  ('awas-modus', 'Finansial Aman, Mudik Nyaman: Waspada Modus Penipuan Lebaran 2026', '/assets/news/banner-news-4.webp', '2026-02-26', 'Keamanan', 'https://www.bca.co.id/id/informasi/awas-modus/2026/02/26/16/44/finansial-aman-mudik-nyaman-waspada-modus-penipuan-lebaran-2026')
on conflict (channel_key, href) do nothing;

-- --------------------------------------------------------- pin artikel ----
-- Memajang artikel tertentu sebagai kartu besar di tabnya (bukan yang terbaru).
-- Hapus dulu pin lama di kanal yang sama, karena indeks unik di atas hanya
-- mengizinkan satu highlight per kanal.
--
-- update public.news set is_highlight = false
--  where channel_key = 'edukatips' and is_highlight;
-- update public.news set is_highlight = true
--  where channel_key = 'edukatips' and href = '<url artikel>';

-- ------------------------------------------- pindah gambar ke Storage ----
-- Jalankan HANYA setelah semua banner diunggah ke bucket `news-images`
-- (pola yang sama dengan promo-section.sql). Ganti <PROJECT_REF> dengan ref
-- proyekmu — bagian sebelum ".supabase.co" pada NEXT_PUBLIC_SUPABASE_URL.
--
-- update public.news
--    set image = replace(image, '/assets/news/', 'https://<PROJECT_REF>.supabase.co/storage/v1/object/public/news-images/')
--  where image like '/assets/news/%';
