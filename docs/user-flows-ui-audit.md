# Audit UI User Flows — 12 Oktober 2026

Seluruh **16 flow / 105 case** ditinjau terhadap komponen, halaman pemilik, kondisi dan hasilnya. Layout saat ini memiliki **3 tahap / 315 state aktif**. Hash lama tahap `3` diarahkan ke hasil tahap `2`.

## Hasil verifikasi

- **630 render**: seluruh 315 tahap pada desktop 1344×978 dan mobile 390×844; viewport sumber 1440px/390px.
- **200 render Solitaire tambahan**: 100 pasangan scene/state berbeda pada kedua perangkat.
- Semua 830 pemeriksaan cocok dengan case, tahap, scene, state, lebar sumber dan brand preview; satu subtree inert; crop terukur; tanpa overflow halaman atau aset terlihat yang rusak. Bounds menu/dialog terpusat diperiksa. Panel layar penuh dan modul panjang boleh digulir.
- Screenshot terpilih diperiksa secara visual untuk Complimentary, bahasa, tab Event, login/gate, OTP, voucher, medical, banking, dokumen, cabang dan menu akun.
- Lint: 0 error / 124 warning. Typecheck: 0 error. Build produksi Webpack berhasil pada salinan terpisah agar output dev tetap aman.

Bukti: [ringkasan JSON](../output/user-flow-ui-audit/summary.json), [observasi browser per render](../output/user-flow-ui-audit/browser-audit.json), dan [screenshot Complimentary](../output/user-flow-ui-audit/birthday-desktop.jpg) / [panel bahasa](../output/user-flow-ui-audit/language-desktop.jpg).

Ini audit kecocokan preview dengan implementasi. Login, OTP, clipboard, pemesanan, logout, GPS dan layanan eksternal tidak dieksekusi dari preview. State demo/gap/kanal eksternal tetap mengikuti dokumentasi implementasi; UI tidak mengarang keberhasilan layanan. Peta jaringan normal tidak dimuat; UI kontrol/kartu dan surface kegagalan peta berasal dari komponen asli.

## Temuan yang diperbaiki

| Area | Temuan | Perbaikan |
| --- | --- | --- |
| Birthday Gift dan filter Complimentary | Header, subtitle dan checkbox hilang karena preview memaksa directoryOnly. | PublicPrivilegeView memakai komposisi Signature & Complimentary yang sama dengan route; fokus diarahkan ke panel Complimentary. |
| Ganti bahasa | Hanya tombol ditandai; dropdown tidak terbuka. | LocaleSwitcher desktop dan dropdown MobileMenu dibuka sebagai state awal. Kedua opsi terlihat; hasil memakai locale tujuan. Listener di luar preview tidak menutup panel statis. |
| Menu → halaman tujuan | Target mobile tidak sama dengan layar tujuan yang diperlihatkan. | Aksi memakai tautan segmen brand lain yang benar pada navbar/menu mobile; hasil memakai homepage brand tujuan. |
| Daftar → detail | Hasil masih berupa listing. | Kartu lounge pada daftar Signature berlanjut ke PartnerPrivilegeDetailView lounge. |
| Ganti tab dengan filter | Tidak memperlihatkan tab Event atau reset pengalaman daftar. | Sumber memperlihatkan Lifestyle yang terfilter, lalu EventPrivilegeExperience dengan data event asli; tab aktif tetap terlihat penuh. |
| Login dan OTP | Request gagal terlihat seperti form normal; pemulihan nomor/resend memakai langkah yang keliru. | State pending mengunci submit login. OTP noSelection mempertahankan request nomor; noPhone memakai informasi yang benar; resend memperlihatkan tombol siap lalu countdown baru. |
| Voucher transfer terpakai | Preview menghapus semua voucher lain dari dataset. | Daftar asli diperluas; crop menyorot kartu terpakai dengan kode dicoret, tombol disabled dan tanggal pemakaian. |
| Medical check-up | Lokasi yang dipilih kembali ke nilai awal setelah handoff. | Pilihan lokasi dipertahankan pada hasil; salin memakai state salin dari modul pemilik. |
| Banking Solution dan Kurs | Hasil detail tetap berupa listing; preview kurs selalu menyorot konverter. | Halaman banking/wealth dan detail KKB memakai komposisi route pemilik. Daftar kurs dan konverter mendapat fokus sesuai case; hasil swap memperlihatkan arah terbalik. |
| e-Magazine | Memilih edisi sekaligus memindahkan listing ke halaman kedua. | Pagination saja berpindah halaman; memilih edisi mempertahankan halaman awal lalu membuka UI login. Konteks member memakai header member. |
| Kontak, Ketentuan dan gate preview | Potongan UI dirakit dengan judul/surface atau isi yang berbeda dari halaman pemilik. | BrandContactPage, BrandInformationPage dan LoginPageView dipakai kembali; disclosure hadir pada tahap sebelum kanal dibuka. |
| Temukan Cabang | Pencarian terpilih masih membuka saran; mobile memakai daftar desktop; kegagalan peta tidak terlihat. | Saran ditutup setelah dipilih. Desktop memakai panel/ResultsList asli; mobile memakai kontrol dan ResultsSlider asli. State gagal memakai LocationMapUnavailable yang juga dipakai route. |
| Logout dan konteks member | Backdrop berupa modul voucher; menu mobile terlalu tinggi sehingga seluruh UI menjadi kecil; label menu/tab mengikuti pathname dokumentasi. | Backdrop memakai MemberOverview. Menu akun mobile difokuskan ke blok akun/Logout. Konteks member dan tone/tab Solitaire dipasok lewat props/context preview. |
| Pengukuran crop | Menu absolut, tab dengan margin negatif, dan overlay yang mount setelah hydration terpotong. | Bounds menu/tab disertakan; perubahan subtree diukur ulang. Panel layar penuh tetap memakai lebar sumber dan dapat digulir; dialog terpusat menyesuaikan tinggi tersedia. |

## Matriks seluruh case

Nama `scene/state` menunjuk mapping di `flow-preview-state.ts`; source komponen terkait ada pada disclosure masing-masing flow. Semua baris diperiksa pada desktop dan mobile.

### Menjelajahi website

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Menu → halaman tujuan](http://localhost:3000/user-flows#all/navigation/menu/2) | `home/default` | `home/menu` | `home/otherBrand` |
| [Langsung ke tab tertentu](http://localhost:3000/user-flows#all/navigation/tabs/2) | `home/default` | `directory/lifestyle` | `directory/lifestyle` |
| [Tautan listing lama](http://localhost:3000/user-flows#all/navigation/legacy/2) | `home/default` | `directory/lifestyle` | `directory/lifestyle` |
| [Ganti bahasa](http://localhost:3000/user-flows#all/navigation/language/2) | `home/default` | `home/language` | `home/translated` |
| [Tutup menu tanpa berpindah](http://localhost:3000/user-flows#all/navigation/closeMenu/2) | `home/default` | `home/menu` | `home/default` |

### Mencari informasi

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Hasil ditemukan](http://localhost:3000/user-flows#all/search/results/2) | `home/default` | `search/results` | `search/results` |
| [Tidak ada hasil](http://localhost:3000/user-flows#all/search/empty/2) | `home/default` | `search/empty` | `search/empty` |
| [Kata kunci kosong](http://localhost:3000/user-flows#all/search/blank/2) | `home/default` | `search/blank` | `search/blank` |
| [Pakai atau hapus riwayat](http://localhost:3000/user-flows#all/search/history/2) | `home/default` | `search/history` | `search/historyCleared` |
| [Batal mencari](http://localhost:3000/user-flows#all/search/cancel/2) | `home/default` | `search/blank` | `home/default` |
| [Penyimpanan browser dibatasi](http://localhost:3000/user-flows#all/search/storage/2) | `home/default` | `search/storage` | `search/storage` |

### Filter dan daftar konten

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Daftar → detail](http://localhost:3000/user-flows#all/directory/browse/2) | `directory/signature` | `directory/signature` | `detail/read` |
| [Gabungkan beberapa filter](http://localhost:3000/user-flows#all/directory/combined/2) | `directory/browse` | `directory/combined` | `directory/combined` |
| [Filter menghasilkan nol konten](http://localhost:3000/user-flows#all/directory/none/2) | `directory/browse` | `directory/none` | `directory/none` |
| [Halaman berikutnya dan batas daftar](http://localhost:3000/user-flows#all/directory/pagination/2) | `directory/browse` | `directory/pagination` | `directory/pagination` |
| [Birthday Gift](http://localhost:3000/user-flows#all/directory/birthday/2) | `directory/browse` | `directory/birthday` | `directory/birthday` |
| [Ganti tab saat filter aktif](http://localhost:3000/user-flows#all/directory/tabChange/2) | `directory/lifestyleFiltered` | `directory/lifestyleFiltered` | `directory/event` |

### Detail dan akses benefit

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Baca syarat dan lokasi](http://localhost:3000/user-flows#all/detail/read/2) | `detail/read` | `detail/read` | `detail/read` |
| [Benefit → login member](http://localhost:3000/user-flows#all/detail/signIn/2) | `detail/read` | `detail/read` | `login/default` |
| [Benefit khusus Solitaire](http://localhost:3000/user-flows#all/detail/restricted/2) | `detail/restricted` | `detail/restricted` | `detail/restricted` |
| [Solitaire mengakses Signature](http://localhost:3000/user-flows#all/detail/solitaire/2) | `detail/member` | `detail/member` | `detail/member` |
| [ID detail tidak ditemukan](http://localhost:3000/user-flows#all/detail/missing/2) | `detail/read` | `detail/read` | `notFound/default` |

### Login member

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Kredensial demo benar](http://localhost:3000/user-flows#all/login/valid/2) | `login/default` | `login/valid` | `overview/default` |
| [Masuk memakai email](http://localhost:3000/user-flows#all/login/email/2) | `login/default` | `login/email` | `overview/default` |
| [Format identitas tidak valid](http://localhost:3000/user-flows#all/login/invalidFormat/2) | `login/default` | `login/invalidFormat` | `login/invalidFormat` |
| [Password kosong](http://localhost:3000/user-flows#all/login/blankPassword/2) | `login/default` | `login/blankPassword` | `login/blankPassword` |
| [Akun atau password salah](http://localhost:3000/user-flows#all/login/wrong/2) | `login/default` | `login/filled` | `login/wrong` |
| [Akun berbeda dengan brand asal](http://localhost:3000/user-flows#all/login/otherBrand/2) | `login/default` | `login/otherBrand` | `overview/otherBrand` |
| [Tujuan kembali tidak aman](http://localhost:3000/user-flows#all/login/unsafe/2) | `login/default` | `login/unsafe` | `overview/default` |
| [Kembali tanpa login](http://localhost:3000/user-flows#all/login/cancel/2) | `login/default` | `login/cancel` | `home/default` |
| [Lupa password atau registrasi](http://localhost:3000/user-flows#all/login/help/2) | `login/default` | `login/filled` | `login/help` |
| [Request login gagal](http://localhost:3000/user-flows#all/login/requestFailed/2) | `login/default` | `login/filled` | `login/pending` |

### Sesi dan halaman terlindungi

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Sesi sesuai brand](http://localhost:3000/user-flows#all/access/active/2) | `overview/default` | `overview/default` | `overview/default` |
| [Belum login atau sesi berakhir](http://localhost:3000/user-flows#all/access/missing/2) | `overview/default` | `login/default` | `login/default` |
| [Sesi brand lain](http://localhost:3000/user-flows#all/access/mismatch/2) | `overview/default` | `overview/default` | `login/default` |
| [Rute member tidak dikenal](http://localhost:3000/user-flows#all/access/unknown/2) | `overview/default` | `overview/default` | `notFound/default` |
| [Sesi berakhir saat halaman tetap terbuka](http://localhost:3000/user-flows#all/access/openExpiry/2) | `overview/default` | `overview/default` | `overview/default` |
| [Cookie sesi diblokir](http://localhost:3000/user-flows#all/access/cookieBlocked/2) | `overview/default` | `overview/default` | `login/default` |
| [Akun berubah di tab lain](http://localhost:3000/user-flows#all/access/otherTab/2) | `overview/default` | `overview/default` | `overview/default` |

### Financial Report dan OTP

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [OTP demo diterima](http://localhost:3000/user-flows#all/portfolio/verified/2) | `portfolio/masked` | `otp/request` | `portfolio/visible` |
| [Nomor belum dipilih](http://localhost:3000/user-flows#all/portfolio/noSelection/2) | `portfolio/masked` | `otp/request` | `otp/noSelection` |
| [OTP belum lengkap](http://localhost:3000/user-flows#all/portfolio/partial/2) | `portfolio/masked` | `otp/verify` | `otp/partial` |
| [OTP demo ditolak](http://localhost:3000/user-flows#all/portfolio/rejected/2) | `portfolio/masked` | `otp/verify` | `otp/rejected` |
| [Tunggu lalu kirim ulang](http://localhost:3000/user-flows#all/portfolio/resend/2) | `portfolio/masked` | `otp/resend` | `otp/verify` |
| [Kode setelah countdown habis](http://localhost:3000/user-flows#all/portfolio/expiredCode/2) | `portfolio/masked` | `otp/expiredCode` | `portfolio/visible` |
| [Tidak punya nomor terdaftar](http://localhost:3000/user-flows#all/portfolio/noPhone/2) | `portfolio/masked` | `otp/noPhone` | `otp/noPhone` |
| [Tutup dialog OTP](http://localhost:3000/user-flows#all/portfolio/cancel/2) | `portfolio/masked` | `otp/request` | `portfolio/masked` |
| [Sembunyikan lalu tampilkan lagi](http://localhost:3000/user-flows#all/portfolio/hideAgain/2) | `portfolio/visible` | `portfolio/visible` | `portfolio/masked` |
| [Sesi portfolio habis](http://localhost:3000/user-flows#all/portfolio/expiry/2) | `portfolio/visible` | `portfolio/visible` | `portfolio/masked` |
| [Verifikasi mengalami gangguan](http://localhost:3000/user-flows#all/portfolio/failure/2) | `portfolio/masked` | `otp/verify` | `otp/failure` |
| [Kunjungi ulang dalam sesi portfolio](http://localhost:3000/user-flows#all/portfolio/reload/2) | `portfolio/visible` | `portfolio/visible` | `portfolio/visible` |
| [Jenis laporan tidak dikenal](http://localhost:3000/user-flows#all/portfolio/reportUnknown/2) | `portfolio/masked` | `portfolio/masked` | `portfolio/masked` |

### Voucher dan airport transfer

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Kuota tersedia](http://localhost:3000/user-flows#all/vouchers/available/2) | `vouchers/available` | `vouchers/available` | `vouchers/available` |
| [Kuota unlimited](http://localhost:3000/user-flows#all/vouchers/unlimited/2) | `vouchers/unlimited` | `vouchers/unlimited` | `vouchers/unlimited` |
| [Dikenakan penalty](http://localhost:3000/user-flows#all/vouchers/penalty/2) | `vouchers/penalty` | `vouchers/penalty` | `vouchers/penalty` |
| [Kuota habis](http://localhost:3000/user-flows#all/vouchers/exhausted/2) | `vouchers/exhausted` | `vouchers/exhausted` | `vouchers/exhausted` |
| [Salin kode transfer](http://localhost:3000/user-flows#all/vouchers/copy/2) | `vouchers/transfer` | `vouchers/transfer` | `vouchers/copy` |
| [Voucher transfer sudah dipakai](http://localhost:3000/user-flows#all/vouchers/used/2) | `vouchers/used` | `vouchers/used` | `vouchers/used` |
| [Clipboard menolak salin](http://localhost:3000/user-flows#all/vouchers/copyDenied/2) | `vouchers/transfer` | `vouchers/transfer` | `vouchers/copyDenied` |
| [Lihat lebih banyak voucher](http://localhost:3000/user-flows#all/vouchers/expand/2) | `vouchers/transfer` | `vouchers/transfer` | `vouchers/expand` |

### Reservasi medical check-up

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Lokasi → WhatsApp partner](http://localhost:3000/user-flows#all/medical/book/2) | `medical/default` | `medical/selected` | `medical/selected` |
| [Salin kode sebelum reservasi](http://localhost:3000/user-flows#all/medical/copy/2) | `medical/default` | `medical/default` | `medical/copied` |
| [WhatsApp atau partner tidak tersedia](http://localhost:3000/user-flows#all/medical/partnerUnavailable/2) | `medical/default` | `medical/selected` | `medical/selected` |
| [Batal di aplikasi partner](http://localhost:3000/user-flows#all/medical/cancel/2) | `medical/default` | `medical/selected` | `medical/selected` |

### Banking Solution dan Kurs

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Banking Privilege → detail](http://localhost:3000/user-flows#all/banking/benefit/2) | `banking/benefit` | `banking/benefit` | `bankingDetail/benefit` |
| [Wealth Insight → sumber laporan](http://localhost:3000/user-flows#all/banking/wealth/2) | `banking/wealth` | `banking/wealth` | `banking/wealth` |
| [Lihat kurs dan mata uang](http://localhost:3000/user-flows#all/banking/rates/2) | `kurs/rates` | `kurs/rates` | `kurs/rates` |
| [Sumber kurs gagal](http://localhost:3000/user-flows#all/banking/rateFallback/2) | `kurs/rates` | `kurs/rateFallback` | `kurs/rateFallback` |
| [Konversi dan tukar mata uang](http://localhost:3000/user-flows#all/banking/converter/2) | `kurs/rates` | `kurs/converter` | `kurs/swapped` |
| [Nominal konverter tidak valid](http://localhost:3000/user-flows#all/banking/invalidAmount/2) | `kurs/rates` | `kurs/invalidAmount` | `kurs/invalidAmount` |
| [Refresh halaman kurs](http://localhost:3000/user-flows#all/banking/refresh/2) | `kurs/rates` | `kurs/refresh` | `kurs/rates` |

### e-Magazine

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Telusuri edisi](http://localhost:3000/user-flows#all/magazine/list/2) | `magazine/default` | `magazine/default` | `magazine/page2` |
| [Baca sekarang → login](http://localhost:3000/user-flows#all/magazine/read/2) | `magazine/default` | `magazine/default` | `login/default` |
| [Member memilih edisi](http://localhost:3000/user-flows#all/magazine/memberRead/2) | `magazine/member` | `magazine/member` | `login/default` |
| [Parameter edisi tidak dikenal](http://localhost:3000/user-flows#all/magazine/invalidIssue/2) | `login/default` | `login/default` | `login/default` |

### Temukan cabang

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Gunakan titik default](http://localhost:3000/user-flows#all/branches/default/2) | `branches/default` | `branches/default` | `branches/default` |
| [Izin lokasi diberikan](http://localhost:3000/user-flows#all/branches/gps/2) | `branches/default` | `branches/primer` | `branches/gps` |
| [Izin lokasi ditolak](http://localhost:3000/user-flows#all/branches/denied/2) | `branches/default` | `branches/primer` | `branches/denied` |
| [GPS tidak tersedia atau timeout](http://localhost:3000/user-flows#all/branches/unavailable/2) | `branches/default` | `branches/primer` | `branches/unavailable` |
| [Cari tempat manual](http://localhost:3000/user-flows#all/branches/place/2) | `branches/default` | `branches/place` | `branches/placeSelected` |
| [Saran tempat tidak ditemukan](http://localhost:3000/user-flows#all/branches/noPlace/2) | `branches/default` | `branches/noPlace` | `branches/noPlace` |
| [Pembaruan lokasi gagal](http://localhost:3000/user-flows#all/branches/nearbyFailure/2) | `branches/default` | `branches/nearbyFailure` | `branches/nearbyFailure` |
| [Buka petunjuk arah](http://localhost:3000/user-flows#all/branches/directions/2) | `branches/default` | `branches/directions` | `branches/directions` |
| [Peta gagal dimuat](http://localhost:3000/user-flows#all/branches/mapFailed/2) | `branches/default` | `branches/mapFailed` | `branches/mapFailed` |
| [Mengetik cepat atau mengganti lokasi](http://localhost:3000/user-flows#all/branches/fastTyping/2) | `branches/default` | `branches/fastTyping` | `branches/fastTyping` |

### Informasi dan bantuan

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Baca dokumen lengkap](http://localhost:3000/user-flows#all/contact/documents/2) | `contact/documents` | `contact/documents` | `contact/documents` |
| [Pilih kanal kontak](http://localhost:3000/user-flows#all/contact/channel/2) | `contact/channel` | `contact/disclosure` | `contact/channel` |
| [Bantuan melalui cabang](http://localhost:3000/user-flows#all/contact/branch/2) | `contact/branch` | `contact/branch` | `branches/default` |
| [Ingin kirim pesan dari website](http://localhost:3000/user-flows#all/contact/messageForm/2) | `contact/messageForm` | `contact/messageForm` | `contact/messageForm` |
| [Batalkan sebelum membuka kanal](http://localhost:3000/user-flows#all/contact/cancelDisclosure/2) | `contact/cancelDisclosure` | `contact/disclosure` | `contact/cancelDisclosure` |

### Logout dan perpindahan segmen

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Konfirmasi logout](http://localhost:3000/user-flows#all/logout/confirm/2) | `overview/accountMenu` | `logout/default` | `home/default` |
| [Batalkan logout](http://localhost:3000/user-flows#all/logout/cancel/2) | `overview/accountMenu` | `logout/default` | `overview/default` |
| [Pindah ke segmen di luar Prio/Soli](http://localhost:3000/user-flows#all/logout/segment/2) | `overview/default` | `logout/default` | `home/individual` |
| [Kembali ke URL member setelah logout](http://localhost:3000/user-flows#all/logout/back/2) | `home/default` | `home/default` | `login/default` |
| [Logout mengalami gangguan](http://localhost:3000/user-flows#all/logout/failure/2) | `overview/accountMenu` | `logout/default` | `logout/default` |

### Laporan, data, dan gangguan

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Ganti periode laporan](http://localhost:3000/user-flows#all/resilience/period/2) | `portfolio/tax` | `portfolio/tax` | `portfolio/year` |
| [Unduh laporan Financial Report](http://localhost:3000/user-flows#all/resilience/download/2) | `portfolio/tax` | `portfolio/tax` | `portfolio/notice` |
| [Sumber data gagal → fallback](http://localhost:3000/user-flows#all/resilience/fallback/2) | `home/default` | `home/default` | `home/default` |
| [Offline atau server tidak terjangkau](http://localhost:3000/user-flows#all/resilience/offline/2) | `home/default` | `home/default` | `home/default` |
| [Request lambat atau tertunda](http://localhost:3000/user-flows#all/resilience/pending/2) | `otp/verify` | `otp/verify` | `otp/failure` |
| [Tautan eksternal tidak terbuka](http://localhost:3000/user-flows#all/resilience/externalFailure/2) | `home/default` | `home/default` | `home/default` |

### Akses preview proyek

| Case | Awal | Aksi / kondisi | Hasil |
| --- | --- | --- | --- |
| [Gate tidak diaktifkan](http://localhost:3000/user-flows#all/preview/disabled/2) | `home/default` | `home/default` | `home/default` |
| [Password preview benar](http://localhost:3000/user-flows#all/preview/correct/2) | `preview/default` | `preview/default` | `preview/correct` |
| [Password preview salah](http://localhost:3000/user-flows#all/preview/wrong/2) | `preview/default` | `preview/default` | `preview/wrong` |
| [Tidak aktif selama 8 jam](http://localhost:3000/user-flows#all/preview/idle/2) | `home/default` | `preview/default` | `preview/idle` |
