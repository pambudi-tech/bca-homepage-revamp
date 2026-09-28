"use client";

import { prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function KursRefreshButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label={label}
      className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "inverse", size: "small" })}
    >
      <img src="/assets/prioritas/banking/refresh.svg" alt="" aria-hidden className="size-5 shrink-0" />
    </button>
  );
}
