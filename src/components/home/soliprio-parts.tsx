/**
 * Presentational pieces shared by the Soliprio section's desktop (server) and
 * mobile (client) bands. They live here rather than in SoliprioSection because
 * that module imports `sharp` for the beam colours — pulling it into a client
 * component would drag a Node-only dependency into the browser bundle.
 */

/** Blurred-disc vignette (see `.soliprio-glow` in globals.css). */
export function Glow({
  radius,
  sigma,
  className,
}: {
  radius: number;
  sigma: number;
  className: string;
}) {
  const size = 2 * (radius + 3 * sigma);
  return (
    <div
      aria-hidden
      className={`soliprio-glow pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        // @ts-expect-error -- custom properties consumed by .soliprio-glow
        "--glow-r": `${radius}px`,
        "--glow-s": `${sigma}px`,
      }}
    />
  );
}

export function Logos({ variant }: { variant: "desktop" | "mobile" }) {
  const desktop = variant === "desktop";
  return (
    <div className={`flex items-center ${desktop ? "gap-[27px]" : "gap-4"}`}>
      <img
        loading="lazy"
        decoding="async"
        src="/assets/soliprio/solitaire-logo.svg"
        alt="BCA Solitaire"
        className={desktop ? "h-10 w-[124px]" : "h-8 w-[99px]"}
      />
      <img
        loading="lazy"
        decoding="async"
        src="/assets/soliprio/prioritas-logo.svg"
        alt="BCA Prioritas"
        className={desktop ? "h-10 w-[106px]" : "h-8 w-[85px]"}
      />
    </div>
  );
}
