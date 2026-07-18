import { useEffect, useState, type RefObject } from "react";

/**
 * True while `ref`'s element is worth animating: on screen *and* in a visible
 * tab. Everything else — off-screen, backgrounded tab, or inside a
 * `display:none` container — reads as false.
 *
 * That last case is what makes this more useful than a breakpoint check. The
 * homepage mounts both the mobile and the desktop form of several components
 * and hides the unused one with CSS, so on a phone the desktop hero widget is
 * still a live React tree with live timers. An IntersectionObserver reports a
 * `display:none` element as not intersecting, so gating on this hook parks the
 * hidden copy's loops without having to duplicate the breakpoint in JS (which
 * would then have to be kept in sync with Tailwind's).
 *
 * Returns state rather than a ref so effects can list it as a dependency and
 * simply not start; it only flips on genuine visibility changes, so the extra
 * render is rare.
 */
export function useIsLive(ref: RefObject<HTMLElement | null>): boolean {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let inView = false;
    const sync = () => setLive(inView && !document.hidden);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      // A little slack so the loop is already running by the time the element
      // scrolls into view, rather than starting mid-frame at the edge.
      { rootMargin: "100px" }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);

  return live;
}
