"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InfoTip({ label, message, tone = "neutral" }: { label: string; message: string; tone?: "neutral" | "prioritas" | "solitaire" }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowX: 0, above: true, ready: false });
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!open || position.ready) return;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current?.getBoundingClientRect();
    if (!trigger || !tooltip) return;
    const viewportPadding = 8;
    const left = Math.max(viewportPadding, Math.min(
      trigger.left + trigger.width / 2 - tooltip.width / 2,
      window.innerWidth - tooltip.width - viewportPadding,
    ));
    const above = trigger.top - tooltip.height - 10 >= viewportPadding;
    const top = above
      ? trigger.top - tooltip.height - 10
      : Math.min(trigger.bottom + 10, window.innerHeight - tooltip.height - viewportPadding);
    const arrowX = Math.max(12, Math.min(trigger.left + trigger.width / 2 - left, tooltip.width - 12));
    setPosition({ top, left, arrowX, above, ready: true });
  }, [open, message, position.ready]);

  useEffect(() => {
    if (!open) return;
    const onViewportChange = () => setPosition((current) => ({ ...current, ready: false }));
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="group/infotip relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setOpen(false);
        }}
        onClick={() => {
          if (window.matchMedia("(hover: hover)").matches) setOpen(true);
          else setOpen((visible) => !visible);
        }}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        className="inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {tone === "prioritas" || tone === "solitaire" ? <span aria-hidden className={`size-6 ${tone === "solitaire" ? "bg-blue-500" : "bg-pbrown-500"}`} style={{ maskImage: "url(/assets/member-login/info.svg)", WebkitMaskImage: "url(/assets/member-login/info.svg)", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center", maskSize: "contain", WebkitMaskSize: "contain" }} /> : <img aria-hidden src="/assets/member-login/info.svg" alt="" className="size-6" />}
      </button>
      {open ? createPortal(
        <span ref={tooltipRef} id={id} role="tooltip" style={{ position: "fixed", top: position.top, left: position.left, visibility: position.ready ? "visible" : "hidden" }} className={`z-[120] w-56 max-w-[calc(100vw-16px)] rounded-xl border px-3 py-2 text-left text-sm leading-5 shadow-panel ${tone === "solitaire" ? "border-neutral-700 bg-neutral-800 text-neutral-200" : "border-neutral-200 bg-white text-neutral-800"}`}>
          {message}
          <span aria-hidden style={{ left: position.arrowX, ...(position.above ? { bottom: -6 } : { top: -6 }) }} className={`absolute size-3 rotate-45 ${tone === "solitaire" ? "border-neutral-700 bg-neutral-800" : "border-neutral-200 bg-white"} ${position.above ? "rounded-br-[4px] border-r border-b" : "rounded-tl-[4px] border-l border-t"}`} />
        </span>,
        document.body,
      ) : null}
    </span>
  );
}
