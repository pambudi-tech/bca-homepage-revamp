# Dataset Lokasi BCA

Section **Lokasi BCA** di homepage tidak memanggil API apa pun saat halaman
dibuka. Semua datanya berasal dari satu file yang ikut di-commit:

```
src/data/bca-locations.json
```

File itu dibuat oleh [`fetch-bca-locations.mjs`](./fetch-bca-locations.mjs) dan
hanya perlu dijalankan ulang kalau datanya mau disegarkan — bukan saat build,
bukan saat request.

## Dari mana datanya

| Sumber                        | Untuk apa                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| Overpass API (OpenStreetMap)  | Titik ATM & cabang BCA — koordinat, jenis, jam buka kalau ada |
| Nominatim (OpenStreetMap)     | Nama kelurahan / kecamatan / kota untuk tiap titik            |

Nominatim dipakai karena tag alamat di OSM terlalu bolong (sekitar 20% terisi,
itu pun sering cuma nama jalan). Padahal nama area itulah yang dicari orang di
kolom pencarian section ini — indeks pencarian dibangun dari kolom `area`,
`district` dan `city`, jadi kalau kosong, ketik "Kelapa Gading" tidak ketemu
apa-apa.

> **Lisensi.** Data OpenStreetMap, ODbL. Atribusinya sudah tampil di pojok peta
> (OpenFreeMap · OpenMapTiles · OpenStreetMap) — jangan dihapus.

## Menjalankan ulang

```bash
node scripts/fetch-bca-locations.mjs
```

Dua fase, berurutan:

1. **Overpass** — 18 kotak kota (Jabodetabek, Bandung, Semarang, Yogyakarta,
   Solo, Surabaya, Malang, Denpasar, Medan, Palembang, Makassar, Balikpapan,
   Batam, Pekanbaru). Sekitar 5–15 menit, tergantung seberapa sibuk servernya.
2. **Nominatim** — satu request per titik, dibatasi 1 request/detik sesuai
   [usage policy](https://operations.osmfoundation.org/policies/nominatim/)
   mereka. Sekitar 15 menit untuk ~800 titik pada run pertama.

Hasil fase 2 disimpan di `.cache/nominatim-reverse.json` (gitignored), jadi run
berikutnya nyaris instan di fase itu. Kalau script mati di tengah jalan, tinggal
jalankan lagi — yang sudah ke-cache tidak diulang.

### Kalau ada kota yang gagal

Overpass sering balas `429` atau `504` kalau lagi ramai. Script sudah retry 3×
sambil gantian ke mirror lain, tapi kadang tetap menyerah dan kota itu pulang
dengan `0 POIs`. Jangan jalankan ulang semuanya — tambal kotanya saja:

```bash
node scripts/fetch-bca-locations.mjs --only=Semarang,Makassar
```

Mode ini **menggabungkan** hasilnya ke dataset yang sudah ada (dicocokkan lewat
OSM id), jadi kota-kota lain tidak ikut hilang kalau kali ini yang gagal
kebetulan kota yang tadinya berhasil.

## Menambah kota

Tambah satu baris di konstanta `CITIES` di dalam script — `bbox` urutannya
`[south, west, north, east]`, sama seperti yang diminta Overpass:

```js
{ city: "Manado", bbox: [1.42, 124.78, 1.55, 124.92] },
```

Lalu jalankan `--only=Manado`.

## Yang perlu diketahui soal isinya

- Nama POI di OSM hampir selalu cuma `"BCA"` atau `"ATM BCA"` — tidak ada nama
  cabang resmi (KCU/KCP). Karena itu judul kartu diambil dari alamat, bukan dari
  nama; jenisnya dibawa badge "Cabang"/"ATM". Lihat `locationLines()` di
  `src/components/home/location-data.ts`.
- `hours` berisi string `opening_hours` mentah dari OSM dan sering kosong. Yang
  ditampilkan hanya pola sederhana (`Mo-Fr 08:00-15:00`, `24/7`); selain itu
  barisnya tidak ditampilkan sama sekali daripada menampilkan hasil parsing
  setengah jadi.
- Jarak di kartu adalah garis lurus (haversine), bukan jarak tempuh.
- Cakupannya kota besar, bukan seluruh Indonesia. Ini memang quick finder di
  homepage — direktori lengkapnya ada di
  [bca.co.id/id/lokasi-bca](https://www.bca.co.id/id/lokasi-bca), yang jadi
  tujuan tombol "Lihat semua lokasi BCA".
