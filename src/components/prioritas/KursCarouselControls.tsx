"use client";

import { prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function KursCarouselControls({ previousLabel, nextLabel, onPrevious, onNext }: { previousLabel: string; nextLabel: string; onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrevious} aria-label={previousLabel} className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "inverse", size: "medium" })}>
        <img src="/assets/cycle1/chevron-left-1.svg" alt="" aria-hidden className="size-5" />
      </button>
      <button type="button" onClick={onNext} aria-label={nextLabel} className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "inverse", size: "medium" })}>
        <img src="/assets/cycle1/chevron-right-1.svg" alt="" aria-hidden className="size-5" />
      </button>
    </div>
  );
}
