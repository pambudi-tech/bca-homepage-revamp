"use client";

import { useEffect } from "react";
import { onPreloaderDone } from "@/components/Preloader";

/**
 * Global scroll-reveal controller — the runtime half of the `[data-reveal]`
 * CSS in globals.css. Mount it once per page; sections then opt in with data
 * attributes alone, so server components stay server components:
 *
 * - `data-reveal` / `data-reveal="fade" | "blur-up"` — the animated element.
 * - `data-reveal-group` — observed container; its `[data-reveal]` descendants
 *   are staggered in DOM order. A numeric value overrides the per-step gap
 *   (`data-reveal-group="60"`). Elements outside any group are observed
 *   individually. Don't nest groups.
 * - `data-reveal-delay="200"` — explicit delay (ms) for one element; it is
 *   skipped by the auto-stagger counter.
 *
 * Each entrance plays once. Once a target has been revealed it is unobserved
 * and its elements keep their final state for the rest of the session, so
 * scrolling back over a section never replays or flashes it.
 */

/** Must match the transition duration in the `[data-reveal]` CSS. */
const REVEAL_DURATION_MS = 700;
const DEFAULT_STAGGER_MS = 90;
/** Longest auto-stagger delay — late cards in a big grid shouldn't straggle. */
const MAX_STAGGER_DELAY_MS = 540;
/** Reveal fires when the element clears the bottom 12% of the viewport. */
const ENTER_ROOT_MARGIN = "0px 0px -12% 0px";

type Member = { el: HTMLElement; delayMs: number };

export default function ScrollReveal() {
  useEffect(() => {
    // Reduced motion: the CSS never hides anything, so there is nothing to
    // orchestrate — skip the observers entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const setup = () => {
      const groups = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal-group]")
      );
      const standalone = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]")
      ).filter((el) => !el.closest("[data-reveal-group]"));

      // Observed target -> the reveal elements it drives.
      const members = new Map<HTMLElement, Member[]>();

      const register = (el: HTMLElement, delayMs: number): Member => {
        el.style.setProperty("--rv-delay", `${delayMs}ms`);
        return { el, delayMs };
      };

      for (const group of groups) {
        const stagger =
          Number(group.getAttribute("data-reveal-group")) || DEFAULT_STAGGER_MS;
        let step = 0;
        members.set(
          group,
          Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]")).map(
            (el) => {
              const explicit = el.getAttribute("data-reveal-delay");
              const delay =
                explicit !== null
                  ? Number(explicit)
                  : Math.min(step++ * stagger, MAX_STAGGER_DELAY_MS);
              return register(el, delay);
            }
          )
        );
      }
      for (const el of standalone) {
        members.set(el, [register(el, Number(el.getAttribute("data-reveal-delay")) || 0)]);
      }

      // Once an entrance settles, drop `data-reveal` so the element's own
      // utility transitions (hover lifts, color fades) take over again — the
      // reveal transition is unlayered CSS and would override them forever.
      // A timer (not transitionend) so display:none members still get cleaned.
      const cleanupTimers = new Map<HTMLElement, number>();

      const reveal = (target: HTMLElement) => {
        for (const m of members.get(target) ?? []) {
          m.el.setAttribute("data-inview", "");
          cleanupTimers.set(
            m.el,
            window.setTimeout(() => {
              m.el.removeAttribute("data-reveal");
              cleanupTimers.delete(m.el);
            }, m.delayMs + REVEAL_DURATION_MS + 100)
          );
        }
      };

      const enterIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            // Play once: stop watching the moment it fires, so scrolling back
            // over a section never re-triggers the choreography.
            enterIO.unobserve(entry.target);
            reveal(entry.target as HTMLElement);
          }
        },
        { rootMargin: ENTER_ROOT_MARGIN }
      );

      for (const target of members.keys()) enterIO.observe(target);

      return () => {
        enterIO.disconnect();
        for (const timer of cleanupTimers.values()) clearTimeout(timer);
        // Nothing orchestrates reveals after unmount, so leave everything
        // visible rather than parked at opacity 0.
        for (const list of members.values()) {
          for (const m of list) {
            m.el.removeAttribute("data-reveal");
            m.el.removeAttribute("data-inview");
            m.el.style.removeProperty("--rv-delay");
          }
        }
      };
    };

    // While the intro preloader holds the page, defer observing until its
    // curtain starts lifting — otherwise anything sitting in the first
    // viewport (e.g. after a mid-page reload) would play its entrance behind
    // the opaque overlay and be long settled by the time it is visible.
    let teardown: (() => void) | undefined;
    const arm = () => {
      teardown = setup();
    };
    // Armed once the preloader is out of the way — or immediately if it already
    // finished or never ran (reduced motion).
    const stop = onPreloaderDone(arm);
    return () => {
      stop();
      teardown?.();
    };
    return () => teardown?.();
  }, []);

  return null;
}
