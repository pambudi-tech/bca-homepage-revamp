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

Kolom yang perlu diketahui:

- `sort_order` — urutan tampil. Kategori mengatur urutan daftar di kiri (desktop)
  dan chip (mobile); produk mengatur urutan kartu.
- `is_default` — kategori yang terbuka saat halaman pertama dimuat. Hanya boleh
  satu baris `true`; sudah dijaga unique index.
- `is_active` — set `false` untuk menyembunyikan tanpa menghapus.

RLS menyala dengan policy **read-only untuk publik**. Tidak ada policy tulis,
jadi anon key yang ada di browser tidak bisa mengubah apa pun — perubahan hanya
lewat dashboard.

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
