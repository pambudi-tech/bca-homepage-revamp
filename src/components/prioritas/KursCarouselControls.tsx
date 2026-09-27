"use client";

export default function KursCarouselControls({ previousLabel, nextLabel, onPrevious, onNext }: { previousLabel: string; nextLabel: string; onPrevious: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrevious} aria-label={previousLabel} className="flex size-10 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pgold-200">
        <img src="/assets/cycle1/chevron-left-1.svg" alt="" aria-hidden className="size-5" />
      </button>
      <button type="button" onClick={onNext} aria-label={nextLabel} className="flex size-10 items-center justify-center rounded-full bg-black/30 transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pgold-200">
        <img src="/assets/cycle1/chevron-right-1.svg" alt="" aria-hidden className="size-5" />
      </button>
    </div>
  );
}
