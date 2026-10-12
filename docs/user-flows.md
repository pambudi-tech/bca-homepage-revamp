# User Flows

Open `/user-flows`, `/en/user-flows`, or `/zh/user-flows`. The shared documentation navigation connects this page to the Component Catalog, Asset Bank, Design Tokens, and Site Map.

The guide covers Prioritas and Solitaire public/member experiences, plus the separate project preview gate. It currently contains **16 journeys and 105 scenarios**, audited against the implementation on **12 October 2026**. This is a bounded inventory of implemented paths and identified exceptions, not a claim that every possible browser or future backend condition has been implemented.

## Reading and interaction

- **Flow lobby:** `/user-flows` opens a directory of all 16 journeys, grouped by audience. Cards show each journey's description and matching case count. Search and brand, scenario-type, and implementation-status filters belong to this lobby.
- **Full-width flow:** selecting a card opens its journey without a journey side menu. “Back to flow directory” returns to the lobby and retains the current filters. Browser Back/Forward also navigates between lobby and flow. Shared documentation navigation stays in the header.
- **Case workspace:** desktop places a compact case list beside the UI preview. Cases are grouped by Normal, Negative, Alternative, Recovery, and Edge, with colored labels and counts. Case rows show only the case title; selecting one opens its result immediately. The original 105 cases remain unchanged.
- **Always-visible preview:** the workspace fills the viewport. The case list and preview scroll independently, so choosing a case does not push its UI below the page. Mobile uses a compact selector with grouped case options above the preview and defaults to the mobile source viewport.
- **Stages and explanation:** a small path above the preview switches source context, input/condition, and result. Recovery text stays with the result. Long response descriptions and implementation references stay in a collapsed disclosure. There is no Play mode or sequential gate.
- **One inert UI:** source components render once, with pointer input and focus disabled. Focus view crops the source to the relevant dialog, form, summary, module, or directory panel. Ordinary long modules are bounded to 640px on desktop and 760px on mobile, with 24px of surrounding context; expanded voucher lists keep their relevant internal scroll. The unrelated remainder of a source page cannot be scrolled into view in focus mode. Contained dialogs fit the available height; full-screen navigation/search panels retain source width and scrolling. Blue numbered markers attach directly to real click, selection, and input targets; purple markers identify responses. Passive stages do not invent actions. “Full screen” fits the entire source width, and “Focus UI” returns to the relevant area. Desktop/mobile controls select a 1440px/390px source viewport. Scrolling and these documentation controls remain usable.
- Shareable hashes use `#all|prioritas|solitaire/journey/scenario/stage`, with stages `0`–`2` (legacy stage `3` links open stage `2`) (for example `#all/portfolio/rejected/2`). Legacy hashes without a stage open the result stage. Valid links open the flow directly; a missing or invalid hash opens the lobby. Copying a link preserves case, brand, and stage. Loading a case link clears search/type/status filters. The related-page link opens a representative prototype page.

Native controls, visible focus, and status announcements support keyboard and mobile use. Preview performs no login, OTP request, message sending, booking, download, or voucher redemption. Neither a test framework nor a graph/rendering dependency was added.

Preview reuses owning components and page data. The Privilege route and preview share `PublicPrivilegeView`; benefit detail, voucher, and medical screens share `PartnerPrivilegeDetailView`. Homepage and member overview snapshots use their owning page composition with demo preview branding. Search uses the actual `SearchOverlay`. Remaining specialized scenes reuse existing controls, headers, and assets. Branch previews reuse the actual desktop panel and mobile card rail; ordinary network maps are omitted and map failure reuses the owning failure surface. External failures and unhandled server/storage/session conditions can retain the same on-site UI; the stage explanation states the behavioral difference.

## Coverage

| Journey | Cases covered |
| --- | --- |
| Website navigation | Desktop/mobile navigation, direct tabs, unknown section, legacy links, locale changes, cancellation |
| Search | Matches, no results, blank input, recommendations/history, cancellation, restricted browser storage |
| Listings | Cards, combined filters, empty results, pagination boundaries, Birthday Gift, switching tabs |
| Benefit detail | Public information, login continuation, Solitaire-only restrictions, Solitaire Signature modules, unknown IDs |
| Member login | BCA ID/email, valid demo credentials, format/password validation, incorrect credentials, different account brand, unsafe redirects, cancellation, unavailable account recovery, request failure |
| Protected pages | Matching/missing/expired/mismatched sessions, unknown routes, open-page expiry, blocked cookies, accounts changed in another tab |
| Financial Report/OTP | Masked amounts, demo verification/rejection, missing phone selection, partial/non-numeric input, resend countdown, missing phone data, cancellation, hide/reveal, session expiry/revisit, unknown report type, failed verification request |
| Vouchers/transfer | Available, unlimited, penalty, exhausted, copy success/failure, used voucher, expanding vouchers |
| Medical check-up | Location selection, copying, WhatsApp handoff, unavailable partner/app, cancellation |
| Banking Solution/rates | Banking details, external wealth reports, prototype rates/fallback, converter/swap, invalid amount, refresh |
| e-Magazine | Issue pagination, public/member reading links, missing reader continuation, invalid issue parameter |
| Branch finder | Default origin, permission granted/denied, unavailable GPS, manual search, no suggestions, failed nearby updates, external directions, map failure, fast queries/cancellation |
| Information/support | Original documents, contact disclosure/handoff/cancellation, branch lookup, absence of message form/tickets |
| Logout/segments | Confirm/cancel, desktop segment change, protected URL after logout, request failure |
| Reports/data/interruption | Report periods, placeholder download, bundled fallback, offline, pending actions, failed external handoff |
| Preview gate | Disabled gate, correct/incorrect password, eight-hour inactivity; separate from member/portfolio sessions |

## Status and accuracy

Each scenario has one primary classification: normal, negative, alternative, recovery, or edge case. Categories describe the path, not its implementation completeness.

- **Available:** behavior exists in the current implementation.
- **Demo:** simulated account/data/verification; not an operational banking service.
- **Not yet handled:** incomplete integration or missing recovery. The description distinguishes actual behavior from a required next step.
- **External channel:** the prototype hands off to another site/app and cannot confirm completion.

Notable boundaries: OTP accepts any six digits other than `000000`, sends no SMS, and does not enforce code expiry/rate limits. Its 119-second countdown controls Resend. Member sessions last eight hours; portfolio-view sessions last ten minutes. Lounge status variants come from a demo query, not live entitlement checks. Copying a voucher does not redeem it. Financial Report download is a notice. e-Magazine cards open login, with no post-login reader continuation. A WhatsApp booking link drafts text; sending and booking confirmation occur outside the prototype. Rate estimates use reference/fallback data, not official BCA transaction rates.

The source disclosure on each journey names its owning files. These are implementation references, not results from automatically executing all 105 scenarios. Some outcomes (permission denial, disconnected services, partner failure) are documented from source inspection rather than induced against real services.

## Maintenance

`src/components/user-flows/flow-data.ts` owns IDs, areas, representative URLs, source references, brand constraints, types, statuses, and shareable hashes. `flow-graph.ts` owns journey-specific opening nodes. `flow-pages.tsx` assembles source page data for frozen previews. `flow-preview-state.ts` maps all case/stage combinations to a scene and state; `flow-preview-annotations.ts` resolves actual source controls and relevant crop regions; `FlowUIPreview.tsx` renders the single inert UI excerpt. Optional preview props on owning components initialize frozen states without changing their normal behavior. Preview nodes remount when their case/stage/brand/device changes so local state cannot leak between cases. Copy belongs in the `userFlows` namespace of all three `messages/{id,en,zh}.json` files with matching keys.

When behavior changes, update its trigger, response, next step, status, references, and audit date together. Add a case when a new decision or failure changes the result; reuse a journey when only content IDs differ. Preserve scenario IDs for shared links. Review neighboring journeys when changing authentication, account brand, OTP, or a shared data source.

The page statically generates the three locales and sets no-index metadata. Documentation uses native scrolling via `SmoothScroll`.

## Verification notes

Verification uses lint, typecheck, a Webpack production build in a separate temporary checkout to avoid sharing `.next` output with the running development server, and browser checks of lobby selection, return navigation, direct case links, one inert preview, filters, and responsive layout. The preceding lobby revision passed lint (0 errors, 124 warnings), typecheck, and the isolated production build. Browser checks confirmed all 16 lobby links, no preview in the lobby, one inert preview in a selected flow, full-width content without a journey rail, return/filter retention, and no horizontal overflow at 390px. Translation key sets match across all three locales. Earlier metadata validation covered all 420 case/stage mappings and share-link roundtrips. These checks do not execute banking or partner services.

The earlier production test server rendered `/en/user-flows`, but unprefixed `/user-flows` and the existing `/site-map` both returned repeating redirects. The development `/user-flows` page works. This change does not alter the shared locale proxy.

The case-and-preview layout revision was browser-checked at 1344×978 and 390×844: grouped case selection, direct stage jumps, preview mode switching, one inert source UI, in-place action markers, OTP rejection, login credential/format errors, empty directory results, and no horizontal page overflow. Focused crops omit unrelated source sections; dialog content and error targets remain visible. The existing inventory is unchanged at 16 journeys / 105 cases.

Final gates for this revision: lint passed with 0 errors / 124 existing warnings, typecheck passed, and the isolated Webpack production build passed. The development server was restarted after a Next.js hot-reload initialization error; a fresh browser tab restored direct case links, stage changes, action/response annotations, and one inert preview with no runtime errors.


The 12 October UI accuracy audit covers all 105 cases and all 315 active stages on desktop and mobile, plus 200 Solitaire state renders. See [the full audit and case matrix](user-flows-ui-audit.md) for findings, ownership, verification evidence and scope limits.
