import type { ReactNode } from "react";

export const brandPageBackgrounds = {
  prioritas: "/assets/prioritas/member-overview/decoration.webp",
  solitaire: "/assets/prioritas/banking-solution/content-decoration.webp",
} as const;

type Tone = keyof typeof brandPageBackgrounds;

export function BrandPageBackground({ tone }: { tone: Tone }) {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <img data-brand-page-background={tone} src={brandPageBackgrounds[tone]} alt="" className="block h-auto w-full opacity-30 [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]" />
  </div>;
}

/** Starts at the header's bottom; content may still overlap the header above it. */
export default function BrandPageSurface({ tone, children, disabled = false }: { tone: Tone; children: ReactNode; disabled?: boolean }) {
  if (disabled) return <>{children}</>;
  return <div data-brand-page-surface={tone} className={`relative isolate flow-root ${tone === "solitaire" ? "bg-neutral-200" : "bg-pgold-200"}`}>
    <BrandPageBackground tone={tone} />
    {children}
  </div>;
}
