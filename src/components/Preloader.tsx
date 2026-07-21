"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLenis } from "@/components/SmoothScroll";

/**
 * Intro loading page — Figma "Loading Page" (BCA.co.id Design Exploration,
 * node 1586-8385), desktop + mobile frames. Layout, type scale and motion live
 * in the `.pre-*` block in globals.css: the fluid clamps between the two Figma
 * artboards read far better as annotated CSS than as arbitrary Tailwind values.
 *
 * The progress bar is NOT decorative. It reports real completion of the
 * page's own subresources — every eager `<img>` in the document, the BCA
 * Sans faces, and the window `load` event — so the curtain only lifts once
 * the homepage behind it is genuinely painted and ready to interact with.
 * The only timing knobs are a short floor (so a warm cache doesn't flash)
 * and a stall ceiling (so one dead request can't strand the visitor).
 *
 * There is no pre-paint inline script and nothing mutates <html>: the loading
 * state is the CSS *default*, so the server-rendered markup already shows it
 * and hydration has nothing to reconcile. `data-phase` below is ordinary React
 * state, and the `.pre-*` rules key off it to park the navbar (.pre-nav) and
 * hero (.pre-stage), lock scrolling, and later run the handoff. The whole
 * block sits behind `(scripting: enabled) and (prefers-reduced-motion:
 * no-preference)`, so no-JS and reduced-motion visitors are never shown a
 * curtain that nothing would lift.
 */

export const PRELOADER_DONE_EVENT = "bca:preloader-done";

/** Shortest time the loading page stays up, so a cached revisit doesn't blink. */
const MIN_VISIBLE_MS = 700;
/** Ceiling on real loading. One hung request must not trap the visitor. */
const STALL_TIMEOUT_MS = 10_000;
/** Beat at 100% before the parallax exit starts. */
const HOLD_AT_100_MS = 420;
/** Exit runtime — keep in sync with the .pre-* transition durations. */
const EXIT_MS = 1350;
/** How long `.pre-revealing` stays on <html>. Must outlast the slowest
 *  handoff transition (the navbar's 800ms delay + 500ms travel), then go, so
 *  .pre-nav's own hide-on-scroll transition isn't saddled with that delay. */
const REVEALING_MS = 1600;

/** Classes the preloader puts on <html>; the `.pre-*` CSS keys off them. */
const PARK_CLASS = "preloading";
const REVEAL_CLASS = "pre-revealing";
/** How hard the displayed value chases the real one (higher = tighter). */
const CATCHUP = 3.4;
/** Floor on the climb rate (fraction/sec). Exponential catch-up alone is
 *  asymptotic, so the last few percent crawl; this closes them at a steady
 *  pace. It can never overshoot the real figure — see the clamp at the call
 *  site — so the bar stays honest, it just stops dawdling. */
const MIN_RATE = 0.5;

/** Relative weights, so fonts and full page load aren't drowned out by a
 *  large image count (and one image can't swing the number wildly). */
const IMAGE_WEIGHT = 1;
const FONTS_WEIGHT = 3;
const LOAD_WEIGHT = 3;

type Phase = "loading" | "exit" | "done";

/** Per-word tagline reveal timing. Longer words rise a little slower — a
 *  fixed duration would make "by"/"di" and "Always"/"Senantiasa" feel
 *  identical, and "Always"/"Senantiasa" alone should read as unhurried
 *  next to the short connector words around it. */
const WORD_BASE_MS = 360;
const WORD_PER_CHAR_MS = 22;
const WORD_MIN_MS = 320;
const WORD_MAX_MS = 620;
/** Fraction of a word's own duration that elapses before the next word
 *  starts rising. Below 1 so words overlap into a cascade rather than
 *  strictly waiting for one to finish before the next begins — still reads
 *  as "one after another", just without a dead beat between each. */
const WORD_STAGGER = 0.55;
/** Delay before the first word starts, so the tagline doesn't rise before
 *  the logo above it has begun its own entrance. */
const WORD_START_DELAY_MS = 160;

type WordTiming = { word: string; durationMs: number; delayMs: number };

function buildWordTimings(words: string[], startDelayMs: number): WordTiming[] {
  let delay = startDelayMs;
  return words.map((word) => {
    const durationMs = Math.min(
      WORD_MAX_MS,
      Math.max(WORD_MIN_MS, WORD_BASE_MS + word.length * WORD_PER_CHAR_MS)
    );
    const timing: WordTiming = { word, durationMs, delayMs: delay };
    delay += durationMs * WORD_STAGGER;
    return timing;
  });
}

/** Interleaves plain space text nodes between word spans so the words read
 *  as a normal sentence — the clip wrappers are inline-block, which would
 *  otherwise collapse the whitespace between them. */
function withSpaces(nodes: React.ReactNode[]): React.ReactNode[] {
  return nodes.flatMap((node, i) => (i === 0 ? [node] : [" ", node]));
}

function TaglineWords({ timings }: { timings: WordTiming[] }) {
  return (
    <>
      {withSpaces(
        timings.map((t, i) => (
          <span className="pre-word-clip" key={i}>
            <span
              className="pre-word-inner"
              style={{ animationDuration: `${t.durationMs}ms`, animationDelay: `${t.delayMs}ms` }}
            >
              {t.word}
            </span>
          </span>
        ))
      )}
    </>
  );
}

export default function Preloader() {
  const t = useTranslations("preloader");
  const [tagline1, tagline2] = t.raw("tagline") as [string, string];
  const [phase, setPhase] = useState<Phase>("loading");
  const barRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Word timings are pure functions of the translated strings, so they're
  // stable across re-renders without needing a memo — recomputing them is
  // cheaper than the dependency check would be.
  const words1 = tagline1.split(" ");
  const words2 = tagline2.split(" ");
  const allTimings = buildWordTimings([...words1, ...words2], WORD_START_DELAY_MS);
  const timings1 = allTimings.slice(0, words1.length);
  const timings2 = allTimings.slice(words1.length);

  // Park Lenis while the loading page is up. The cleanup restarts it as soon
  // as the phase leaves "loading" — scrolling during the exit is fine, the
  // homepage is already there underneath.
  useEffect(() => {
    if (!lenis || phase !== "loading") return;
    lenis.stop();
    return () => {
      lenis.start();
      // The document sat at `overflow: hidden` for the whole hold, so the
      // scroll limit Lenis cached is the clamped one. Without this it stops
      // short of the real page height and scrolling feels stuck.
      lenis.resize();
    };
  }, [lenis, phase]);

  useEffect(() => {
    // Mirrors the media query gating the CSS: reduced-motion visitors never
    // see the loading page, so tear it down at once and let anything waiting
    // on the done event proceed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Deferred rather than set inline — setState in an effect body is a
      // cascading render. One extra frame of an element the gate already
      // keeps at display:none costs nothing.
      const teardown = window.setTimeout(() => {
        window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
        setPhase("done");
      }, 0);
      return () => clearTimeout(teardown);
    }

    const cleanups: (() => void)[] = [];
    const timers: number[] = [];

    // Park the page behind the curtain. Landing this here rather than in the
    // server markup is what keeps hydration clean; the curtain is already
    // opaque by then, so the frames before it are never seen.
    const root = document.documentElement;
    root.classList.add(PARK_CLASS);
    cleanups.push(() => root.classList.remove(PARK_CLASS, REVEAL_CLASS));

    // ---- real asset accounting -------------------------------------------
    // This effect runs after hydration, so the server-rendered markup is
    // fully parsed and `document.images` is the true above-the-fold set.
    // Lazy images are skipped deliberately: they are meant to arrive during
    // scrolling, so waiting on them would stall the loader on work the
    // visitor does not need yet.
    const images = Array.from(document.images).filter(
      (img) => img.loading !== "lazy" && Boolean(img.currentSrc || img.src)
    );

    const total = images.length * IMAGE_WEIGHT + FONTS_WEIGHT + LOAD_WEIGHT;
    let loaded = 0;
    const settle = (weight: number) => {
      loaded = Math.min(total, loaded + weight);
    };

    for (const img of images) {
      if (img.complete) {
        settle(IMAGE_WEIGHT);
        continue;
      }
      // A broken image still counts as resolved — the page is as ready as it
      // is ever going to be, and the loader must not hang on a 404.
      let counted = false;
      const onSettled = () => {
        if (counted) return;
        counted = true;
        settle(IMAGE_WEIGHT);
      };
      img.addEventListener("load", onSettled, { once: true });
      img.addEventListener("error", onSettled, { once: true });
      cleanups.push(() => {
        img.removeEventListener("load", onSettled);
        img.removeEventListener("error", onSettled);
      });
    }

    document.fonts.ready.then(
      () => settle(FONTS_WEIGHT),
      () => settle(FONTS_WEIGHT)
    );

    if (document.readyState === "complete") {
      settle(LOAD_WEIGHT);
    } else {
      const onLoad = () => settle(LOAD_WEIGHT);
      window.addEventListener("load", onLoad, { once: true });
      cleanups.push(() => window.removeEventListener("load", onLoad));
    }

    // Nothing real is allowed to hold the page hostage.
    timers.push(
      window.setTimeout(() => {
        loaded = total;
      }, STALL_TIMEOUT_MS)
    );

    // ---- display loop ------------------------------------------------------
    let raf = 0;
    let finished = false;
    let shown = 0;
    const start = performance.now();
    let last = start;

    let revealRaf = 0;
    cleanups.push(() => cancelAnimationFrame(revealRaf));

    const finish = () => {
      if (finished) return;
      finished = true;
      timers.push(
        window.setTimeout(() => {
          setPhase("exit");
          window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));

          // Two steps on purpose. `.pre-revealing` only adds transitions, so
          // this frame changes no values; dropping `.preloading` on the next
          // one is what releases the parked nav and hero, and by then the
          // transitions are already part of their computed style. Collapsing
          // both into one recalc makes the browser skip the animation and
          // snap instead.
          root.classList.add(REVEAL_CLASS);
          revealRaf = requestAnimationFrame(() => {
            root.classList.remove(PARK_CLASS);
          });

          timers.push(window.setTimeout(() => setPhase("done"), EXIT_MS));
          timers.push(
            window.setTimeout(() => root.classList.remove(REVEAL_CLASS), REVEALING_MS)
          );
        }, HOLD_AT_100_MS)
      );
    };

    const frame = (now: number) => {
      // Clamped so a backgrounded tab doesn't jump the bar on return.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = total > 0 ? loaded / total : 1;
      const remaining = target - shown;
      // Whichever is faster — the eased chase or the steady floor — but never
      // more than the distance left, so the bar can't run past what has
      // actually loaded.
      shown += Math.min(
        remaining,
        Math.max(remaining * (1 - Math.exp(-CATCHUP * dt)), MIN_RATE * dt)
      );

      // 1 is reserved for "actually done" — the eased value would otherwise
      // round up to it while requests are still in flight.
      const settled = target >= 1 && now - start >= MIN_VISIBLE_MS;
      if (settled && shown > 0.995) shown = 1;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${shown})`;
      }

      if (shown >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      for (const t of timers) clearTimeout(t);
      for (const c of cleanups) c();
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="pre-root"
      data-phase={phase}
      role="status"
      aria-busy={phase === "loading"}
      aria-label="Memuat halaman BCA"
    >
      {/* Everything below rides the shell, which slides a full viewport up on
          exit and carries its children with it. */}
      <div className="pre-shell">
        <div className="pre-bg" aria-hidden="true">
          {/* Two artboards, one request — the browser picks before fetching.
              Each SVG carries `preserveAspectRatio="xMidYMax slice"`, so the
              clove motif stays cover-cropped against the bottom edge. */}
          <picture>
            <source media="(min-width: 768px)" srcSet="/assets/loading/bg-desktop.svg" />
            <img src="/assets/loading/bg-mobile.svg" alt="" />
          </picture>
        </div>

        <div className="pre-layer pre-head" aria-hidden="true">
          <img src="/assets/cycle1/bca-logo.svg" alt="" className="pre-logo" />
          <p className="pre-tagline">
            <TaglineWords timings={timings1} />
            {/* Hidden above the mobile artboard's breakpoint, where the Figma
                desktop frame sets the tagline on a single line. */}
            <br className="pre-br" />{" "}
            <TaglineWords timings={timings2} />
          </p>
        </div>

        <div className="pre-bar" aria-hidden="true">
          <div ref={barRef} className="pre-bar-fill" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
