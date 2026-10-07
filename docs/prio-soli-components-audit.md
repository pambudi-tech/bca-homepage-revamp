# Audit Components · Prioritas & Solitaire

Tanggal audit: 7 Oktober 2026. Acuan: working tree BCAcoid saat audit, termasuk perubahan yang belum di-commit.

Library sebelumnya berisi 22 entries Components. Hasil: 28 entries; 6 komponen baru, 22 entries ditinjau/diperbarui.

Filter dan badge Shared/Prioritas/Solitaire dihapus dari katalog dan detail dokumentasi. Satu entry menyimpan ukuran, penggunaan, palet, dan state yang tersedia.

| Komponen | Sebelum | Perubahan audit | Sumber |
| --- | --- | --- | --- |
| Button | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/components/prioritas/PrioritasButton.tsx`; `src/app/prioritas-buttons.css` |
| Dropdown | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/components/prioritas/PrioritasDirectoryDropdown.tsx`; `src/app/priosoli-dropdowns.css` |
| Category Chip | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/app/priosoli-chips.css`; `src/components/prioritas/SignaturePrivilegeExperience.tsx`; `src/components/prioritas/EventPrivilegeExperience.tsx`; `src/components/prioritas/FinancialReportExperience.tsx` |
| Privilege Card | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/components/prioritas/SignaturePrivilegeCard.tsx`; `src/components/prioritas/SignaturePrivilegeExperience.tsx` |
| Text Field | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/components/ui/TextField.tsx`; `src/components/member/MemberLoginExperience.tsx` |
| Pagination | Belum terdaftar | Belum memiliki entry komponen tersendiri; ditambahkan ukuran, varian dan respons yang tersedia. | `src/components/prioritas/PrioritasDirectory.tsx` |
| Content Card | Sudah ada | Nama, jenis konten, tone dan CTA belum mencakup ContentCard terbaru. | `src/components/prioritas/ContentCard.tsx`; `src/components/promo/PromoCard.tsx`; `src/components/promo/PromoCarousel.tsx` |
| Banking Privilege Card | Sudah ada | Merapikan entry card; menambahkan ukuran directory, palet dan CTA library. | `src/components/prioritas/BankingSolutionSection.tsx`; `src/components/prioritas/BankingSolutionIndexExperience.tsx` |
| Wealth Insight Card | Sudah ada | Tinggi 320/560 px dan panel desktop 320 px sudah tidak berlaku. | `src/components/prioritas/BankingSolutionSection.tsx`; `src/components/prioritas/BankingSolutionIndexExperience.tsx` |
| Tab | Sudah ada | Menambahkan underline/member dan mengoreksi tinggi tab serta overlap. | `src/components/ui/Tab.tsx`; `src/components/prioritas/PrioritasIndexTabs.tsx`; `src/components/prioritas/BankingSolutionIndexTabs.tsx`; `src/components/prioritas/MemberSectionTabs.tsx`; `src/app/globals.css` |
| Navigasi section homepage | Sudah ada | Tinggi rail dan offset target sudah menjadi 56 px pada semua viewport. | `src/components/home/SectionAnchor.tsx`; `src/components/ui/Tab.tsx` |
| Header directory & detail | Sudah ada | Tinggi, offset judul, jumlah baris dan varian member telah berubah. | `src/components/prioritas/PrioritasPageHeader.tsx` |
| Privilege Card · Feature | Sudah ada | Menghapus klasifikasi brand dan melengkapi ukuran feature/rail. | `src/components/prioritas/PrivilegeSection.tsx` |
| Privilege Card · Accordion | Sudah ada | Kartu accordion desktop 480 px dan control 64 px menggantikan 560/72 px. | `src/components/solitaire/SolitairePrivilegeSection.tsx`; `src/components/home/ProductSection.tsx` |
| Featured Event Banner | Sudah ada | Menambahkan panel berlogo dan pilihan initial slide pada pemakaian mobile. | `src/components/prioritas/PrioritasFeaturedBanner.tsx` |
| Event Carousel · Overlap | Sudah ada | Desktop image frame, overlap panel, dan kontrol berubah; mobile menggunakan banner. | `src/components/solitaire/SolitaireEventPromoSection.tsx`; `src/components/solitaire/SolitaireEventPromoDesktopSlider.tsx`; `src/components/prioritas/PrioritasFeaturedBanner.tsx` |
| Tanggal event & masa berlaku | Sudah ada | Melengkapi palet neutral dan state expired. | `src/components/prioritas/PrioritasEventDateTile.tsx` |
| Directory Panel | Sudah ada | Memisahkan Pagination dan mengoreksi breakpoint panel serta gap grid. | `src/components/prioritas/PrioritasDirectory.tsx` |
| e-Magazine Card | Sudah ada | Menjelaskan tone, CTA library dan perbedaan ukuran homepage/directory. | `src/components/prioritas/MagazineCard.tsx`; `src/components/prioritas/MagazineSection.tsx`; `src/components/prioritas/MagazineIndexExperience.tsx` |
| Accordion detail & dokumen | Sudah ada | Menambahkan visual neutral pada panel/detail row. | `src/components/prioritas/PrioritasDetailExperience.tsx` |
| Member login & field states | Sudah ada | Status submit dan error sudah berubah; melengkapi pending/success dan backlink. | `src/components/member/MemberLoginExperience.tsx`; `src/components/member/member-login.css`; `src/components/ui/TextField.tsx` |
| Alert & feedback | Sudah ada | Menghapus varian system kuning lama yang tidak dirender login terbaru. | `src/components/member/MemberLoginExperience.tsx`; `src/components/ui/TextField.tsx` |
| Search Overlay | Sudah ada | Menambahkan katalog Signature terbaru, batas hasil, dan riwayat per konteks. | `src/components/home/SearchOverlay.tsx`; `src/components/home/SearchRecommendation.tsx`; `src/components/home/priosoli-search-data.ts` |
| Contact & footer | Sudah ada | Menambahkan tone neutral dan penyesuaian destination footer. | `src/components/prioritas/PrioritasContactSection.tsx`; `src/components/home/Footer.tsx` |
| Kurs carousel | Sudah ada | Angka dan timing sesuai; melengkapi palet dan kontrol Button terbaru. | `src/components/prioritas/KursRatesCarousel.tsx`; `src/components/prioritas/KursRefreshButton.tsx`; `src/components/prioritas/KursCarouselControls.tsx` |
| Navbar & subnavigation | Sudah ada | Geometri navbar dipertahankan; melengkapi status member dan konteks logo. | `src/components/home/Navbar.tsx`; `src/components/home/MobileNav.tsx`; `src/components/prioritas/PrioritasDetailSubnav.tsx` |
| Hero homepage | Sudah ada | Geometri hero sesuai; batas judul desktop kini maksimum 3 baris untuk halaman brand. | `src/components/home/HeroSection.tsx` |
| Floating action & back to top | Sudah ada | Geometri Back To Top sesuai; mempertahankan shortcut Complimentary dan safe-area. | `src/components/home/BackToTop.tsx`; `src/components/prioritas/SignaturePrivilegeExperience.tsx` |

## Perbedaan yang masih ada pada implementasi

- Content Card: `solitaire` mengubah visual, sedangkan tujuan default masih berasal dari base Prioritas. Consumer Solitaire harus memberikan `detailHref` yang sesuai konteks.
- Button: Danger hanya mempunyai resep Default; Danger Inverse belum didefinisikan. Text action memakai warna surface tanpa filled/outline variant.
- Dropdown: ukuran Medium/Large, Select/Search, dan opsi regular tersedia. Belum ada API disabled maupun navigasi opsi dengan Arrow Up/Down.
- Category Chip: focus-visible masih memakai pgold-500 pada kedua palet.
- Text Field: focus memakai cyan-400 dan belum mempunyai tone Prio/Soli tersendiri.
- Featured Event Banner: buttonTheme Solitaire mengubah control/text action; panel kaca masih memakai struktur glass-panel-prioritas.
- Event Carousel desktop: CTA panel masih berupa button tanpa handler atau destination. Dokumentasi tidak menyebutnya sebagai navigasi aktif.
- Search: katalog Solitaire saat ini hanya tiga privilege homepage. Katalog Prioritas lebih luas. Jangan menyatakan kedua katalog identik.

## Batas audit

Audit ini mencocokkan dokumentasi dengan kode website terbaru. Audit tidak menyatakan semua komponen sudah identik dengan Figma atau bahwa semua variasi telah diverifikasi secara visual di website produk. Perubahan ini hanya pada handbook; tidak memperbaiki perilaku komponen website.

Preview diagrams di handbook tetap bersifat skematis. Sizing, variants, states, dan behavior pada tabel merupakan spesifikasi hasil audit sumber.

## Verifikasi

- `node --check` pada `app.js` dan `articles.js`: lolos.
- Data handbook: 41 artikel, 28 Components, ID unik, tidak ada related reference yang putus; semua Components memiliki tanggal audit.
- Browser localhost: katalog 28 komponen tanpa filter/badge brand, halaman Button/Dropdown/Content Card/Privilege Card, dan pencarian Banking Privilege Card telah diperiksa.
- `npm run lint`: 0 error, 180 warning pada kode produk yang ada.
- `npm run typecheck`: lolos.
- `npm run build -- --webpack`: lolos, termasuk generasi halaman. Fetch eksternal gagal DNS dan menggunakan bundled fallback sesuai konvensi proyek. Build Turbopack yang tidak menunjukkan kemajuan dihentikan sebelum fallback Webpack dijalankan.
