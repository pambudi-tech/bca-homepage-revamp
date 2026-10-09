# Handbook Komponen Prioritas & Solitaire

Dokumentasi ini hanya memuat komponen antarmuka Prioritas dan Solitaire. Setiap entri berisi tujuan, ukuran atau struktur yang pernah diaudit, varian, state, dan aturan penggunaan. Komposisi halaman, pattern, serta foundations tidak menjadi bagian handbook ini.

Jika satu komponen dipakai di kedua halaman, perbedaan Prioritas dan Solitaire ditulis di dalam entri komponen tersebut. Palet Gold/Brown merujuk ke Prioritas dan palet Neutral ke Solitaire. Beberapa komponen memiliki perbedaan susunan atau perilaku, bukan hanya warna; entri itu menjelaskannya secara terpisah. Tidak semua komponen memiliki dua versi.

Acuan konten: audit implementasi 7 Oktober 2026. Perubahan UI sesudah tanggal tersebut perlu dicocokkan kembali sebelum angka ukuran dipakai sebagai spesifikasi final.

## Daftar komponen

- [Button](#button)
- [Dropdown](#dropdown)
- [Category Chip](#category-chip)
- [Tab](#tab)
- [Text Field](#text-field)
- [Content Card](#content-card)
- [Privilege Card](#privilege-card)
- [Banking Privilege Card](#banking-privilege-card)
- [Wealth Insight Card](#wealth-insight-card)
- [e-Magazine Card](#e-magazine-card)
- [Badge tanggal / label masa berlaku](#badge-tanggal--label-masa-berlaku)
- [Pagination](#pagination)
- [Directory Panel](#directory-panel)
- [Accordion detail & dokumen](#accordion-detail--dokumen)
- [Hero homepage](#hero-homepage)
- [Navbar & subnavigation](#navbar--subnavigation)
- [Navigasi section homepage](#navigasi-section-homepage)
- [Privilege Card · Feature](#privilege-card--feature)
- [Privilege Card · Accordion](#privilege-card--accordion)
- [Featured Event Banner](#featured-event-banner)
- [Event Carousel · Overlap](#event-carousel--overlap)
- [Kurs carousel](#kurs-carousel)
- [Floating action & back to top](#floating-action--back-to-top)
- [Alert & feedback](#alert--feedback)
- [Search Overlay](#search-overlay)
- [Contact & footer](#contact--footer)
- [Header directory & detail](#header-directory--detail)

## Button

Button berlabel, icon button, dan text action dengan pilihan ukuran serta surface.

**Sumber implementasi:** [`PrioritasButton.tsx`](../src/components/prioritas/PrioritasButton.tsx), [`prioritas-buttons.css`](../src/app/prioritas-buttons.css).

### Ukuran dan struktur

| Ukuran / aspek | Button / Icon | Text / catatan |
| --- | --- | --- |
| Small | Button 32 px · padding X 16 px; Icon 32×32 px | Text 12/14 px · tinggi 20 px |
| Medium | Button 40 px · padding X 20 px; Icon 40×40 px | Text 14/14 px · tinggi 20 px |
| Large | Button 48 px · padding X 24 px; Icon 48×48 px | Text 16/16 px · tinggi 20 px |
| Ikon | Slot 20 px; icon button Large memakai 24 px | Label memiliki inset 2 px per sisi |
| Bentuk | Pill untuk Button/Icon; Text tanpa border dan radius | Semibold; transisi warna 200 ms |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Primary · Default | Tindakan utama | Filled Gold/Brown atau Neutral |
| Secondary · Default | Tindakan pendamping | Putih dengan border dan teks mengikuti palet |
| Danger · Default | Tindakan berisiko | Merah; geometri mengikuti ukuran Button |
| Primary · Inverse | Tindakan utama pada panel gelap | Filled terang dengan teks gelap |
| Secondary · Inverse | Tindakan pendamping pada panel gelap | Outline terang; wash pada hover/pressed |
| Text · Default / Inverse | Tindakan pada kartu atau panel | Tanpa filled surface dan border |

### State

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default → Hover → Pressed | Gold/Brown: pbrown-600 → 500 → 700 | Primary pada surface Default |
| Default → Hover → Pressed | Neutral: neutral-800 → 700 → 900 | Primary pada surface Default |
| Disabled | Warna nonaktif mengikuti jenis dan surface | Button tidak dapat dipilih |
| Focus | Outline 2 px dengan offset 3 px | Palet fokus mengikuti style button |

### Penggunaan

- Pilih Button untuk tindakan dengan label, Icon untuk kontrol ringkas, dan Text untuk tindakan di dalam kartu atau panel.
- Primary, Secondary, dan Danger tersedia pada surface Default. Surface Inverse mendefinisikan Primary dan Secondary; jangan menganggap Danger Inverse sudah memiliki resep visual.
- Text action mengikuti warna surface; Primary/Secondary tidak mengubah tampilannya menjadi filled atau outlined.
- Ukuran mengikuti konteks pemakaian. Beberapa Button dan Text action berubah ke Large mulai 1280 px.

## Dropdown

Pilihan tunggal dengan opsi menu atau field pencarian, untuk filter dan form.

**Sumber implementasi:** [`PrioritasDirectoryDropdown.tsx`](../src/components/prioritas/PrioritasDirectoryDropdown.tsx), [`priosoli-dropdowns.css`](../src/app/priosoli-dropdowns.css).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Medium | Tinggi 48 px; teks 16/20 px | Opsi menu mengikuti tinggi control |
| Large | Tinggi 56 px; teks 16/24 px | Dapat diterapkan mulai 1280 px sesuai konteks |
| Control | Padding X 16 px; radius 12 px; border 1 px | Default neutral-200 / neutral-300 |
| Menu | Jarak 8 px di bawah control; radius 12 px | Maksimum 256 px; isi scroll vertikal |
| Opsi | Padding X 12 px; radius 8 px; maksimum 2 baris | Baris ikon + label dapat memakai layout horizontal |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Select | Filter periode, kategori, lokasi atau mata uang | Nilai terpilih atau placeholder + chevron |
| Search | Pencarian dengan pilihan hasil | Search icon 18 px + field + chevron |
| Prioritas · Gold/Brown | Border open pgold-500; teks selected pbrown-700 | Hover pgold-100 / pbrown-600 |
| Solitaire · Neutral | Border open neutral-800; teks selected neutral-800 | Hover neutral-200 / neutral-800 |

### State

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Closed | Surface neutral-200 dan border neutral-300 | Nilai atau placeholder terlihat |
| Open | Surface neutral-100; border mengikuti palet | Menu muncul di bawah control |
| Selected | Nilai pilihan tampil pada control | Hanya satu opsi terpilih |
| Hover option | Warna dan weight opsi berubah | Regular → semibold pada varian regular |

### Penggunaan

- Klik control atau chevron untuk membuka dan menutup menu; chevron berputar 180° ketika terbuka.
- Pilih satu opsi untuk memperbarui nilai dan menutup menu. Klik di luar atau tekan Escape untuk menutup.
- Field pencarian membuka menu saat mendapat fokus atau ketika pengguna mengetik. Hasil opsi mengikuti konteks pencarian pemakainya.
- Menu mengikuti lebar control dan posisi control saat halaman digulir atau viewport berubah.
- Varian regular memakai teks opsi regular pada keadaan normal/selected dan semibold pada hover.

## Category Chip

Pilihan kategori atau periode dengan state selected, ikon opsional, dan dua ukuran.

**Sumber implementasi:** [`priosoli-chips.css`](../src/app/priosoli-chips.css), [`SignaturePrivilegeExperience.tsx`](../src/components/prioritas/SignaturePrivilegeExperience.tsx), [`EventPrivilegeExperience.tsx`](../src/components/prioritas/EventPrivilegeExperience.tsx), [`FinancialReportExperience.tsx`](../src/components/prioritas/FinancialReportExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Medium | Tinggi 48 px; padding X 12 px; teks 14/20 px | Ikon 20 px |
| Large | Tinggi 56 px; padding X 16 px; teks 16/24 px | Ikon 24 px; dapat aktif mulai 1280 px |
| Bentuk | Radius 12 px; border 1 px; gap ikon-label 12 px | Label satu baris; lebar mengikuti isi |
| Rail kategori | Gap 8 px; gap 12 px mulai 1280 px | Scroll horizontal bila kategori melebihi ruang |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas · Gold/Brown | Selected: border pgold-500; fill pgold-200 | Teks pbrown-600 |
| Solitaire · Neutral | Selected: border neutral-800; gradasi neutral-100 → 300 | Teks neutral-800 |
| Label + icon / Label only | Kategori dengan ikon atau pilihan periode | Ukuran ikon mengikuti ukuran chip |

### State

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default | Putih; border neutral-300; teks neutral-800 | Belum terpilih |
| Hover | Border dan teks mengikuti palet | Untuk chip yang belum selected |
| Selected | Fill, border dan teks mengikuti varian | Pilihan tetap terlihat |
| Focus | Outline 2 px, offset 3 px | Implementasi saat ini memakai pgold-500 pada kedua palet |

### Penggunaan

- Gunakan chip untuk memilih kategori atau periode. Jumlah pilihan mengikuti kebutuhan halaman: satu pilihan untuk kategori event, beberapa pilihan pada directory yang mendukungnya.
- Ikon bersifat opsional; teks tetap menjadi label utama. Pada pilihan periode, chip dapat membagi lebar kelompok secara merata.
- Kontrol panah kategori hanya muncul pada sisi rail yang masih mempunyai konten di luar area terlihat.

## Tab

Tab Curved untuk directory dan Tab Underline untuk section atau halaman member.

**Sumber implementasi:** [`Tab.tsx`](../src/components/ui/Tab.tsx), [`PrioritasIndexTabs.tsx`](../src/components/prioritas/PrioritasIndexTabs.tsx), [`BankingSolutionIndexTabs.tsx`](../src/components/prioritas/BankingSolutionIndexTabs.tsx), [`MemberSectionTabs.tsx`](../src/components/prioritas/MemberSectionTabs.tsx), [`globals.css`](../src/app/globals.css).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Curved | Tinggi 48 px di mobile dan desktop | Padding X 24 px → 32 px mulai 1280 px |
| Curved Medium | 48 px; padding X 12 px; teks 14 px | Padding X 32 px; teks 16 px mulai 1280 px |
| Underline Medium | Tinggi 48 px; padding X 12 px; teks 14/14 px | Padding X 16 px mulai 1280 px |
| Underline Large | Tinggi 56 px; padding X 12 px; teks 16 px | Padding X 20 px mulai 1280 px |
| Indicator | Underline 4 px; active opacity 100% | Curved: radius atas/kurva bawah 12 px |
| Directory rail | Overlap header −48 px; sticky top 16 px | Rail scroll di bawah 1280 px; overflow visible di desktop |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Curved | Index directory dan overview | Active surface menyambung ke permukaan halaman |
| Underline | Navigasi section dan member | Active bold dengan garis bawah |
| Prioritas / Solitaire | Background, teks inactive, dan indicator mengikuti palet | Permukaan publik dan member dapat berbeda |

### Penggunaan

- Tab aktif dipusatkan ketika rail lebih lebar daripada area terlihat; pemusatan tetap dibatasi ujung rail.
- Perpindahan manual memusatkan tab dengan animasi. Posisi awal memakai perpindahan langsung.
- Tab directory mempertahankan konteks kategori. Sticky background berubah setelah halaman digulir lebih dari 8 px.

## Text Field

Field berlabel dengan ikon, bantuan, password toggle, dan feedback inline.

**Sumber implementasi:** [`TextField.tsx`](../src/components/ui/TextField.tsx), [`MemberLoginExperience.tsx`](../src/components/member/MemberLoginExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default | Tinggi 48 px; teks 14/20 px | Label 14/20 px |
| Medium | Tinggi 48 px; teks 16/24 px | Label 16/24 px |
| Large | Tinggi 56 px; teks 16/24 px | Label 16/24 px |
| Control | Radius 12 px; padding X 14 px | Surface neutral-200; border neutral-300 |
| Icon / adornment | Leading icon 20 px; label bantuan dan trailing control opsional | Teks mendapat ruang agar tidak menabrak ikon |
| Error inline | 12/18 px; red-500 | Jarak antar label, control dan pesan 8 px |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Input | Teks, email atau password | Dapat memakai ikon dan control tambahan |
| Native select | Pilihan bawaan browser | Placeholder dan chevron tetap terlihat |

### State

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default | Teks neutral-700; placeholder neutral-600 | Surface neutral-200 |
| Focus | Border cyan-400 | Saat tidak error |
| Error | Border dan feedback red-500 | Pesan terhubung dengan field |
| Disabled | Teks neutral-500 | Control tidak menerima input |

### Penggunaan

- Label boleh disembunyikan secara visual bila konteks tetap jelas; nama field tetap tersedia bagi pembaca layar.
- Pesan error membuat border merah dan ditampilkan tepat di bawah control.
- Field password dapat menyertakan tombol untuk menampilkan atau menyembunyikan nilai.
- Text Field saat ini menggunakan focus border cyan-400; belum memiliki pilihan palet Gold/Brown atau Neutral.

## Content Card

Kartu konten untuk Complimentary, Lifestyle, Event, dan Promo dengan slot informasi sesuai jenis konten.

**Komponen Prioritas/Solitaire:** [`ContentCard.tsx`](../src/components/prioritas/ContentCard.tsx). Kartu event adalah varian `event` dari Content Card.

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Rail | 280×360 px; 302×360 px mulai 1280 px | Grid fill: tinggi 360 px, lebar mengikuti kolom |
| Cover | Tinggi 160 px; object-cover | Hover scale 1.05× selama 500 ms |
| Logo partner | 72×72 px; left 20 px; top 124 px | Isi logo 56×56 px; radius 12 px |
| Content | Left/right 20 px; top 48 px di body | Judul 16/24 px; judul dan partner maksimum 2 baris |
| Radius | 24 px pada kartu | Border neutral-300 pada tampilan detail |
| Action | Bottom/left 20 px | Text action Large atau label masa berlaku |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Complimentary | Logo, judul, partner dan text action | Birthday Gift dapat menampilkan ribbon |
| Lifestyle | Logo, judul, partner dan text action | Tujuan mengikuti detail konten yang tersedia |
| Event | Content Card + Date Tile pada cover | Tanggal aktif, rentang tanggal atau expired |
| Promo | Content Card + label waktu dengan clock icon | Ribbon mengikuti status promo |
| Prioritas / Solitaire | Prioritas memakai aksen brown/gold; Solitaire memakai aksen neutral | Ukuran dan slot konten tetap konsisten; tujuan detail mengikuti halaman brand aktif |

### State

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default | Surface neutral-100; border neutral-300 | Cover, logo dan label tetap terlihat |
| Hover | Kartu naik 6 px / 300 ms; foto scale 1.05× | Border berubah gold atau neutral; shadow muncul |
| Logo tidak tersedia | Dua kata pertama nama partner sebagai fallback | Logo pada dark background memakai surface brown |
| Expired / Birthday | Date Tile expired atau ribbon sesuai jenis konten | Tidak ditambahkan pada semua kartu |

### Penggunaan

- Seluruh kartu menuju detail yang sesuai dengan konten dan konteks halaman.
- Tanpa tujuan khusus dari halaman pemakai, link default memakai rute Prioritas atau Solitaire sesuai varian kartu.
- Jenis konten menentukan slot tanggal, ribbon, dan action. Promo memakai masa berlaku; jenis lainnya memakai text action.
- Content Card tidak memiliki ukuran Small/Medium/Large. Ukurannya mengikuti rail atau kolom grid.

## Privilege Card

Kartu privilege dengan cover penuh, panel informasi kaca, dan text action.

**Sumber implementasi:** [`SignaturePrivilegeCard.tsx`](../src/components/prioritas/SignaturePrivilegeCard.tsx), [`SignaturePrivilegeExperience.tsx`](../src/components/prioritas/SignaturePrivilegeExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Rail <640 px | 280×360 px; snap center | Lebar tetap untuk rail horizontal |
| Grid ≥640 px | Tinggi 240 px; lebar mengikuti kolom | Bukan pilihan Small/Medium/Large |
| Radius | 12 px pada kartu dan panel | Panel inset X/bottom 8 px |
| Panel | Tinggi 120 px pada rail; tinggi auto pada grid | Padding 16 px; blur 16 px; saturate 1.25 |
| Judul dan CTA | Judul subtitle dengan slot minimum 56 px | Text action Large pada surface Inverse |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas · Gold/Brown | Panel kaca bertone brown; text action inverse gold | Cover dan judul mengikuti data privilege |
| Solitaire · Neutral | Panel hitam dengan opacity 30%; text action inverse neutral | Geometri mengikuti ukuran rail/grid |

### Penggunaan

- Seluruh kartu adalah satu link menuju detail privilege; text action di panel mengikuti tujuan kartu.
- Gambar membesar menjadi 1.05× selama 500 ms ketika kartu di-hover.

## Banking Privilege Card

Kartu layanan perbankan dengan gambar penuh, judul, dan Button Secondary pada surface Inverse.

**Sumber implementasi:** [`BankingSolutionSection.tsx`](../src/components/prioritas/BankingSolutionSection.tsx), [`BankingSolutionIndexExperience.tsx`](../src/components/prioritas/BankingSolutionIndexExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Tinggi kartu | 360 px di bawah 768 px | 300 px mulai 768 px |
| Lebar homepage | Rail 280 px; snap center | Grid 2 kolom mulai 768 px, 3 mulai 1280 px |
| Lebar directory | Mengikuti kolom; 1 kolom awal | 2 kolom mulai 640 px; 3 mulai 1280 px |
| Judul | Left 16 px; bottom 80 px; subtitle 18/26 px | Left 24 px; bottom 88 px; title 20/28 px mulai 768 px |
| CTA | Button Secondary · Inverse · Medium (40 px) | Left/bottom 16 px → 24 px mulai 768 px |
| Radius / hover | Radius 12 px; gambar scale 1.03× selama 700 ms | Judul dan CTA tetap berada di posisi yang sama |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Homepage / Directory | Lebar tetap pada rail atau mengikuti grid | Tidak tersedia preset Small/Medium/Large pada card |
| Prioritas / Solitaire | Radial wash brown atau neutral | Button inverse mengikuti palet |

### Penggunaan

- Area link menutup seluruh kartu sehingga gambar, judul, dan CTA menuju detail layanan yang sama.
- Posisi crop gambar dapat menyesuaikan aset layanan tanpa mengubah geometri kartu.

## Wealth Insight Card

Foto publikasi, metadata, dan tindakan mengakses laporan.

**Sumber implementasi:** [`BankingSolutionSection.tsx`](../src/components/prioritas/BankingSolutionSection.tsx), [`BankingSolutionIndexExperience.tsx`](../src/components/prioritas/BankingSolutionIndexExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Tinggi | 360 px pada semua breakpoint | Lebar mengikuti rail atau grid pemakai |
| Cover | Tinggi 75% kartu; object-cover | Hover scale 1.03× selama 700 ms |
| Fade | Mulai pada 45% tinggi kartu hingga bawah | Warna mengikuti backdrop cover atau fallback brown |
| Glass panel | Inset X/bottom 8 px; radius 16 px; padding 16 px | Tinggi auto; blur 16 px + saturate 1.25 |
| Content | Gap utama 24 px; judul 18 px / line-height 1.3 | Metadata: ikon 20 px; teks 14/20 px |
| CTA | Secondary · Inverse · Medium (40 px) | Ikon download opsional |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas · Gold/Brown | Background mengikuti warna backdrop cover | Panel kaca gold/brown; shadow Prioritas |
| Solitaire · Neutral | Base neutral-800; border neutral-300; shadow panel | Panel neutral-800 70%; fade tetap mengikuti backdrop cover |

### Penggunaan

- CTA pada panel menuju laporan atau publikasi. Area gambar kartu tidak otomatis merupakan link.
- Tinggi panel mengikuti isi, bukan preset panel desktop 320 px.

## e-Magazine Card

Cover majalah dengan blur bertahap dan CTA yang muncul pada hover atau fokus.

**Sumber implementasi:** [`MagazineCard.tsx`](../src/components/prioritas/MagazineCard.tsx), [`MagazineSection.tsx`](../src/components/prioritas/MagazineSection.tsx), [`MagazineIndexExperience.tsx`](../src/components/prioritas/MagazineIndexExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Homepage card | 280×380 px pada rail | Tinggi420 px mulai768;532 px pada1280 |
| Radius | 12 px | 12 px |
| Blur default → hover/focus | 0.1 px →8 px selama500 ms | Mask bawah0–25% opaque, memudar ke85% |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Homepage | 280×380 px pada rail; tinggi 420 px mulai 768 px / 532 px mulai 1280 px | Grid mengikuti section |
| Directory | Cover rasio 3:4; lebar mengikuti kolom | Caption berada di luar cover |
| Prioritas / Solitaire | Tint dan Text action mengikuti palet | Efek hover/focus memakai struktur yang sama |

### Penggunaan

- Blur, tint, dan teks adalah3 lapisan berbeda. Menyatukan opacity blur dengan teks mengubah hasil animasi.
- focus-visible mengaktifkan efek yang sama dengan hover. Seluruh cover tetap merupakan link yang bisa dipilih.

## Badge tanggal / label masa berlaku

Overlay pada gambar kartu atau detail. Mode tanggal menampilkan hari dan bulan event, rentang tanggal, atau status “expired”. Mode label menampilkan ikon jam dan teks masa berlaku promo. Komponen ini hanya menampilkan data yang diberikan; ia tidak menghitung tanggal kedaluwarsa.

**Sumber implementasi:** [`PrioritasEventDateTile.tsx`](../src/components/prioritas/PrioritasEventDateTile.tsx). Badge tanggal dipakai oleh varian `event` pada [`ContentCard.tsx`](../src/components/prioritas/ContentCard.tsx) dan detail event; label waktu dipakai pada detail promo.

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Date tile kartu | Top0/right16 px; tinggi86 px; min-width80 px | Radius bawah16 px |
| Date tile detail | Top0/right16 px; min-height86 px | Right24 px pada xl; radius bawah12 px |
| Promo time label | Top/left8 px; min-height48 px | Top/left16 px; min-height56 px |
| Tanggal / bulan | Tanggal 24/28 px; bulan 12/16 px | ≥768 px: tanggal 28/28 px; bulan 14/16 px; semibold, uppercase |
| Surface normal | Brown atau Neutral opacity 30% + efek kaca | Expired memakai red-500 opacity 30% |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Single date / Date range | Satu atau beberapa kolom hari-bulan | Divider rentang di antara tanggal |
| Time label | Ikon jam + teks masa berlaku dari halaman promo | Inset top/left; tinggi minimum 48 → 56 px |
| Prioritas / Solitaire | Surface pbrown-600 atau neutral-800 opacity 30% | Efek kaca mengikuti palet Prioritas/Solitaire |
| Expired | Surface red-500 opacity 30% | Label expired menggantikan tanggal |

## Pagination

Kontrol halaman dengan angka, panah sebelumnya/berikutnya, dan lompatan rentang.

**Sumber implementasi:** [`PrioritasDirectory.tsx`](../src/components/prioritas/PrioritasDirectory.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Nomor halaman | 40×40 px; radius 8 px; teks 14 px | Gap 8 px pada kelompok control |
| Panah | 48×48 px; bentuk circle; ikon 20 px | Disabled di halaman pertama/terakhir |
| Ellipsis | 40×40 px; bentuk circle | Memindahkan hingga 5 halaman |
| Ringkasan | Disembunyikan di bawah 1280 px | Mulai 1280 px: rentang item dan total |
| Jumlah halaman terlihat | Mengikuti ruang control yang tersedia | Halaman pertama/terakhir tetap terwakili saat rentang panjang |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas · Gold/Brown | Active: border pgold-500; fill pgold-200 | Teks pbrown-600 |
| Solitaire · Neutral | Active: border neutral-800; gradasi neutral-100 → 300 | Teks neutral-800 |
| Top / Bottom | Letak control terhadap daftar | Summary mengikuti breakpoint yang sama |

### Penggunaan

- Nomor selected menandai halaman aktif. Memilih nomor, panah, atau ellipsis memperbarui daftar konten.
- Pagination dapat diletakkan di atas atau di bawah grid sesuai kebutuhan directory.
- Panah tidak dapat dipilih ketika sudah berada di batas rentang; opacity nonaktif 40%.

## Directory Panel

Panel putih menampung kategori, filter, grid kartu, jumlah hasil, dan pagination.

**Sumber implementasi:** [`PrioritasDirectory.tsx`](../src/components/prioritas/PrioritasDirectory.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Panel <1280 px | Full bleed; radius atas 20 px; radius bawah 0; padding 16 px | Header dan divider mengikuti full width |
| Panel ≥1280 px | Radius 12 px; padding 24 px | Saat expanded: full viewport, radius 0, isi maksimum 1280 px |
| Grid default | 1 kolom di bawah 768 px | 3 kolom mulai 768 px; gap Normal 24 / Compact 16 px |
| Item per halaman | Default 9 item | e-Magazine memakai 12 item |
| Empty state | Pesan centered; padding Y 64 px | Header, filter dan pagination tetap tersedia |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Normal / Compact grid | Gap 24 px atau 16 px | Jumlah kolom dapat diatur sesuai jenis konten |
| Top / Bottom pagination | Pagination sebelum atau sesudah daftar | Mengikuti kebutuhan directory |

### Penggunaan

- Transisi panel500 ms. Area isi tetap maksimal1280 px sehingga posisi kartu mengikuti container isi.
- Jumlah tombol halaman mengikuti lebar kontrol: floor((availableWidth−112+8)/48), minimal1.

## Accordion detail & dokumen

Panel detail yang dapat dibuka bersamaan dan menyesuaikan isi yang tersedia.

**Sumber implementasi:** [`PrioritasDetailExperience.tsx`](../src/components/prioritas/PrioritasDetailExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Default detail | Detail Privilege + Syarat & Ketentuan terbuka | Kontak dan lokasi tertutup |
| Default About | Detail + Terms + Contact terbuka | Custom sections: hanya section pertama terbuka |
| Judul | 18 px semibold; padding8 px | 20/28 px; padding16 px |
| Body | 14/20 px | 16/24 px |
| Tombol indikator | 40 px circle, icon24 px | Putar−90° terbuka /90° tertutup |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas · Gold/Brown | Hover pgold-100; indikator pgold-200 | Teks hover pbrown-500 |
| Solitaire · Neutral | Hover neutral-200; indikator neutral-300 | Teks neutral-900; ikon neutral-800 |

### Penggunaan

- Beberapa bagian dapat dibuka bersamaan; membuka satu bagian tidak menutup bagian lainnya.
- Custom document membagi teks per paragraf, mengubah baris berawalan bullet menjadi ul, dan mengenali judul bagian seperti Manfaat/Risiko/Biaya.

## Hero homepage

Identitas brand, foto utama, judul, CTA, dan scroll cue dalam satu hero responsif.

**Sumber implementasi:** [`HeroSection.tsx`](../src/components/home/HeroSection.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Tinggi hero <1280 px | max(560 px, min(640 px, 90svh − 48 px)) | Gunakan small viewport height (svh) |
| Tinggi hero ≥1280 px | 80svh | Tidak membawa minimum 560 px dari mobile |
| Content inset | Kiri/kanan 16 px; bawah 40 px | Wrapper 1280 px terpusat; bawah 40 px |
| Lebar kelompok copy | 280 px | 560 px |
| Lebar judul | Gold/Brown max 240 px; Neutral max 260 px | Maksimum 3 baris pada desktop brand |
| Ukuran judul | Prio 28/36; Soli 32/40 px | Font clamp(36 px,5svh,40 px), line clamp(44 px,6svh,48 px) |
| Logo brand | Tinggi 40 px, lebar auto | 40 px |
| CTA Prio/Soli | Pill tinggi 48 px, padding X 24 px | 48 px |

### Penggunaan

- Hero menggunakan height responsif, bukan rasio gambar. object-cover menjaga gambar memenuhi area dan crop berubah mengikuti viewport.
- Pada 433×993, rumus memberi 640 px. Pada 1440×900, desktop memberi 720 px.
- Saat halaman digulir, banner bergeser sebesar 45% dari jarak scroll dan tetap diperbesar 1.1× agar tidak membuka ruang kosong.
- Mobile memakai overlay gelap seluruh hero. Desktop memakai wash kiri selebar 1/3 dan wash atas setinggi 160 px.
- Swipe perlu jarak minimal 40 px; swipe kiri menuju slide berikutnya, kanan menuju sebelumnya.

### Catatan

- Rumus tinggi dapat menghasilkan hero lebih tinggi dari viewport mobile yang sangat pendek karena minimum 560 px tetap berlaku.

## Navbar & subnavigation

Pergantian brand, pencarian, bahasa, dan akses member.

**Sumber implementasi:** [`Navbar.tsx`](../src/components/home/Navbar.tsx), [`MobileNav.tsx`](../src/components/home/MobileNav.tsx), [`PrioritasDetailSubnav.tsx`](../src/components/prioritas/PrioritasDetailSubnav.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Navbar | 64 px + safe-area top pada mobile | 72 px pada xl |
| Logo BCA desktop | Kembali ke homepage brand aktif | 115 × 36 px |
| Subnav halaman Prio | top 64 px, tinggi 48 px | top 72 px, tinggi 44 px |
| Navigasi brand | Prioritas ↔ Solitaire | Member Login kembali ke konteks brand aktif |
| Warna ketika scroll | Mengikuti variant brand | Prio pbrown-800, Soli neutral-900 |

### Penggunaan

- Navbar tetap terlihat saat search atau pilihan bahasa terbuka. Navigasi anchor dapat menahannya dalam posisi tersembunyi hingga pengguna kembali menggulir.
- Logo BCA kembali ke homepage konteks aktif. Status member menentukan akses login atau menu member.
- Subnavigation mempertahankan kategori dan konteks detail yang sedang dibuka.

## Navigasi section homepage

Tab anchor mengikuti bagian halaman yang sedang dibaca dan mengatur posisi scroll.

**Sumber implementasi:** [`SectionAnchor.tsx`](../src/components/home/SectionAnchor.tsx), [`Tab.tsx`](../src/components/ui/Tab.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Rail | Tinggi 56 px di semua breakpoint | Underline Large |
| Navbar terlihat | Sticky top 64 px | Top 72 px mulai 1280 px |
| Navbar tersembunyi | Sticky top 0 | Tetap top 0 |
| Marker | Garis bawah 4 px; selected bold | Warna mengikuti palet |
| Target scroll | Offset −56 px | Durasi scroll 1 detik |

### Penggunaan

- Klik label memilih section, membawa tab ke tengah rail, lalu menggulir halaman menuju section selama 1 detik.
- Section aktif ditentukan oleh section terakhir yang melewati garis baca 40% tinggi viewport. Pada akhir dokumen, section terakhir dipilih.
- Tab pertama/terakhir dapat berhenti sebelum tepat di tengah karena scroll dibatasi tepi rail. Rumus pemusatan tidak menambahkan ruang kosong di ujung.
- Setiap label hanya menunjuk ke section yang tersedia pada halaman. Hubungan antar-screen dirangkum dalam Pages & Flows.

## Privilege Card · Feature

Feature besar di desktop dan rail kartu aktif pada mobile.

Dipakai pada section Privilege homepage Prioritas. Solitaire memakai susunan accordion yang didokumentasikan pada entri berikutnya.

**Sumber implementasi:** [`PrivilegeSection.tsx`](../src/components/prioritas/PrivilegeSection.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Rail mobile | Lebar 280 px; tinggi active 360 px / inactive 328 px | Rail tinggi 360 px; gap 16 px |
| Desktop ≥1280 px | Feature span 2 kolom; tinggi 360 px | Dua kartu berikutnya tinggi 400 px |
| Radius / panel | Card 24 px; panel radius 16 px; inset 8 px; tinggi 160 px | Panel 360×180 px; left/bottom 16 px |
| CTA lihat semua | Tinggi 64 px; lebar penuh pada mobile | Span grid desktop; terpisah dari ukuran Button library |

### Penggunaan

- Kartu aktif mengikuti kartu yang tengahnya paling dekat ke tengah rail saat pengguna scroll.
- Klik kartu memilihnya, mereset progress, dan memusatkannya. Autoplay sekitar 6 detik memilih kartu berikutnya saat section live.
- Hover atau sentuhan pada rail menghentikan progress sementara; selesai sentuhan atau pointer keluar melanjutkan.
- Gambar hover membesar ke 1.03 selama 700 ms. Tinggi active/inactive bertransisi 500 ms.

## Privilege Card · Accordion

Kartu desktop melebar ketika aktif, dengan rail terpisah pada mobile.

Dipakai pada section Privilege homepage Solitaire; susunan desktopnya berbeda dari feature grid Prioritas.

**Sumber implementasi:** [`SolitairePrivilegeSection.tsx`](../src/components/solitaire/SolitairePrivilegeSection.tsx), [`ProductSection.tsx`](../src/components/home/ProductSection.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Rail mobile | Rail tinggi 360 px; kartu memiliki state active/inactive | Dipakai di bawah 1280 px |
| Desktop accordion | Tinggi 480 px; gap 12 px; radius 12 px | Inactive basis 160 px; active mengisi sisa lebar |
| Panel desktop | 360×180 px; left/bottom 16 px; radius 16 px | Panel informasi tampil pada kartu active |
| Control | Circle 64×64 px; ikon 32 px; gap 16 px | Diletakkan di bawah accordion |
| Autoplay | 6000 ms ketika section terlihat | Pause ketika hover; manual selection reset progress |
| CTA lihat semua | Secondary Large; pada header desktop | Full width di bawah rail mobile |

### Penggunaan

- State active memperlebar kartu desktop dan menampilkan panel informasi.
- Mobile memakai rail tanpa clone loop; CTA lihat semua hanya muncul di bawah rail pada viewport mobile.

## Featured Event Banner

Banner kampanye dengan overlay informasi dan kontrol carousel.

Dipakai pada section Event & Promo Prioritas. Pada Solitaire, varian ini dipakai di mobile dengan tema tombol Solitaire; desktop memakai Event Carousel · Overlap.

**Sumber implementasi:** [`PrioritasFeaturedBanner.tsx`](../src/components/prioritas/PrioritasFeaturedBanner.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Banner | Tinggi400 px; radius12 px | Tinggi400 px |
| Gambar | Area atas200 px dengan mask pudar65–100% | Memenuhi banner |
| Panel informasi | Inset X8 px; bottom72 px; tinggi160 px | Left/top16 px;360×180 px |
| Judul | Maks3 baris, slot80 px | Maks3 baris, slot96 px |
| Kontrol | Baris bottom8 px, tinggi56 px | Left32/bottom24 px |
| Autoplay | 6000 ms | Crossfade700 ms |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Standard panel | 160 px mobile / 180 px desktop | Desktop width 360 px |
| Logo panel | 224 px mobile / 256 px desktop | Logo slot 44 px; judul maksimum 3 baris |
| Slide awal | Default slide kedua; dapat memakai slide pertama | Pemakaian Event Carousel mobile memulai slide pertama |

### Penggunaan

- Slide awal menggunakan index1. Pergantian manual mereset pause; indikator aktif dapat ditekan untuk pause/play.
- Background mobile mengikuti warna backdrop slide; gradasi menghubungkan gambar atas dengan area teks.

## Event Carousel · Overlap

Foto utama dengan panel informasi yang melewati batas bawah gambar.

Varian desktop Solitaire. Pada mobile Solitaire, section ini memakai Featured Event Banner. Prioritas memakai Featured Event Banner pada section Event & Promo.

**Sumber implementasi:** [`SolitaireEventPromoSection.tsx`](../src/components/solitaire/SolitaireEventPromoSection.tsx), [`SolitaireEventPromoDesktopSlider.tsx`](../src/components/solitaire/SolitaireEventPromoDesktopSlider.tsx), [`PrioritasFeaturedBanner.tsx`](../src/components/prioritas/PrioritasFeaturedBanner.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Mobile <1280 px | Featured Event Banner tinggi 400 px | Dimulai dari slide pertama |
| Desktop image frame | Tinggi 400 px; radius 12 px | Crossfade 700 ms |
| Panel desktop | 400×200 px; left 24 px; bottom −72 px | Padding 24 px; title 24/32 px |
| Control desktop | Bottom 24 px; right 32 px | Circle 64 px; ikon 32 px; gap 16 px |
| Indicator | 5 segmen; tinggi 6 px; gap 12 px | Bottom −40 px |
| Autoplay | 6000 ms | Pause pada hover atau fokus di slider |

### Penggunaan

- Panel desktop melewati batas bawah gambar sebesar 72 px. Ruang di bawah slider mengakomodasi overlap dan indikator.
- Pemilihan slide manual mereset durasi. Hover dan fokus menghentikan autoplay sementara.

### Catatan

- Action pada panel desktop saat ini berupa tombol visual dan belum memiliki tujuan navigasi.

## Kurs carousel

Tiga mata uang terlihat sekaligus dengan perpindahan otomatis dan refresh data.

**Sumber implementasi:** [`KursRatesCarousel.tsx`](../src/components/prioritas/KursRatesCarousel.tsx), [`KursRefreshButton.tsx`](../src/components/prioritas/KursRefreshButton.tsx), [`KursCarouselControls.tsx`](../src/components/prioritas/KursCarouselControls.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Layout | Tiga baris bertumpuk | 3 kolom mulai768 px |
| Autoplay | Maju1 posisi /5000 ms | Panah sebelumnya/berikutnya bergeser3 posisi |
| Angka | Format id-ID,2 desimal | Lebar kolom beli/jual88 px |
| Transisi angka | 650 ms count; opacity/translate500 ms | Reduced motion langsung nilai akhir |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas / Solitaire | Warna teks, panel dan kontrol mengikuti palet | Struktur mata uang tetap sama |
| Refresh | Icon Button Secondary Small (32 px) | Memuat ulang data melalui reload halaman |

## Floating action & back to top

Tombol kembali ke atas dan shortcut daftar Complimentary dengan safe area.

**Sumber implementasi:** [`BackToTop.tsx`](../src/components/home/BackToTop.tsx), [`SignaturePrivilegeExperience.tsx`](../src/components/prioritas/SignaturePrivilegeExperience.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Mobile button | Tinggi44 px, radius pill | Desktop≥768 px: tinggi52 px dan cap bermask |
| Prio homepage/detail | Bottom24 px + safe-area | Bottom0 mulai768 px |
| Complimentary shortcut | Bottom32 px + safe-area | Bottom0 mulai768 px |
| Fit content desktop | Padding X52 px | Cap kiri/kanan52×52 px |
| Progressive backdrop | Tinggi160 px | 176 px mulai768 px |

### Penggunaan

- Tombol kembali ke atas muncul setelah halaman melewati 60% tinggi viewport. Arah turun menyembunyikan dan arah naik menampilkan kembali setelah perubahan 4 px.
- Pada halaman pendek, tombol tetap muncul ketika pengguna sudah mencapai bagian bawah.
- Backdrop dibuat solid di bagian bawah lalu memudar hingga transparan pada 85% tinggi area.

## Alert & feedback

Feedback field, kesalahan kredensial, gangguan sistem, dan notice.

**Sumber implementasi:** [`MemberLoginExperience.tsx`](../src/components/member/MemberLoginExperience.tsx), [`TextField.tsx`](../src/components/ui/TextField.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Credentials alert | Surface red-100; teks red-600; radius 12 px | Padding 16 px; gap 12 px; ikon 24 px |
| Typography | 14/20 px; min-height 56 px | Lebar mengikuti pesan dan area form |
| Inline field error | Border red-500; pesan 12/18 px | Terletak di bawah field |
| Notice | Surface blue-100; teks blue-700 | Feedback untuk bantuan form |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Credentials | Login gagal | Alert di atas form, terlihat 5 detik |
| Field error | Format identitas belum sesuai | Feedback dekat control |
| Notice | Bantuan atau informasi | Pesan status terpisah dari error |

### Penggunaan

- Login terbaru merender alert credentials merah. Varian system kuning dari dokumentasi lama tidak tersedia pada form ini.
- Pesan error dan notice memiliki konteks masing-masing agar pengguna dapat menghubungkannya dengan tindakan atau field.

## Search Overlay

Pencarian berdasarkan segmen dengan riwayat yang terpisah.

**Sumber implementasi:** [`SearchOverlay.tsx`](../src/components/home/SearchOverlay.tsx), [`SearchRecommendation.tsx`](../src/components/home/SearchRecommendation.tsx), [`priosoli-search-data.ts`](../src/components/home/priosoli-search-data.ts).

### Penggunaan

- Search terbuka dalam konteks segmen aktif, field mulai kosong, riwayat tampil, dan fokus berpindah ke input.
- Katalog Prioritas mencakup privilege homepage, Signature, Banking Privilege, Wealth Insight, serta partner Signature/Complimentary/Lifestyle. Katalog Solitaire saat ini memakai tiga privilege homepage.
- Query nonkosong menampilkan maksimal 7 hasil: 3 hasil utama dan sisanya pada kelompok informasi. Query kosong menampilkan 3 rekomendasi awal.
- Riwayat pencarian disimpan terpisah per konteks. Escape menutup overlay dan mengembalikan fokus ke pemicu.

## Contact & footer

Informasi kontak, link resmi, navigasi penutup, dan legal copy.

**Sumber implementasi:** [`PrioritasContactSection.tsx`](../src/components/prioritas/PrioritasContactSection.tsx), [`Footer.tsx`](../src/components/home/Footer.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Contact layout | Stack; paddingY48/X16 px | Grid3 kolom mulai768, panel260 px |
| Contact glass cards | Tinggi160 px, radius8 px,p20 | Tinggi160 px |
| Footer Prio | Padding top48/bottom96 px | Top56/bottom64 px mulai1280 |
| Footer mobile | Container max420 px; accordion link groups | Desktop menjadi kolom navigasi |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Prioritas / Solitaire | Background section dan footer mengikuti palet | Contact action memakai Text Inverse Medium |
| Contact card | 160 px; radius 8 px; padding 20 px | Link RIPLAY atau panggilan telepon |
| Footer mobile / Desktop | Accordion pada mobile; kolom link pada desktop | Daftar link mengikuti konteks halaman |

### Penggunaan

- Navigasi footer mengarahkan pengguna ke konten sesuai konteks halaman aktif.
- Link internal tetap berada dalam website; link eksternal terbuka pada tab baru. Nomor telepon menjadi tindakan panggilan.

## Header directory & detail

Breadcrumb, judul, subtitle partner, logo, dan lapisan glow.

**Sumber implementasi:** [`PrioritasPageHeader.tsx`](../src/components/prioritas/PrioritasPageHeader.tsx).

### Ukuran dan struktur

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Header publik | Tinggi 344 px | 384 px mulai 1280 px |
| Header member | Tinggi 232 px | 264 px mulai 1280 px |
| Breadcrumb publik | Top 128 px; teks 14/24 px; scroll horizontal | Top 140 px mulai 1280 px |
| Directory title | Bottom 80 px | Bottom 72 px mulai 1280 px |
| Detail title | Bottom 44 px; tanpa subtitle/logo bottom 80 px | Bottom 72 px mulai 1280 px |
| Judul | Lebar maksimum 560 px; detail maksimum 3 baris | Desktop maksimum 3 baris |
| Partner logo | 80×80 px; padding 12 px; radius 16 px | 120×120 px mulai 1280 px |
| Top blur | 112 px | 120 px mulai 1280 px |

### Varian

| Aspek | Perilaku | Catatan |
| --- | --- | --- |
| Public / Member | Header publik bertone gelap; header member terang | Breadcrumb dan inset mengikuti konteks |
| Index / Detail | Judul directory atau judul + subtitle/logo | Posisi detail tertentu mengikuti kebutuhan halaman |
| Prioritas / Solitaire | Palet header, teks dan glow mengikuti visual halaman | Struktur identitas tetap konsisten |

### Penggunaan

- Logo tampil ketika aset tersedia dan tidak menyusut. Judul memakai ruang yang tersisa.
- Posisi kelompok judul dapat mengikuti kebutuhan detail: tanpa identitas partner atau selaras dengan judul index.
