"use client";

import { useEffect } from "react";

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
      // Older/embedded browsers may not expose IntersectionObserver. The
      // reveal CSS intentionally hides opted-in content only while scripting
      // is active, so remove the marker and show everything when the runtime
      // cannot orchestrate the entrance.
      if (typeof IntersectionObserver === "undefined") {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
          el.removeAttribute("data-reveal");
          el.removeAttribute("data-inview");
          el.style.removeProperty("--rv-delay");
        });
        return () => {};
      }

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

      let visibilityFrame = 0;
      const revealVisible = () => {
        visibilityFrame = 0;
        const revealLine = window.innerHeight * 0.88;
        for (const target of members.keys()) {
          if (target.hasAttribute("data-inview")) continue;
          const rect = target.getBoundingClientRect();
          if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= revealLine) continue;
          enterIO.unobserve(target);
          reveal(target);
        }
      };
      const scheduleVisibilityCheck = () => {
        if (!visibilityFrame) visibilityFrame = requestAnimationFrame(revealVisible);
      };

      const syncGroup = (group: HTMLElement) => {
        const existing = members.get(group) ?? [];
        const known = new Set(existing.map((member) => member.el));
        const stagger =
          Number(group.getAttribute("data-reveal-group")) || DEFAULT_STAGGER_MS;
        let step = existing.length;
        for (const el of Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"))) {
          if (known.has(el)) continue;
          const explicit = el.getAttribute("data-reveal-delay");
          const delay =
            explicit !== null
              ? Number(explicit)
              : Math.min(step++ * stagger, MAX_STAGGER_DELAY_MS);
          existing.push(register(el, delay));
        }
        members.set(group, existing);
      };

      const registerGroup = (group: HTMLElement) => {
        const isNew = !members.has(group);
        syncGroup(group);
        if (isNew) {
          enterIO.observe(group);
        }
      };

      const registerStandalone = (el: HTMLElement) => {
        if (el.closest("[data-reveal-group]") || members.has(el)) return;
        members.set(el, [register(el, Number(el.getAttribute("data-reveal-delay")) || 0)]);
        enterIO.observe(el);
      };

      for (const group of groups) registerGroup(group);
      for (const el of standalone) registerStandalone(el);

      // Client sections such as Promo and News can mount after the initial
      // scan finishes. Keep the same one-shot reveal behavior for those late
      // nodes instead of leaving their [data-reveal] opacity at zero forever.
      const lateMountObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.matches("[data-reveal-group]")) registerGroup(node);
            node.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach(registerGroup);
            const parentGroup = node.closest<HTMLElement>("[data-reveal-group]");
            if (parentGroup) syncGroup(parentGroup);
            if (node.matches("[data-reveal]")) registerStandalone(node);
            node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(registerStandalone);
          }
        }
      });
      lateMountObserver.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
      window.addEventListener("resize", scheduleVisibilityCheck);
      document.documentElement.classList.add("reveal-ready");
      scheduleVisibilityCheck();

      return () => {
        lateMountObserver.disconnect();
        window.removeEventListener("scroll", scheduleVisibilityCheck);
        window.removeEventListener("resize", scheduleVisibilityCheck);
        if (visibilityFrame) cancelAnimationFrame(visibilityFrame);
        document.documentElement.classList.remove("reveal-ready");
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

    const teardown = setup();
    return () => {
      teardown();
    };
  }, []);

  return null;
}
