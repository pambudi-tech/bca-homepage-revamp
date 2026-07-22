"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "layout-variant:";

/**
 * Prototype-only: lets the client flip a section between layout variants from
 * the in-page LayoutSwitcher. The choice is persisted per section so a refresh
 * (or a shared screen being reloaded mid-presentation) keeps what they picked.
 *
 * Reads from localStorage in an effect rather than during render so the server
 * and first client render agree on the default and we don't trip hydration.
 *
 * Note for future variants: ScrollReveal scans the DOM only once on mount, so
 * a variant subtree that mounts after a switch must not emit `data-reveal` —
 * it would never be observed and would sit at opacity 0 forever.
 */
export function useLayoutVariant<T extends string>(section: string, fallback: T, allowed: readonly T[]) {
  const [variant, setVariant] = useState<T>(fallback);

  useEffect(() => {
    // A stored value can outlive the variant that wrote it (a layout option
    // was renamed or dropped), which would leave the switcher with nothing
    // selected — fall back to the default unless it's still on the menu.
    const stored = window.localStorage.getItem(STORAGE_PREFIX + section) as T | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, unavailable during server render
    if (stored && allowed.includes(stored)) setVariant(stored);
  }, [section]);

  const select = useCallback(
    (next: T) => {
      setVariant(next);
      window.localStorage.setItem(STORAGE_PREFIX + section, next);
    },
    [section],
  );

  return [variant, select] as const;
}
