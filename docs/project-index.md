# Project index

`/project-index` is the project entry page, localized in Indonesian, English,
and Chinese. Documentation and Prototype appear together on one page.
Documentation
shows Component Catalog, Asset Bank, Design Tokens, and Site Map as cards
in a responsive horizontal grid. Prototype links only to Prioritas/Solitaire
public homepages and contains the demo member access details in each brand card.
The page opens with its title, without an eyebrow or introduction.
The documentation workspace navigation includes a link back to this index.
User Flows remains hidden from navigation and is not listed here.

Each prototype card combines its homepage link, demo BCA ID, email, password,
copy buttons, and brand-specific login link. Each card reuses BrandPageSurface,
TextField, and PrioritasButton recipes in its corresponding brand tone. A full-width
cover uses the public index header artwork, dark brand background, gradient,
and inverse prototype link above the credential body. The credential panel
overlaps the cover by 56px; the cover reserves matching space below its link. Prototype and login links open
in new tabs; member overview links are omitted. These values come from
`src/lib/member-demo-credentials.ts`, also used by the member login action.
Only prototype accounts belong in this dataset.

The Financial Report note describes the existing demo behavior: any six-digit
code except `000000` grants ten minutes of portfolio access. No email is sent.
The copyable OTP example field is omitted. Portfolio and voucher data are samples.

The page uses the Site Map wrapper (documentation font, 64px header,
1800px content limit, and matching responsive padding), native scrolling,
design tokens, and next-intl. Its metadata disables indexing and following.
