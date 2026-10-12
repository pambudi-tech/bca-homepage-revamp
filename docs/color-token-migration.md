# Color token consolidation — 2026-10-11

The catalogue now has Main Color (Neutral, Blue, Cyan, Prioritas Gold, Prioritas Brown), Semantic Color (Green, Yellow, Red), Accent Color (Bermuda, Brown, Muddy, Orange, Purple, Tosca, Teal), and Asset composition. Each family keeps its own title and usage description. Asset composition values are unchanged.

Consumers now use canonical palette names directly; voucher, action, documentation and legacy Prioritas color tokens were removed from CSS and the catalogue. Existing Figma ramp values are unchanged.

## Exact matches

Prioritas Gold/Brown aliases → corresponding `pgold` / `pbrown` shade. Background → Neutral 100; foreground → Neutral 800; primary → Blue 500; on-primary → Neutral 100; documentation background → Neutral 100.

## Values changed to the reference palette

| Previous role | Previous value | Canonical token | New value |
| --- | --- | --- | --- |
| Voucher available background | #d5ffd0 | green-300 | #c2ffc5 |
| Voucher available text | #22552f | green-700 | #005e2e |
| Voucher exhausted background | #f8dedb | red-300 | #ffd9d3 |
| Voucher exhausted text | #7c2929 | red-700 | #850e14 |
| Voucher warning background | #fff6ca | yellow-100 | #fff6c7 |
| Voucher warning text | #674b20 | yellow-700 | #885403 |
| Primary hover | #0068c0 | blue-400 | #1179d1 |
| Primary pressed | #00457f | blue-600 | #144e83 |
| Solitaire card fill and image fade | #000000 | neutral-900 | #121417 |
| Documentation foreground | oklch(0.145 0 0) | neutral-900 | #121417 |
| Documentation primary / secondary text / accent text | oklch(0.205 0 0) | neutral-900 | #121417 |
| Documentation inverse text | oklch(0.985 0 0) | neutral-100 | #ffffff |
| Documentation secondary / muted / accent surface | oklch(0.97 0 0) | neutral-200 | #f6f7f9 |
| Documentation muted text | oklch(0.556 0 0) | neutral-700 | #495057 |
| Documentation destructive | oklch(0.577 0.245 27.325) | red-500 | #cd1923 |
| Documentation border / input | oklch(0.922 0 0) | neutral-400 | #dfe3e7 |
| Documentation focus ring | oklch(0.708 0 0) | neutral-600 | #868e96 |

The documentation muted text uses Neutral 700 to retain legibility for small text. All existing opacity modifiers remain unchanged. These mappings change colors only, not component geometry.

## Solitaire card alignment

The owner approved merging the former pure black into Neutral 900 on 2026-10-11. Card fills, both image fade directions, and icon color metadata now use `--color-neutral-900` (#121417). The separate black token and its catalogue card were removed. This changes the Solitaire card surface from #000000 to #121417 without changing its layout.
