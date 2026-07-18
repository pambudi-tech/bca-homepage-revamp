# Archive

Code kept for reference but deliberately outside `src/`, so it is neither
compiled nor type-checked (see the `exclude` entry in `tsconfig.json`).

## PercentGlass.tsx

The 3D glass "%" that used to sit at the top of the Promo section, built with
three.js. It was commented out in `PromoSection.tsx` before this archive was
made, so it had already stopped shipping to the browser.

Moved out during the July 2026 performance pass, along with `npm uninstall three
@types/three`. To bring it back:

1. `npm install three @types/three`
2. Move this file to `src/components/home/PercentGlass.tsx`
3. Restore the `<PercentGlass />` usage in `PromoSection.tsx`

Worth knowing before you do: the material uses `transmission`, which makes
three.js render the scene a second time into a transmission buffer every frame.
Combined with `antialias: true` and a pixel ratio of 2, it was the single most
expensive thing on the page for mid-range Android. If it comes back, consider
dropping the pixel ratio to 1.5 and gating the whole effect behind a
"desktop + not reduced-motion" check.
