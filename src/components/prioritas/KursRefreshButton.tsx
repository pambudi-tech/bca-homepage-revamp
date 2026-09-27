"use client";

export default function KursRefreshButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label={label}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-transform hover:rotate-180 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pgold-200"
    >
      <img src="/assets/prioritas/banking/refresh.svg" alt="" aria-hidden className="size-5 shrink-0" />
    </button>
  );
}
