# Asset Bank

Open `/asset-bank` (or `/en/asset-bank`, `/zh/asset-bank`). The component catalog header links to the bank, and the bank links back to the catalog.

The bank uses the catalog's `docs-*` theme tokens, with a visual grid, collection navigation, sorting, and a native dialog for inspection. Search, brand/format filters, reset-filter controls, and the list-view switch are omitted in every collection. Asset Bank and Site Map headers are 64px tall, with accessible icon navigation on narrow screens. Preview backgrounds help inspect transparent artwork. The preview supports smooth 100–1600% zoom via buttons, slider, trackpad pinch, and two-finger touch pinch; enlarged artwork can be dragged or panned with trackpad scrolling. Focus the preview for +/−, 0 to reset, and arrow-key panning. Zoom resets when changing assets, motion stops when settled or unmounted, and reduced-motion preferences bypass interpolation. SVGs render at the zoomed dimensions to preserve vector sharpness. Pixel dimensions, file sizes, downloads, and shareable asset hashes are available in the dialog; file paths and source references stay in the inventory rather than the preview interface. Images load progressively with small WebP thumbnails; downloads use the optimized full-resolution web files.

## Inventory

Run `npm run assets:refresh` after adding assets or changing inline SVG icons. The deterministic generator writes `src/components/asset-bank/asset-manifest.json`, canonical icons under `public/assets/icons/`, and generated previews under `public/assets/asset-bank/`. Icon export uses Python 3's standard XML library before the Node inventory generator.

- Collect design assets for the Prioritas and Solitaire revamp from their dedicated folders, `soliprio`, and member login, including Hero, Financial Report, Banking Privilege, logos, icons, flags, backgrounds, and section illustrations. Include shared SVG files explicitly referenced by branded pages/components; exclude general BCAcoid assets and campaign/directory photography, including The Weeknd and myBCA JRF heroes and advertising photography such as Mercedes-Benz.
- Exclude directory photography from Complimentary, Lifestyle Privilege, Event, and Promo: `partners`, `partner-logos`, `source-promo`, `signature-privilege`, raster privilege detail images, promo cards/event banners, campaign images, and Solitaire event photography. Preserve section backgrounds, decorations, category icons, Hero artwork, and the Banking Privilege dataset.
- Extract static inline SVGs from Prioritas, Solitaire, and member components, plus a small explicit set of shared controls used by these experiences, and the Lucide icons they import. Deduplicate identical inline artwork by content hash while preserving its source references. Generated names retain the owning function/component name; original file labels derive from their filenames unless curated. Background and decoration labels identify the artwork’s function, section, and brand; translated labels are also searchable. File paths and asset IDs remain stable when display names change.
- Interactive charts, SVGs that depend on runtime values, and CSS-generated effects remain in their owning components, rather than becoming misleading static exports. Remote directory imagery is not downloaded.
- Static source references use literal file paths, plus the Banking Privilege data registry for its interpolated paths and privilege artwork registry consumers. An empty reference list means no literal reference was detected, not proof that a file is unused. Brand filters include shared artwork used by both experiences.

All interface labels have matching `assetBank` keys in the Indonesian, English, and Chinese message files. Asset filenames retain their descriptive names; canonical raster paths use WebP after migration.

## Unified functional icons

The audited 49 SVG variants now resolve to 37 distinct shapes, with one neutral-800 export per shape. `icon-source-data.json` retains the original source geometry and source references for reproducible export; obsolete colored SVG files have been removed. `build-unified-icons.py` creates the canonical files and `icon-library.json`. Colors and sizes are presentation metadata consumed by `IconAsset`, rather than separate exported assets. New consumers can use `/assets/icons/arrow-right.svg` and supply `color="currentColor"` with a text color class. Existing button masks retain their inherited color and hover/pressed treatment.

Arrow Right merges seven former filenames, including the misnamed `download-icon`; the real downward Download remains separate. Chevron Right also owns the misnamed `chevron-up` source (consumer rotations remain intact). Chevron Down, Info, and filled warning variants are unified. The exchange arrows are named Swap, and the four-tile member menu icon is Dashboard. Filled and outlined warnings remain distinct shapes. Close Circle and filled warning use transparent symbol cutouts in neutral exports; component accent colors restore their existing two-color status treatment. Original padding/crop metadata preserves compact dropdown sizing, and the padel viewBox bounds remain intact.

All 49 legacy SVG URLs redirect directly to their canonical file with HTTP 308, and their old Asset Bank detail hashes resolve to the same canonical asset. Brand favicons remain dedicated browser metadata; Signature Padel and Prodia raster artwork is excluded from the bank. Neither is a functional monochrome icon.

## Curated canonical assets

Hero contains only the homepage artwork for Prioritas and Solitaire. Card compositions use the current homepage assets in Cards & Banking, with obsolete card exports omitted. Personal Banker belongs to Banking Privilege. The blue `card-visual` export resolves to the existing gold Prioritas visual; Cards & Banking exposes the gold and grey artwork already used by the site, with explicit brand labels. Currency-code flags resolve to the canonical China, Indonesia, Singapore, and United States SVGs. Financial Report uses the same brand-specific backgrounds in the homepage and member overview, via `financial-report-assets.ts`; duplicate composites, OTP envelope, and raw blue decorations are omitted from the bank. Wealth Insight imagery, all magazine covers, and partner voucher logos are directory content and excluded. Logos contain only BCA, Prioritas, and Solitaire; white logos default to a dark preview.

`privilege-assets.ts` defines the full source artwork used by the homepage sections and Soliprio benefit cards. Healthcare uses one image across Prioritas, Solitaire, and the shared banner; `object-cover` in each wrapper owns its crop. Duplicate exports and pre-cropped health/lounge/event images resolve to their canonical source. Lounge and event retain distinct brand art where the scene or treatment differs.

`asset-redirects.json` defines canonical destinations for duplicate file URLs. Next.js redirects those URLs with 308 responses, preserving queries. The inventory generator also writes `asset-aliases.json` for assets included in the bank so existing Asset Bank detail hashes open the canonical asset and update the hash rather than losing the selection. Original files remain on disk for recoverability.

## Full-resolution WebP

`node scripts/convert-asset-bank-webp.mjs` converts PNG/JPG/JPEG files in the current inventory to lossless WebP, preserving resolution, transparency, and metadata including colour profiles. It verifies decoded visible RGB pixels and every alpha value against the source before updating references. Fully transparent RGB values may be discarded by WebP without changing the rendered image. Run `npm run assets:refresh` afterwards to rebuild the inventory, previews, and detail aliases.

The migration updates both literal and constant-root paths in components/data, and flattens all old file redirects to their WebP destinations. PNG/JPG originals are retained for recovery and excluded from the live inventory. This lossless migration precedes web optimization; lossless WebP can be larger than an existing lossy JPEG.

## Optimized full-resolution web assets

Run `node scripts/optimize-asset-bank.mjs`, followed by `npm run assets:refresh`. The optimizer retains pre-optimization WebP sources under ignored `.cache/asset-bank-originals/` and records sizes, encoder quality, resolution, and measured similarity in `optimization-report.json` there. Subsequent runs use those retained sources rather than repeatedly compressing an already-compressed export. PNG/JPG migration sources also remain on disk.

The optimizer keeps pixel dimensions, ICC profiles, and exact alpha values. It chooses smaller lossless output when useful, or high-quality WebP at quality 92–98 (88–90 only for oversized files that still pass the similarity threshold). Local luminance SSIM must be at least 0.985 at a 1024px inspection size. This is a perceptual quality check, not a guarantee of identical pixels: lossy compression intentionally changes encoded colour values. Small files stay unchanged unless lossless recompression helps. Gallery thumbnails are still separate from full-resolution downloads.

Large SVG exports with embedded PNG textures keep their vector geometry and bitmap dimensions. Embedded PNGs receive lossless compression without palette quantization, and both bitmap pixels and complete SVG rasterization are checked for equality. PNG is retained inside SVG for renderer compatibility.

`node scripts/export-solitaire-otp-svg.mjs` exports the Solitaire OTP email icon from the canonical Prioritas SVG, preserving its paths, gradients, texture, viewBox, and transparency. An internal SVG sRGB saturation filter reproduces CSS `grayscale(1)`, so the exported file works standalone without external styles. The OTP modal and Asset Bank use these same brand-specific files through `financialReportOtpIcons`. Regenerate the bank inventory after re-exporting.

The obsolete Signature Airport PNG/WebP resolves directly to `/assets/icons/airplane.svg` and is omitted from the bank. Member Overview uses that canonical SVG in its existing 40px mask: Prioritas retains `pbrown-600`, and Solitaire retains `neutral-800`. Legacy download URLs and Asset Bank detail hashes resolve to Airplane.

Signature Padel and Prodia are excluded from Asset Bank. Prodia remains available to its existing member directory consumer; its file route still works. The functional Padel Racket SVG remains in Icons.

The gold Prioritas and silver Solitaire silk backdrops are shared by member content, public directory indexes, and brand detail pages through `BrandPageSurface.tsx`, starting below each page header at 30% opacity and fading gradually to transparent at the bottom. Member surfaces resolve the authenticated brand. The three original Prioritas Banking Solution, Event & Promo, and Privilege decoration SVGs are omitted from the inventory; existing homepage uses remain intact.

`/assets/soliprio/soliprio-pattern.svg` is also omitted from the inventory because its consumers are the general homepage's `SoliprioSection` and `SoliprioMobile`, rather than dedicated Prioritas or Solitaire pages. Keep the original SVG and those homepage references.
