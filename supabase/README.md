# Supabase — Produk & Layanan

Section Produk mengambil kategori dan kartu produknya dari Supabase, dengan pola
yang sama seperti `banners` dan `kurs`: REST API bawaan Supabase dipanggil lewat
`fetch` biasa dari server component, tanpa dependency tambahan.

Kalau Supabase mati atau env belum diisi, section otomatis jatuh balik ke data
bawaan di `src/components/home/product-data.ts` — jadi halaman tidak pernah
kosong, dan langkah-langkah di bawah aman dikerjakan bertahap.

## Langkah 1 — buat tabel dan isi datanya

1. Buka dashboard Supabase → **SQL Editor** → **New query**.
2. Tempel seluruh isi [`product-section.sql`](./product-section.sql), lalu **Run**.

Yang dibuat:

| Tabel                | Isi                                                        |
| -------------------- | ---------------------------------------------------------- |
| `product_categories` | Simpanan, Kartu Kredit, Pinjaman, Investasi, Asuransi       |
| `products`           | 3 kartu per kategori (judul, subjudul, gambar)              |

Yang dibuat:

| Tabel    | Isi                                                          |
| -------- | ------------------------------------------------------------ |
| `brands` | Pemilik promo — nama + logo. Satu brand bisa punya banyak promo |
| `promos` | Kartu promo — judul, cover, periode, `brand_id`               |

Logo ada di `brands`, bukan di `promos`: ganti logo sekali, semua promo brand
itu ikut. `cover` tetap per promo.

Kolom yang perlu diketahui:

- `sort_order` — urutan tampil. Kategori mengatur urutan daftar di kiri (desktop)
  dan chip (mobile); produk mengatur urutan kartu.
- `is_default` — kategori yang terbuka saat halaman pertama dimuat. Hanya boleh
  satu baris `true`; sudah dijaga unique index.
- `is_active` — set `false` untuk menyembunyikan tanpa menghapus.
- `is_featured` — produk yang tampil di layout **Accordion** (dan carousel
  mobile), yang hanya punya 3 slot. Lihat bagian di bawah.

RLS menyala dengan policy **read-only untuk publik**. Tidak ada policy tulis,
jadi anon key yang ada di browser tidak bisa mengubah apa pun — perubahan hanya
lewat dashboard.

### Memilih 3 produk untuk layout Accordion

Satu kategori boleh punya berapa pun produk. Layout **Curved Carousel** memutar
semuanya; layout **Accordion** hanya punya ruang untuk 3 kartu. Kolom
`is_featured` yang memilih ketiganya — jadi menambah produk baru tidak otomatis
merusak layout accordion.

1. SQL Editor → New query → tempel [`product-featured.sql`](./product-featured.sql) → **Run**.
   File itu menambah kolomnya dan langsung menandai 3 produk dengan `sort_order`
   terkecil di tiap kategori, jadi tampilan tidak berubah setelah dijalankan.
2. Ganti pilihan lewat **Table Editor → products**: centang/hapus centang
   `is_featured`.

Batas 3 per kategori ditegakkan lewat trigger di database — mencentang yang
keempat akan ditolak dengan pesan yang menyebut kategorinya. Hapus centang salah
satu dulu. Ini disengaja: tanpa penjaga itu, kartu keempat akan tersimpan rapi
tapi tidak pernah muncul di mana pun.

> Kalau `product-featured.sql` belum dijalankan, halaman tetap normal — query
> otomatis mengulang tanpa kolom itu, dan accordion memakai 3 produk pertama.

## Langkah 2 — cek halaman

```
npm run dev
```

Buka homepage. Kalau kartu Produk masih tampil normal, berarti sambungan sudah
jalan. Untuk memastikan datanya benar-benar dari database (bukan fallback),
ubah satu judul di **Table Editor → products**, tunggu ±5 menit atau restart dev
server, lalu muat ulang.

> Data di-cache 5 menit (`revalidate: 300` di `src/lib/products.ts`). Jadi
> perubahan di dashboard tidak langsung muncul — itu memang disengaja.

## Langkah 3 — pindahkan gambar ke Storage

Sampai sini gambar masih dari `/public/assets/product/`. Untuk memindahkannya:

1. Dashboard → **Storage** → **New bucket**.
   - Name: `product-images`
   - **Public bucket: ON** ← wajib, kalau tidak gambarnya tidak bisa dimuat browser.
2. Masuk ke bucket itu → **Upload files**, unggah semua `.webp` dari
   `public/assets/product/`:
   `card-everyday.webp`, `card-mastercard.webp`, `card-amex.webp`,
   `card-simpanan-1.webp`, `card-simpanan-2.webp`, `card-simpanan-3.webp`.
3. Klik salah satu file → **Get URL**, pastikan bentuknya:
   `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/product-images/card-amex.webp`
4. Buka lagi SQL Editor, jalankan blok `UPDATE` di bagian paling bawah
   `product-section.sql` (masih dikomentari) setelah `<PROJECT_REF>` diganti.
   `<PROJECT_REF>` adalah bagian sebelum `.supabase.co` pada
   `NEXT_PUBLIC_SUPABASE_URL` di `.env.local`.
5. Muat ulang halaman dan pastikan gambar tetap muncul.

Kalau ada yang gagal muat, kolom `image` bisa dikembalikan ke path `/assets/...`
kapan saja — file di `public/` sengaja tidak dihapus.

### Menambah produk baru setelah ini

Unggah gambarnya ke bucket, salin URL publiknya, lalu tambah baris di
**Table Editor → products** dengan `category_key` yang sesuai. Tidak perlu
deploy.

> Catatan: kartu memakai `<img>` biasa, bukan `next/image`, jadi tidak ada
> `remotePatterns` yang perlu didaftarkan di `next.config.ts`. Kalau nanti
> pindah ke `next/image`, domain Supabase harus ditambahkan di sana.

---

# Supabase — Promo

Section Promo memakai pola yang sama: dibaca dari tabel `promos` (dengan brand
di-embed dari tabel `brands`) lewat REST API
Supabase di server component, dan jatuh balik ke `PROMO_SEEDS` di
`src/components/home/promo-data.ts` kalau Supabase mati atau env belum diisi.

## Langkah 1 — buat tabel dan isi datanya

1. Dashboard Supabase → **SQL Editor** → **New query**.
2. Tempel seluruh isi [`promo-section.sql`](./promo-section.sql), lalu **Run**.

Yang dibuat:

| Tabel    | Isi                                                          |
| -------- | ------------------------------------------------------------ |
| `brands` | Pemilik promo — nama + logo. Satu brand bisa punya banyak promo |
| `promos` | Kartu promo — judul, cover, periode, `brand_id`               |

Logo ada di `brands`, bukan di `promos`: ganti logo sekali, semua promo brand
itu ikut. `cover` tetap per promo.

Kolom yang perlu diketahui:

- `start_at` / `end_at` — periode promo (`timestamptz`). **Badge di kartu
  dihitung dari dua kolom ini**, bukan diisi manual:

  | Kondisi                          | Badge             |
  | -------------------------------- | ----------------- |
  | `end_at` sudah lewat             | Kadaluarsa        |
  | `start_at` < 3 hari lagi         | Segera Hadir      |
  | `end_at` < 24 jam lagi           | Segera Berakhir!  |
  | `redeem_count` ≥ 1000            | Populer           |
  | `start_at` baru lewat ≤ 3 hari   | Promo Baru        |
  | selain itu                       | tanpa badge       |

  Urutan di tabel itu juga urutan prioritasnya — promo yang sudah berakhir
  selalu "Kadaluarsa" walaupun `redeem_count`-nya tinggi.
- `redeem_count` — jumlah redeem dari analytics. Ambangnya diatur lewat
  `POPULAR_REDEEM_THRESHOLD` di `src/components/home/promo-data.ts` (default
  1000), bukan di database — jadi menaikkan/menurunkan standar "Populer" cukup
  ubah satu angka, tanpa menyentuh data.
- `sort_order` — urutan kartu di carousel.
- `is_active` — set `false` untuk menyembunyikan tanpa menghapus.

Seed memakai tanggal relatif terhadap saat query dijalankan, supaya semua jenis
badge langsung kelihatan. Sesudah itu edit periodenya lewat **Table Editor**.

RLS menyala dengan policy **read-only untuk publik**, sama seperti tabel produk.

## Langkah 2 — cek halaman

`npm run dev`, buka homepage. Untuk memastikan datanya dari database, ubah satu
judul di **Table Editor → promos**, lalu restart dev server (data di-cache 5
menit lewat `revalidate: 300` di `src/lib/promos.ts`).

## Langkah 3 — pindahkan gambar ke Storage

1. Dashboard → **Storage** → **New bucket**, name `promo-images`,
   **Public bucket: ON**.
2. Unggah semua file dari `public/assets/promo/` yang dipakai kartu:
   `card1-cover.webp` … `card7-cover.webp` dan `card1-logo.png` … `card7-logo.png`.
3. Jalankan **dua** blok `UPDATE` di bagian bawah `promo-section.sql` (masih
   dikomentari) setelah `<PROJECT_REF>` diganti — satu untuk `promos.cover`,
   satu untuk `brands.logo`.

### Menambah promo baru

1. Kalau brand-nya belum ada: **Table Editor → brands**, tambah baris dengan
   `id` slug (mis. `starbucks`), `name`, dan `logo`.
2. **Table Editor → promos**, tambah baris dengan `id` slug unik (mis.
   `diskon-starbucks`), `brand_id` menunjuk ke brand tadi, `cover`,
   `start_at`/`end_at`, dan `sort_order` sesuai posisi yang diinginkan.

Tidak perlu deploy. Brand yang masih dipakai promo tidak bisa dihapus
(`on delete restrict`) — hapus promonya dulu.
