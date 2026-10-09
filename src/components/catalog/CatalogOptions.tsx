"use client";

import { Button } from "./ui/button";

/** Catalog controls select variants; the previews keep showing their states together. */
export default function CatalogOptions<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return <div className="space-y-2">
    <p className="text-xs text-docs-muted-foreground">{label}</p>
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg bg-docs-muted p-1">
      {options.map(option => <Button key={option.value} type="button" variant="ghost" size="sm" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={value === option.value ? "bg-docs-background text-docs-foreground shadow-sm hover:bg-docs-background" : "text-docs-muted-foreground"}>{option.label}</Button>)}
    </div>
  </div>;
}
