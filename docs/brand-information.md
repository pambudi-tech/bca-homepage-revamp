# Prioritas and Solitaire information pages

Both brands use the About/RIPLAY template (`PrioritasDetailExperience`) for
`/{brand}/ketentuan` and `/{brand}/kebijakan-privasi`. Contact pages at
`/{brand}/hubungi-kami` use the dedicated `BrandContactPage` layout.

## Existing content sources

Imported on 2026-10-11 from:

- https://prioritas.bca.co.id/en/Ketentuan
- https://prioritas.bca.co.id/en/Kebijakan-Privasi
- https://prioritas.bca.co.id/en/Hubungi-Kami

The existing pages serve Indonesian content at these URLs. Their original
wording is preserved in all three message files, instead of generating new
translations of legal documents. The surrounding navigation and contact interface
remain localized. There is no summary or CTA directing visitors to read the
complete page elsewhere.

## Content coverage

Ketentuan displays the original introduction as a subtitle beneath the page title, followed by all seven existing sections,
including the complete Business Community text inside Lain-lain. It contains
37 list items. The hold on building a Business Community feature does not remove
its terms from the existing document.

Privacy displays its original introduction as a subtitle beneath the page title, without the redundant introductory accordion, followed by all six existing sections,
including three complete tables, 114 list items, and the full security tips.
The importer compared normalized text of every source section with the imported
section and confirmed identical content. Nested lists, emphasis, links,
rowspans, and colspans are retained. Legacy styles and executable markup are
removed. Tables scroll within their own container on narrow screens.

Contact displays three visible channel cards for Halo BCA Prioritas 1500222,
X @HaloBCA, and branch lookup, followed by the head-office address and
phone/fax. Both original contact disclosure dialogs are retained. The branch
link points to the current brand's local branch finder. There are no accordions
or message form; message delivery is not an available feature. The introduction
has been updated to describe the available contact channels.

## Related information

All six public information pages (About, RIPLAY, Terms, Privacy, Contact, and
Find Us) share one related-page registry. Each page lists the other five pages
for its own brand.
