"use client";

import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function KursCarouselControls({ previousLabel, nextLabel, onPrevious, onNext, tone = "prioritas" }: { previousLabel: string; nextLabel: string; onPrevious: () => void; onNext: () => void; tone?: "prioritas" | "solitaire" }) {
  const buttonClassName = tone === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName;
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrevious} aria-label={previousLabel} className={buttonClassName({ kind: "icon", variant: "secondary", surface: tone === "solitaire" ? "default" : "inverse", size: "medium" })}>
        <PrioritasButtonIcon src="/assets/cycle1/chevron-left-1.svg" />
      </button>
      <button type="button" onClick={onNext} aria-label={nextLabel} className={buttonClassName({ kind: "icon", variant: "secondary", surface: tone === "solitaire" ? "default" : "inverse", size: "medium" })}>
        <PrioritasButtonIcon src="/assets/cycle1/chevron-right-1.svg" />
      </button>
    </div>
  );
}
