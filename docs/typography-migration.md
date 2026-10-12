# Migrasi typography — 11 Oktober 2026

Semua **671 referensi kelas ukuran teks stock** di **103 file** sudah diganti. Referensi CSS ukuran stock di `prioritas-buttons.css` juga memakai token Label proyek. Skala stock dinonaktifkan di theme; katalog Typography memuat 40 style acuan (39 dari Figma dan Display/2XL baru yang disetujui pemilik), dengan 13 alias digabung ke kartu acuannya. Teks pengantar hero Kartu Kredit memakai Body/Semibold/L (16/24) dan Body/Semibold/XL (18/26) pada desktop.

Ukuran, line height, weight, tracking, responsive variants, dan perilaku trim lama dipertahankan selama migrasi. Varian proyek di bawah **belum dianggap sebagai perubahan acuan Figma yang disetujui**.

## Keputusan terbaru — digabung ke acuan

Pemilik menyetujui tiga penyesuaian pada 11 Oktober 2026:

| Nama lama | Acuan yang digunakan | Default leading sebelumnya → sekarang |
|---|---|---|
| `text-body-s-compact` | Body/Regular/S | 16px → 18px pada 12px |
| `text-body-xl-relaxed` | Body/Regular/XL | 28px → 26px pada 18px |
| `text-display-3xl-tight` | Display/3XL | 48px → 56px pada 48px |

Ketiga nama sekarang adalah alias lengkap acuan. Pemakaian ukuran di komponen
beralih ke helper `text-size-body-s`, `text-size-body-xl`, dan
`text-size-display-4xl` (sebelumnya 3XL) agar weight/tracking komponen tetap terjaga. Override
leading yang eksplisit tetap berlaku. Teks pengantar hero Kartu Kredit kemudian
digabung ke Body/Semibold/XL: desktop berubah dari 18/28 menjadi 18/26,
sementara mobile tetap Body/Semibold/L 16/24. Weight 600 dan tracking normal
tetap sama. Resep Eyebrow/Hero/Desktop tidak lagi menjadi tambahan katalog.
Katalog hanya menampilkan alias pada kartu acuan. Keputusan berikutnya
menggabungkan Compact 30/36 ke Display/L 28/32 dan menjadikan Intermediate
36/40 sebagai Display/2XL dengan tracking −0.02em dan weight 600.
Display/2XL lama (40/48) menjadi 3XL; 3XL lama (48/56) menjadi 4XL.
Semua pemakaian 48px dipindahkan ke nama 4XL agar ukurannya tetap.
Tambahan proyek tidak lagi mempunyai entri typography terpisah.

Bagian audit berikut mencatat kondisi **sebelum keputusan ini**, untuk jejak
migrasi dan lokasi override. Kelima varian awal sudah
mempunyai keputusan; tabel berikut tetap mencatat nama dan metrik historis.

## Dampak penggabungan Display terakhir

- Compact: 30px → 28px, leading default 36px → 32px, weight 600, tracking −0.02em.
- Judul tutorial memakai Display/L 28/32; override 40px lama dihapus.
- Judul hero detail kartu memakai Display/L 28/32 di bawah 1280px; aturan desktop 48px/leading-tight tetap.
- Intermediate: ukuran 36px dan leading 40px tetap, weight 600, tracking −0.02em.
- Angka miles di bawah 640px mengikuti Display/2XL 36/40/600; pada 640px ke atas aturan 48px/bold/leading-none tetap.
- Override tracking-tight judul Katalog Komponen dihapus agar mengikuti Display −0.02em.

## Padanan yang ukurannya sama

| Kelas lama | Pemakaian token proyek | Ukuran/leading default |
|---|---|---|
| `text-sm` | `text-size-body-m` → Body/M | 14/20 |
| `text-base` | `text-size-body-l` → Body/L | 16/24 |
| `text-xl` | `text-size-display-s` → Display/S | 20/28 |
| `text-2xl` | `text-size-display-m` → Display/M | 24/32 |

Helper `text-size-*` membaca ukuran dan line height dari token Figma, tanpa mereset weight/tracking yang diwarisi dari komponen. Mengganti utility ukuran dengan resep penuh secara otomatis akan mengubah bold/semibold dan tracking pada sejumlah komponen. Untuk UI baru yang memakai style lengkap, gunakan langsung `text-body-*-regular/semibold/bold`, `text-heading-*`, `text-display-*`, atau `text-label-*`.

## Audit awal lima varian ukuran

Pasangan di bawah adalah default sebelum override komponen. Angka font size/line height dalam px.

| Varian proyek sementara | Visual lama | Acuan terdekat | Selisih | Pemakaian kelas | Contoh lokasi |
|---|---|---|---|---|---|
| `text-body-s-compact` | 12/16 | Body/S 12/18 | leading −2px | 105 | [page.tsx:84](../src/app/[locale]/login/page.tsx#L84), [AssetBank.tsx:50](../src/components/asset-bank/AssetBank.tsx#L50), [AssetBank.tsx:63](../src/components/asset-bank/AssetBank.tsx#L63) |
| `text-body-xl-relaxed` | 18/28 | Body/XL 18/26 | leading +2px | 34 | [CookieBanner.tsx:133](../src/components/home/CookieBanner.tsx#L133), [FaqSection.tsx:258](../src/components/home/FaqSection.tsx#L258), [HaloBcaChat.tsx:360](../src/components/home/HaloBcaChat.tsx#L360) |
| `text-display-compact` | 30/36 | Display/XL 32/40 | size −2px, leading −4px | 4 | [AssetBank.tsx:55](../src/components/asset-bank/AssetBank.tsx#L55), [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22), [CreditCardTutorialSection.tsx:86](../src/components/kartu-kredit/CreditCardTutorialSection.tsx#L86) |
| `text-display-intermediate` | 36/40 | Display/XL 32/40 | size +4px | 5 | [AssetBank.tsx:55](../src/components/asset-bank/AssetBank.tsx#L55), [ComponentCatalog.tsx:68](../src/components/catalog/ComponentCatalog.tsx#L68), [DesignTokens.tsx:140](../src/components/design-tokens/DesignTokens.tsx#L140) |
| `text-display-3xl-tight` | 48/48 | Display/3XL 48/56 | leading −8px | 2 | [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22), [KrisflyerMileageSection.tsx:94](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L94) |

Pilihan: pertahankan varian proyek, atau selaraskan ke acuan di atas. Font 30px juga berjarak 2px dari Display/L 28px; peran komponen menentukan apakah arah yang tepat 28px atau 32px. Font 36px berada di antara Display/XL 32px dan Display/2XL 40px.

## Override komponen yang tetap dipertahankan

Beberapa komponen memberi leading tambahan atau weight di luar Figma (misalnya 500). Daftar berikut adalah audit literal sumber pada kelas yang dimigrasikan, bukan klaim bahwa semua kombinasi tampil pada satu viewport. Pewarisan parent, kondisi runtime, dan kelas tambahan dari caller tetap berlaku.

| Ukuran/leading dari sumber | Override | Acuan ukuran terdekat | Jumlah referensi | Contoh lokasi |
|---|---|---|---|---|
| 12/16 | `default` | Body/S 12/18 | 61 | [page.tsx:84](../src/app/[locale]/login/page.tsx#L84), [AssetBank.tsx:50](../src/components/asset-bank/AssetBank.tsx#L50), [AssetBank.tsx:63](../src/components/asset-bank/AssetBank.tsx#L63) |
| 30/36 | `default` | Display/XL 32/40 | 2 | [AssetBank.tsx:55](../src/components/asset-bank/AssetBank.tsx#L55), [KursDetailExperience.tsx:131](../src/components/prioritas/KursDetailExperience.tsx#L131) |
| 14/20 | `font-medium` | Body/M 14/20 | 12 | [AssetBank.tsx:63](../src/components/asset-bank/AssetBank.tsx#L63), [CatalogPreview.tsx:195](../src/components/catalog/CatalogPreview.tsx#L195), [CatalogStage.tsx:80](../src/components/catalog/CatalogStage.tsx#L80) |
| 14/24 | `leading-6` | Body/M 14/20 | 24 | [AssetDetail.tsx:40](../src/components/asset-bank/AssetDetail.tsx#L40), [ComponentCatalog.tsx:92](../src/components/catalog/ComponentCatalog.tsx#L92), [DesignTokens.tsx:69](../src/components/design-tokens/DesignTokens.tsx#L69) |
| 14/28 | `leading-7` | Body/M 14/20 | 1 | [ComponentCatalog.tsx:69](../src/components/catalog/ComponentCatalog.tsx#L69) |
| 14/20 | `file:font-medium` | Body/M 14/20 | 2 | [input.tsx:12](../src/components/catalog/ui/input.tsx#L12) |
| 12/20 | `leading-5` | Body/S 12/18 | 22 | [DesignTokens.tsx:39](../src/components/design-tokens/DesignTokens.tsx#L39), [DesignTokens.tsx:40](../src/components/design-tokens/DesignTokens.tsx#L40), [DesignTokens.tsx:43](../src/components/design-tokens/DesignTokens.tsx#L43) |
| 12/16 | `font-medium` | Body/S 12/18 | 2 | [DesignTokens.tsx:45](../src/components/design-tokens/DesignTokens.tsx#L45), [PromoDetailExperience.tsx:38](../src/components/promo/PromoDetailExperience.tsx#L38) |
| 16/20 | `leading-5` | Body/L 16/24 | 6 | [WorkspaceTitle.tsx:9](../src/components/docs/WorkspaceTitle.tsx#L9), [KartuKreditCardList.tsx:538](../src/components/kartu-kredit/KartuKreditCardList.tsx#L538), [BankingSolutionSection.tsx:97](../src/components/prioritas/BankingSolutionSection.tsx#L97) |
| 12/16 | `leading-4` | Body/S 12/18 | 8 | [CookieBanner.tsx:105](../src/components/home/CookieBanner.tsx#L105), [LayoutSwitcher.tsx:131](../src/components/home/LayoutSwitcher.tsx#L131), [ProductMegaMenuOverlay.tsx:195](../src/components/home/ProductMegaMenuOverlay.tsx#L195) |
| 18/28 | `default` | Body/XL 18/26 | 17 | [CookieBanner.tsx:133](../src/components/home/CookieBanner.tsx#L133), [FaqSection.tsx:258](../src/components/home/FaqSection.tsx#L258), [HeroWidget.tsx:339](../src/components/home/HeroWidget.tsx#L339) |
| 18/24 | `leading-6` | Body/XL 18/26 | 7 | [HaloBcaChat.tsx:360](../src/components/home/HaloBcaChat.tsx#L360), [CreditCardDetailHero.tsx:23](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L23), [KartuKreditCardList.tsx:474](../src/components/kartu-kredit/KartuKreditCardList.tsx#L474) |
| 24/28 | `leading-7` | Display/M 24/32 | 1 | [HeroSection.tsx:248](../src/components/home/HeroSection.tsx#L248) |
| 16/19 | `leading-[19px]` | Body/L 16/24 | 3 | [MobileHeroWidget.tsx:547](../src/components/home/MobileHeroWidget.tsx#L547), [MobileHeroWidget.tsx:572](../src/components/home/MobileHeroWidget.tsx#L572), [MobileHeroWidget.tsx:625](../src/components/home/MobileHeroWidget.tsx#L625) |
| 14/16 | `leading-4` | Body/M 14/20 | 3 | [MyBcaSection.tsx:57](../src/components/home/MyBcaSection.tsx#L57), [SignatureDirectoryCard.tsx:18](../src/components/prioritas/SignatureDirectoryCard.tsx#L18), [PromoMobileExperience.tsx:321](../src/components/promo/PromoMobileExperience.tsx#L321) |
| 24/31.2 | `leading-[1.3]` | Display/M 24/32 | 1 | [PromoSection.tsx:22](../src/components/home/PromoSection.tsx#L22) |
| 24/28.8 | `leading-[1.2]` | Display/M 24/32 | 1 | [SoliprioMobile.tsx:50](../src/components/home/SoliprioMobile.tsx#L50) |
| 30/37.5 | `leading-tight` | Display/XL 32/40 | 1 | [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22) |
| 48/60 | `leading-tight` | Display/3XL 48/56 | 1 | [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22) |
| 12/12 | `leading-none` | Body/S 12/18 | 1 | [CreditCardDetailSections.tsx:22](../src/components/kartu-kredit/CreditCardDetailSections.tsx#L22) |
| 18/28 | `xl:leading-7` | Body/XL 18/26 | 2 | [KartuKreditHero.tsx:70](../src/components/kartu-kredit/KartuKreditHero.tsx#L70), [PrioritasDetailExperience.tsx:495](../src/components/prioritas/PrioritasDetailExperience.tsx#L495) |
| 36/36 | `leading-none` | Display/XL 32/40 | 1 | [KrisflyerMileageSection.tsx:94](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L94) |
| 48/48 | `leading-none` | Display/3XL 48/56 | 1 | [KrisflyerMileageSection.tsx:94](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L94) |
| 18/23.4 | `leading-[1.3]` | Body/XL 18/26 | 1 | [BankingSolutionSection.tsx:92](../src/components/prioritas/BankingSolutionSection.tsx#L92) |
| 20/26 | `leading-[1.3]` | Display/S 20/28 | 1 | [BankingSolutionSection.tsx:92](../src/components/prioritas/BankingSolutionSection.tsx#L92) |
| 16/28 | `leading-7` | Body/L 16/24 | 1 | [CardSection.tsx:43](../src/components/prioritas/CardSection.tsx#L43) |
| 24/24 | `leading-none` | Display/M 24/32 | 1 | [FinancialReportOtpModal.tsx:76](../src/components/prioritas/FinancialReportOtpModal.tsx#L76) |
| 18/28 | `leading-7` | Body/XL 18/26 | 2 | [MemberAirportTransferModule.tsx:75](../src/components/prioritas/MemberAirportTransferModule.tsx#L75), [MemberMedicalCheckUpModule.tsx:30](../src/components/prioritas/MemberMedicalCheckUpModule.tsx#L30) |
| 20/24 | `leading-6` | Display/S 20/28 | 2 | [MemberOverview.tsx:89](../src/components/prioritas/MemberOverview.tsx#L89), [PrioritasEventDateTile.tsx:19](../src/components/prioritas/PrioritasEventDateTile.tsx#L19) |
| 12/15 | `leading-tight` | Body/S 12/18 | 1 | [CardVisual.tsx:122](../src/components/promo/CardVisual.tsx#L122) |
| 14/14 | `leading-[14px]` | Body/M 14/20 | 1 | [Tab.tsx:37](../src/components/ui/Tab.tsx#L37) |

Untuk Display/Heading, tracking normal atau tracking khusus lama tetap berlaku pada konsumen ukuran saja; acuan penuh memakai −0.02em. Weight 500 belum ada di Figma (400/600/700). Tidak ada vertical trim baru yang dipasang otomatis ke komponen produksi; Label tetap memiliki trim pada utility lengkapnya. Eyebrow hero kartu kredit tetap 18/28 semibold 600 dengan tracking normal.

## Lokasi semua varian yang berbeda ukuran/leading default

### `text-body-s-compact`

- [page.tsx:84](../src/app/[locale]/login/page.tsx#L84) — `text-body-s-compact`
- [AssetBank.tsx:50](../src/components/asset-bank/AssetBank.tsx#L50) — `text-body-s-compact`
- [AssetBank.tsx:63](../src/components/asset-bank/AssetBank.tsx#L63) — `text-body-s-compact`
- [AssetBank.tsx:66](../src/components/asset-bank/AssetBank.tsx#L66) — `text-body-s-compact`
- [AssetPreview.tsx:189](../src/components/asset-bank/AssetPreview.tsx#L189) — `text-body-s-compact`
- [DesignTokens.tsx:33](../src/components/design-tokens/DesignTokens.tsx#L33) — `text-body-s-compact`
- [DesignTokens.tsx:39](../src/components/design-tokens/DesignTokens.tsx#L39) — `text-body-s-compact`
- [DesignTokens.tsx:40](../src/components/design-tokens/DesignTokens.tsx#L40) — `text-body-s-compact`
- [DesignTokens.tsx:41](../src/components/design-tokens/DesignTokens.tsx#L41) — `text-body-s-compact`
- [DesignTokens.tsx:42](../src/components/design-tokens/DesignTokens.tsx#L42) — `text-body-s-compact`
- [DesignTokens.tsx:43](../src/components/design-tokens/DesignTokens.tsx#L43) — `text-body-s-compact`
- [DesignTokens.tsx:45](../src/components/design-tokens/DesignTokens.tsx#L45) — `text-body-s-compact`
- [DesignTokens.tsx:46](../src/components/design-tokens/DesignTokens.tsx#L46) — `text-body-s-compact`
- [DesignTokens.tsx:52](../src/components/design-tokens/DesignTokens.tsx#L52) — `text-body-s-compact`
- [DesignTokens.tsx:61](../src/components/design-tokens/DesignTokens.tsx#L61) — `text-body-s-compact`
- [DesignTokens.tsx:63](../src/components/design-tokens/DesignTokens.tsx#L63) — `text-body-s-compact`
- [DesignTokens.tsx:69](../src/components/design-tokens/DesignTokens.tsx#L69) — `text-body-s-compact`
- [DesignTokens.tsx:94](../src/components/design-tokens/DesignTokens.tsx#L94) — `text-body-s-compact`
- [DesignTokens.tsx:96](../src/components/design-tokens/DesignTokens.tsx#L96) — `text-body-s-compact`
- [DesignTokens.tsx:97](../src/components/design-tokens/DesignTokens.tsx#L97) — `text-body-s-compact`
- [DesignTokens.tsx:138](../src/components/design-tokens/DesignTokens.tsx#L138) — `text-body-s-compact`
- [DesignTokens.tsx:140](../src/components/design-tokens/DesignTokens.tsx#L140) — `text-body-s-compact`
- [DesignTokens.tsx:143](../src/components/design-tokens/DesignTokens.tsx#L143) — `text-body-s-compact`
- [DesignTokens.tsx:146](../src/components/design-tokens/DesignTokens.tsx#L146) — `text-body-s-compact`
- [DesignTokens.tsx:147](../src/components/design-tokens/DesignTokens.tsx#L147) — `text-body-s-compact`
- [DesignTokens.tsx:148](../src/components/design-tokens/DesignTokens.tsx#L148) — `text-body-s-compact`
- [DesignTokens.tsx:149](../src/components/design-tokens/DesignTokens.tsx#L149) — `text-body-s-compact`
- [DesignTokens.tsx:152](../src/components/design-tokens/DesignTokens.tsx#L152) — `text-body-s-compact`
- [DesignTokens.tsx:157](../src/components/design-tokens/DesignTokens.tsx#L157) — `text-body-s-compact`
- [CookieBanner.tsx:105](../src/components/home/CookieBanner.tsx#L105) — `text-body-s-compact`
- [Footer.tsx:169](../src/components/home/Footer.tsx#L169) — `text-body-s-compact`
- [Footer.tsx:206](../src/components/home/Footer.tsx#L206) — `text-body-s-compact`
- [Footer.tsx:216](../src/components/home/Footer.tsx#L216) — `text-body-s-compact`
- [Footer.tsx:218](../src/components/home/Footer.tsx#L218) — `text-body-s-compact`
- [HaloBcaChat.tsx:376](../src/components/home/HaloBcaChat.tsx#L376) — `text-body-s-compact`
- [HeroCompactWidget.tsx:101](../src/components/home/HeroCompactWidget.tsx#L101) — `text-body-s-compact`
- [HeroCompactWidget.tsx:122](../src/components/home/HeroCompactWidget.tsx#L122) — `text-body-s-compact`
- [HeroCompactWidget.tsx:126](../src/components/home/HeroCompactWidget.tsx#L126) — `text-body-s-compact`
- [HeroCompactWidget.tsx:140](../src/components/home/HeroCompactWidget.tsx#L140) — `text-body-s-compact`
- [HeroWidget.tsx:646](../src/components/home/HeroWidget.tsx#L646) — `text-body-s-compact`
- [HeroWidget.tsx:653](../src/components/home/HeroWidget.tsx#L653) — `text-body-s-compact`
- [HeroWidget.tsx:679](../src/components/home/HeroWidget.tsx#L679) — `text-body-s-compact`
- [LayoutSwitcher.tsx:131](../src/components/home/LayoutSwitcher.tsx#L131) — `text-body-s-compact`
- [MegaMenuPanel.tsx:65](../src/components/home/MegaMenuPanel.tsx#L65) — `text-body-s-compact`
- [NewsSection.tsx:12](../src/components/home/NewsSection.tsx#L12) — `text-body-s-compact`
- [NewsSection.tsx:15](../src/components/home/NewsSection.tsx#L15) — `text-body-s-compact`
- [ProductMegaMenuOverlay.tsx:195](../src/components/home/ProductMegaMenuOverlay.tsx#L195) — `text-body-s-compact`
- [ProductMegaMenuOverlay.tsx:328](../src/components/home/ProductMegaMenuOverlay.tsx#L328) — `text-body-s-compact`
- [QuickActionRail.tsx:131](../src/components/home/QuickActionRail.tsx#L131) — `text-body-s-compact`
- [SearchRecommendation.tsx:523](../src/components/home/SearchRecommendation.tsx#L523) — `text-body-s-compact`
- [SearchRecommendation.tsx:579](../src/components/home/SearchRecommendation.tsx#L579) — `text-body-s-compact`
- [CreditCardBenefitsFeatures.tsx:111](../src/components/kartu-kredit/CreditCardBenefitsFeatures.tsx#L111) — `text-body-s-compact`
- [CreditCardComparison.tsx:209](../src/components/kartu-kredit/CreditCardComparison.tsx#L209) — `text-body-s-compact`
- [CreditCardComparison.tsx:258](../src/components/kartu-kredit/CreditCardComparison.tsx#L258) — `text-body-s-compact`
- [CreditCardComparison.tsx:265](../src/components/kartu-kredit/CreditCardComparison.tsx#L265) — `text-body-s-compact`
- [CreditCardDetailSections.tsx:22](../src/components/kartu-kredit/CreditCardDetailSections.tsx#L22) — `text-body-s-compact`
- [KrisflyerMileageSection.tsx:62](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L62) — `text-body-s-compact`
- [KrisflyerMileageSection.tsx:92](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L92) — `text-body-s-compact`
- [KrisflyerMileageSection.tsx:97](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L97) — `text-body-s-compact`
- [KrisflyerMileageSection.tsx:99](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L99) — `text-body-s-compact`
- [FinancialReportExperience.tsx:208](../src/components/prioritas/FinancialReportExperience.tsx#L208) — `text-body-s-compact`
- [KursRatesCarousel.tsx:115](../src/components/prioritas/KursRatesCarousel.tsx#L115) — `text-body-s-compact`
- [MemberMedicalCheckUpModule.tsx:44](../src/components/prioritas/MemberMedicalCheckUpModule.tsx#L44) — `text-body-s-compact`
- [MemberOverview.tsx:68](../src/components/prioritas/MemberOverview.tsx#L68) — `text-body-s-compact`
- [PrioritasEventDateTile.tsx:16](../src/components/prioritas/PrioritasEventDateTile.tsx#L16) — `text-body-s-compact`
- [SignatureDirectoryCard.tsx:18](../src/components/prioritas/SignatureDirectoryCard.tsx#L18) — `text-body-s-compact`
- [CardVisual.tsx:100](../src/components/promo/CardVisual.tsx#L100) — `text-body-s-compact`
- [CardVisual.tsx:122](../src/components/promo/CardVisual.tsx#L122) — `text-body-s-compact`
- [PromoDetailExperience.tsx:38](../src/components/promo/PromoDetailExperience.tsx#L38) — `text-body-s-compact`
- [SiteMap.tsx:22](../src/components/site-map/SiteMap.tsx#L22) — `text-body-s-compact`
- [SiteMap.tsx:40](../src/components/site-map/SiteMap.tsx#L40) — `text-body-s-compact`
- [SiteMap.tsx:116](../src/components/site-map/SiteMap.tsx#L116) — `text-body-s-compact`
- [SiteMap.tsx:127](../src/components/site-map/SiteMap.tsx#L127) — `text-body-s-compact`
- [SiteMap.tsx:128](../src/components/site-map/SiteMap.tsx#L128) — `text-body-s-compact`
- [SiteMap.tsx:133](../src/components/site-map/SiteMap.tsx#L133) — `text-body-s-compact`
- [SiteMap.tsx:139](../src/components/site-map/SiteMap.tsx#L139) — `text-body-s-compact`
- [SiteMap.tsx:140](../src/components/site-map/SiteMap.tsx#L140) — `text-body-s-compact`
- [SiteMap.tsx:141](../src/components/site-map/SiteMap.tsx#L141) — `text-body-s-compact`
- [SiteMap.tsx:142](../src/components/site-map/SiteMap.tsx#L142) — `text-body-s-compact`
- [SiteMap.tsx:144](../src/components/site-map/SiteMap.tsx#L144) — `text-body-s-compact`
- [SiteMap.tsx:149](../src/components/site-map/SiteMap.tsx#L149) — `text-body-s-compact`
- [SourceMapping.tsx:11](../src/components/site-map/SourceMapping.tsx#L11) — `text-body-s-compact`
- [SourceMapping.tsx:14](../src/components/site-map/SourceMapping.tsx#L14) — `text-body-s-compact`
- [SourceMapping.tsx:18](../src/components/site-map/SourceMapping.tsx#L18) — `text-body-s-compact`
- [SourceMapping.tsx:22](../src/components/site-map/SourceMapping.tsx#L22) — `text-body-s-compact`
- [SourceMapping.tsx:23](../src/components/site-map/SourceMapping.tsx#L23) — `text-body-s-compact`
- [TextField.tsx:108](../src/components/ui/TextField.tsx#L108) — `text-body-s-compact`

### `text-body-xl-relaxed`

- [CookieBanner.tsx:133](../src/components/home/CookieBanner.tsx#L133) — `text-body-xl-relaxed`
- [FaqSection.tsx:258](../src/components/home/FaqSection.tsx#L258) — `text-body-xl-relaxed`
- [HaloBcaChat.tsx:360](../src/components/home/HaloBcaChat.tsx#L360) — `text-body-xl-relaxed`
- [HeroWidget.tsx:339](../src/components/home/HeroWidget.tsx#L339) — `text-body-xl-relaxed`
- [SearchOverlay.tsx:540](../src/components/home/SearchOverlay.tsx#L540) — `text-body-xl-relaxed`
- [CreditCardDetailHero.tsx:23](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L23) — `xl:text-body-xl-relaxed`
- [KartuKreditCardList.tsx:474](../src/components/kartu-kredit/KartuKreditCardList.tsx#L474) — `xl:text-body-xl-relaxed`
- [KartuKreditHero.tsx:70](../src/components/kartu-kredit/KartuKreditHero.tsx#L70) — `xl:text-body-xl-relaxed`
- [BankingSolutionSection.tsx:92](../src/components/prioritas/BankingSolutionSection.tsx#L92) — `text-body-xl-relaxed`
- [BankingSolutionSection.tsx:134](../src/components/prioritas/BankingSolutionSection.tsx#L134) — `text-body-xl-relaxed`
- [BankingSolutionSection.tsx:145](../src/components/prioritas/BankingSolutionSection.tsx#L145) — `text-body-xl-relaxed`
- [BankingSolutionSection.tsx:156](../src/components/prioritas/BankingSolutionSection.tsx#L156) — `text-body-xl-relaxed`
- [ExistingInformationContent.tsx:5](../src/components/prioritas/ExistingInformationContent.tsx#L5) — `text-body-xl-relaxed`
- [FinancialReportExperience.tsx:159](../src/components/prioritas/FinancialReportExperience.tsx#L159) — `md:text-body-xl-relaxed`
- [FinancialReportExperience.tsx:270](../src/components/prioritas/FinancialReportExperience.tsx#L270) — `md:text-body-xl-relaxed`
- [InformationContactChannels.tsx:39](../src/components/prioritas/InformationContactChannels.tsx#L39) — `text-body-xl-relaxed`
- [KursDetailExperience.tsx:131](../src/components/prioritas/KursDetailExperience.tsx#L131) — `text-body-xl-relaxed`
- [KursRatesCarousel.tsx:97](../src/components/prioritas/KursRatesCarousel.tsx#L97) — `text-body-xl-relaxed`
- [KursRatesCarousel.tsx:101](../src/components/prioritas/KursRatesCarousel.tsx#L101) — `xl:text-body-xl-relaxed`
- [KursRatesCarousel.tsx:105](../src/components/prioritas/KursRatesCarousel.tsx#L105) — `xl:text-body-xl-relaxed`
- [MagazineCard.tsx:24](../src/components/prioritas/MagazineCard.tsx#L24) — `text-body-xl-relaxed`
- [MagazineCard.tsx:24](../src/components/prioritas/MagazineCard.tsx#L24) — `md:text-body-xl-relaxed`
- [MemberAirportTransferModule.tsx:55](../src/components/prioritas/MemberAirportTransferModule.tsx#L55) — `text-body-xl-relaxed`
- [MemberAirportTransferModule.tsx:75](../src/components/prioritas/MemberAirportTransferModule.tsx#L75) — `text-body-xl-relaxed`
- [MemberMedicalCheckUpModule.tsx:30](../src/components/prioritas/MemberMedicalCheckUpModule.tsx#L30) — `text-body-xl-relaxed`
- [MemberMedicalCheckUpModule.tsx:38](../src/components/prioritas/MemberMedicalCheckUpModule.tsx#L38) — `text-body-xl-relaxed`
- [MemberOverview.tsx:70](../src/components/prioritas/MemberOverview.tsx#L70) — `text-body-xl-relaxed`
- [MemberSignatureVoucherModule.tsx:16](../src/components/prioritas/MemberSignatureVoucherModule.tsx#L16) — `text-body-xl-relaxed`
- [PrioritasDetailExperience.tsx:84](../src/components/prioritas/PrioritasDetailExperience.tsx#L84) — `text-body-xl-relaxed`
- [PrioritasDetailExperience.tsx:337](../src/components/prioritas/PrioritasDetailExperience.tsx#L337) — `xl:text-body-xl-relaxed`
- [PrioritasDetailExperience.tsx:495](../src/components/prioritas/PrioritasDetailExperience.tsx#L495) — `xl:text-body-xl-relaxed`
- [SiteMap.tsx:148](../src/components/site-map/SiteMap.tsx#L148) — `text-body-xl-relaxed`

### `text-display-compact`

- [AssetBank.tsx:55](../src/components/asset-bank/AssetBank.tsx#L55) — `text-display-compact`
- [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22) — `text-display-compact`
- [CreditCardTutorialSection.tsx:86](../src/components/kartu-kredit/CreditCardTutorialSection.tsx#L86) — `sm:text-display-compact`
- [KursDetailExperience.tsx:131](../src/components/prioritas/KursDetailExperience.tsx#L131) — `text-display-compact`

### `text-display-intermediate`

- [AssetBank.tsx:55](../src/components/asset-bank/AssetBank.tsx#L55) — `md:text-display-intermediate`
- [ComponentCatalog.tsx:68](../src/components/catalog/ComponentCatalog.tsx#L68) — `text-display-intermediate`
- [DesignTokens.tsx:140](../src/components/design-tokens/DesignTokens.tsx#L140) — `md:text-display-intermediate`
- [KrisflyerMileageSection.tsx:94](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L94) — `text-display-intermediate`
- [SiteMap.tsx:105](../src/components/site-map/SiteMap.tsx#L105) — `md:text-display-intermediate`

### `text-display-3xl-tight`

- [CreditCardDetailHero.tsx:22](../src/components/kartu-kredit/CreditCardDetailHero.tsx#L22) — `xl:text-display-3xl-tight`
- [KrisflyerMileageSection.tsx:94](../src/components/kartu-kredit/KrisflyerMileageSection.tsx#L94) — `sm:text-display-3xl-tight`

## Verifikasi

- Tidak ada pemakaian kelas ukuran stock di sumber website; entri `initial` di theme hanya menonaktifkan skala lama.
- Hasil compiler Tailwind 4.3.2 untuk sembilan utility pengganti mempertahankan size/leading lama dan tidak menambahkan weight, tracking, atau trim.
- 143 sampel typography Prioritas dan 58 sampel dokumentasi yang dapat dipasangkan mempertahankan font size, line height, weight, dan tracking di browser. Mobile Prioritas juga dicek.
- Penggabungan kelas diuji untuk warna, responsive sizes, override leading, dan resep Figma penuh.
- `npm run lint`: 0 error (124 warning yang sudah ada).
- `npm run typecheck`: lolos.
- `npm run build -- --webpack`: lolos. Build Turbopack yang berhenti di kompilasi dibatalkan; build menggunakan fallback data bawaan saat DNS layanan eksternal tidak tersedia.
