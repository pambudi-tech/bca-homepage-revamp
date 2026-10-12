"use client";

import { useSlidingIndicator } from "@/lib/useSlidingIndicator";
import { Button } from "./ui/button";

/** Catalog controls select variants; the previews keep showing their states together. */
export default function CatalogOptions<T extends string>({ label, value, onChange, options, hideLabel = false }: { label: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[]; hideLabel?: boolean }) {
  const ref = useSlidingIndicator(value);
  return <div className="space-y-2">
    {!hideLabel && <p className="text-size-body-m text-neutral-700">{label}</p>}
    <div ref={ref} role="group" aria-label={label} className="relative inline-flex flex-wrap gap-1 rounded-lg bg-neutral-200 p-1">
      <span data-sliding-indicator aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-md bg-neutral-100 opacity-0 shadow-sm transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none" />
      {options.map(option => <Button key={option.value} type="button" variant="ghost" size="sm" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={value === option.value ? "relative z-10 bg-transparent text-size-body-m text-neutral-900 hover:bg-transparent" : "relative z-10 text-size-body-m text-neutral-700"}>{option.label}</Button>)}
    </div>
  </div>;
}
