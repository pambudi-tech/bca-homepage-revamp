"use client";

import { prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function KursRefreshButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label={label}
      className={prioritasButtonClassName({ kind: "icon", variant: "secondary", surface: "default", size: "small" })}
    >
      <span aria-hidden="true" className="size-5 shrink-0 bg-current [mask-image:url('/assets/prioritas/banking/refresh.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/prioritas/banking/refresh.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" />
    </button>
  );
}
