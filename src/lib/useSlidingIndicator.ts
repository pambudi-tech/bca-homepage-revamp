"use client";
import { useLayoutEffect, useRef } from "react";

/** Measure actual labels so the indicator also supports translations and wrapped rows. */
export function useSlidingIndicator(value: string) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const update = () => {
      const selected = root.querySelector<HTMLElement>('[aria-pressed="true"]');
      const indicator = root.querySelector<HTMLElement>("[data-sliding-indicator]");
      if (!indicator) return;
      if (!selected) { indicator.style.opacity = "0"; return; }
      indicator.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`;
      indicator.style.width = `${selected.offsetWidth}px`;
      indicator.style.height = `${selected.offsetHeight}px`;
      indicator.style.opacity = "1";
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    for (const child of root.querySelectorAll("button")) observer.observe(child);
    return () => observer.disconnect();
  }, [value]);
  return ref;
}
