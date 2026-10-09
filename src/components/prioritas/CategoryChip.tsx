import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared recipe used by the privilege directory and component catalog. */
export default function CategoryChip({ tone = "prioritas", size = "medium", xlLarge = false, icon, children, ...props }: { tone?: "prioritas" | "solitaire"; size?: "medium" | "large"; xlLarge?: boolean; icon: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={`priosoli-chip ${tone === "solitaire" ? "priosoli-chip--solitaire" : ""} priosoli-chip--${size} ${xlLarge ? "priosoli-chip--xl-large" : ""}`}><span aria-hidden className="priosoli-chip__icon" style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }} /><span>{children}</span></button>;
}
