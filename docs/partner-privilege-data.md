# Partner privilege data snapshot

Imported on 27 September 2026 from the [BCA Solitaire/Prioritas partner spreadsheet](https://docs.google.com/spreadsheets/d/1DCcyaDvBIC0_4Qi3YxV-0_nuyK1W8_0o178VbfDgHro/edit).

- `partner-privilege-data.json`: 216 partner profiles, 95 Complimentary benefits, and 190 Lifestyle Privilege benefits. Each benefit references one partner ID; 86 partners occur in both lists.
- `partner-privilege-assets.json`: one shared asset record per partner. Its `heroImage` points to a local file under `public/assets/prioritas/partners`; `originImageUrl` and `sourceUrl` preserve the [official BCA partner page](https://prioritas.bca.co.id/en/Privilege/Partner-Privilege) provenance.
- `partner-privilege-logos.json`: 105 partner logo files with their source page and original image URL; sources include partner-owned sites, verified brand channels, and reputable partner directories or storefronts. Logo records are keyed by partner ID, so partners listed in both benefit categories reuse the same logo. Logos were sourced from partner owned websites or official brand channels; partners without a verified logo use the existing text fallback.
- The Birthday Gift filter follows the `Jenis` column in the Complimentary tab (22 rows).
- The spreadsheet contains Indonesian benefit and partner copy only. Shared interface labels remain localized in `messages/{id,en,zh}.json`.

The public BCA partner pages supplied hero/listing images for 196 partners, including two brand-specific Birthday Gift pages. The detail pages inspected did not expose separate brand logos. Verified sources currently supply 105 partner logos; other cards display a text brand mark. A single logo record per partner is shared across Complimentary and Lifestyle Privilege. The public pages checked did not supply verified hero images for these 20 partners:

1. Avery Beauty, Malang
2. Natasha Skin Clinic Center
3. Miracle Aesthetic Clinic, Malang
4. Clinic De Votre Peau
5. AMB Consulting
6. Pathlab
7. GiO Dental Care
8. SOUNDLIFE Hearing Center
9. Flying Doctor Indonesia
10. RS Cahya Kawaluyan
11. Persada Hospital
12. KPJ Healthcare
13. Maystar Restaurant
14. Altius Bahari Indonesia
15. Garrya Bianti Yogyakarta
16. Royal Tulip Gunung Geulis Resort & Golf
17. Hotel Mason Pine Bandung
18. WITA TOUR
19. Kinderfield School Jambi
20. Urbanloft
