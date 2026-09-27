"use client";

import { useId, useRef, useState } from "react";

export default function InfoTip({ label, message }: { label: string; message: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={rootRef} className="group/infotip relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((visible) => !visible)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        className="inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <img aria-hidden src="/assets/member-login/info.svg" alt="" className="size-6" />
      </button>
      {open ? (
        <span id={id} role="tooltip" className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-sm leading-5 text-neutral-800 shadow-panel">
          {message}
          <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-br-[4px] border-r border-b border-neutral-200 bg-white" />
        </span>
      ) : null}
    </span>
  );
}
