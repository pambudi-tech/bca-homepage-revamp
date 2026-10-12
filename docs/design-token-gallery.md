# Design Tokens gallery

The documentation workspace includes `/design-tokens`, `/en/design-tokens`,
and `/zh/design-tokens`, linked from the shared workspace navigation.

The gallery combines the supplied Figma references and website implementation
in one list, with no separate source-view switch. Matching Figma styles/colors
and CSS definitions share a card. Existing project additions, legacy aliases,
component recipes, and project size variants remain available. The stock
Tailwind typography group was removed after the migration on 2026-10-11.
The section-level difference summary and comparison-status filters have been
removed after reference alignment. Color palettes and the six typography filters (All, Display, Eyebrow,
Heading, Body, Label) remain available. The empty project-additions filter,
search field and overall token-count badge were removed at the owner’s request. Matching cards no longer show a redundant “Matches reference” status panel.
Individual cards retain their reference mapping and
can show value differences without changing website styles automatically.
Figma source badges are hidden across token cards. Color cards replace the single background utility example with a collapsed
usage-token accordion. The collection lists existing semantic/component custom
properties that directly reference each primitive, with their actual CSS selectors,
inline conditional branches, values, source paths, and token-name copy controls.
The scanner reads website CSS and TSX at prerender time and excludes documentation
specimens. It preserves state-specific and derived values rather than presenting
a scoped component variable as a global fixed alias. Primitives without a specific
usage token show an explicit empty state; no new color tokens are invented.
Color palettes are rendered as sections matching the typography layout: each
family has its own title, token count and localized purpose description above
the swatches. Shared segmented toggles (`CatalogOptions`) select both color and typography categories and breakpoint presets. Four category filters group the families into Main Color, Semantic Color, Accent Color, and Asset composition. All shows every category.
Typography cards use the same usage-token accordion in place of the
standalone utility chip. Existing typography aliases are listed inside the collection,
with size, leading, weight and tracking assignments grouped under one token name.
Both collections are read from `token-usage.ts`; no new tokens are invented.
Color and typography usage-token accordions are temporarily hidden at the
owner's request. Their mappings and disclosure content remain available in code;
the standalone utility chips remain removed.
Names and values have separate copy controls. Typography samples are editable,
and each typography group has a short description of its intended use.
Category hashes such as `/design-tokens#breakpoints` open that category directly.

`src/components/design-tokens/token-data.ts` reads the installed Tailwind theme
and the project's `@theme` blocks during prerendering. The resulting data goes
to the gallery as serializable props. Updating the owning source updates the
gallery on the next build. The canonical typography recipes are in the global
theme. Eight existing typography names remain available as aliases. The owner
approved reference alignment on 2026-10-11: `text-subtitle` uses normal
tracking from Body/Semibold/XL; `text-heading` aliases Heading/M at 700;
`text-hero-title-mobile` aliases Display/L at 28/32. `text-eyebrow-xl`
remains 16/16. The credit-card hero introduction uses Body/Semibold/L
at 16/24 and Body/Semibold/XL at 18/26 on desktop; its former 18/28
Eyebrow/Hero/Desktop recipe is merged into Body. The gallery compares every alias against its actual canonical target. Matching
project aliases are merged into the reference card, where their CSS names
remain copyable; they do not appear as separate additions. The former compact/intermediate size variants are now aliases of Display/L
(28/32) and the owner-added Display/2XL (36/40), with Display tracking and weight.
Three former size variants were approved for reference alignment on
2026-10-11: Body/S 12/18, Body/XL 18/26, and Display/4XL 48/56.
Their names now alias the complete canonical metrics and are merged into the
corresponding reference cards. Display/3XL is now 40/48 and Display/4XL is 48/56. The unified scale has
40 canonical styles with 13 matching legacy aliases and no separate additions.
The new 36/40 style is marked as a project addition within Display, since it
was approved in chat rather than transcribed from the supplied screenshots.
See [the migration report](typography-migration.md) for the decisions and migration history.

Figma colors are stored in `src/components/design-tokens/figma-colors.json`,
copied unchanged from the owner-supplied `bca-variable-color.json`. All 67
reference colors are defined in the project theme with their supplied values,
including neutral-400 at #dfe3e7 and the 40 previously missing definitions.
Prioritas Gold/Brown remain available as project additions. The former pure black was merged into Neutral 900 at the owner’s request. Voucher, action, documentation, and legacy Prioritas aliases were migrated to canonical colors and removed as separate tokens. See [the color migration report](color-token-migration.md) for value changes.
The gallery continues to detect differences or missing definitions from the
owning CSS, rather than assuming alignment.

Typography is transcribed from the supplied screenshots in
`figma-typography.ts`: Display 600, Heading 700, Eyebrow 600, Body/Label
400/600/700. Tracking follows the approved project reference; it was not
part of the supplied screenshots. Label/Semibold/S remains 12/14 as shown.
`text-label-*` utilities apply `text-box-trim: trim-both` and
`text-box-edge: cap alphabetic`. Label specimens display trim directly; the separate Body/Label comparison
panel and the explanatory paragraphs below the sample input were removed.
Unsupported browsers retain the line box.
Existing production components do not acquire vertical trim automatically.

The gallery distinguishes project tokens, inherited Tailwind defaults, and
component recipes. Glass recipes are read from the actual shared CSS classes;
they are not presented as new global blur tokens. Numeric spacing entries are
derived from `--spacing`, and px equivalents assume a 16px root font size.
`rounded-none` and `rounded-full` are utility rules rather than CSS variables.

The layout simulator reads the tablet boundary from `--breakpoint-md` and the
desktop boundary from `src/lib/useIsDesktop.ts`. Homepage, Index and Detail
selectors render the real Prioritas homepage, Privilege index and Executive
Airport Lounge detail page in isolated same-origin preview documents. The iframe
has the simulated viewport width and a 900px viewport height, scaled down to fit
the documentation panel. Native CSS media queries and viewport units therefore
respond to the simulation rather than the surrounding documentation window.
Both the frame wrapper and page tree are inert; the frame cannot receive pointer
or keyboard interactions. The frozen preview context parks supported autoplay
loops. Only these dedicated preview routes allow same-origin framing; production
page framing policies remain unchanged. Homepage hero notes describe
the Prioritas/Solitaire branch in `src/components/home/HeroSection.tsx`; revisit
these localized notes if that component's height rules change.

All gallery copy is in the `designTokens` namespace in the three locale files.
The page uses the shared Neutral and Red palettes, has no preloader or reveal
dependency, and is marked `noindex, nofollow` like the other workspace pages.

Documentation routes use native browser scrolling. `SmoothScroll` bypasses
Lenis for the documentation workspace, nested catalog preview routes, and the
legacy button/content-card audit pages in every locale. Leaving a website page
for documentation unmounts the Lenis provider and cleans up its listeners and
animation loop. Asset preview dialogs retain a native body-scroll lock.

The main heading and subtitle follow the active category (Colors, Typography,
etc.). The generic Design Tokens introduction and duplicate category heading
were removed; the category region references the main heading for its label.

The visible catalogue contains Colors, Typography, Glass panel and Breakpoints.
Spacing, rounded corners and motion are omitted from navigation and hash selection.
Glass panel shows only the Prioritas and Solitaire recipes; production styles remain unchanged.
