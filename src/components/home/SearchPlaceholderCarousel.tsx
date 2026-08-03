"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const PLACEHOLDER_LINE_HEIGHT = 48;

type SlotState = "active" | "exiting" | "waiting";
type Slot = { text: string; state: SlotState; instant: boolean };

function slotStyle(state: SlotState): CSSProperties {
  if (state === "active") return { transform: "translateY(0px)", opacity: 1 };
  if (state === "exiting")
    return { transform: `translateY(-${PLACEHOLDER_LINE_HEIGHT}px)`, opacity: 0 };
  return { transform: `translateY(${PLACEHOLDER_LINE_HEIGHT}px)`, opacity: 0 }; // waiting (below, ready to enter)
}

/**
 * The desktop search bar's rolling placeholder — one line slides up and out
 * while the next rises into its place. Shared by the hero widget and the
 * navbar's search overlay, which reuses that bar wholesale. (The mobile hero
 * widget keeps its own 14px variant.)
 *
 * `live` gates the timer: a hidden or closed host passes false and nothing
 * here ticks.
 */
export default function SearchPlaceholderCarousel({
  placeholders,
  visible,
  live,
}: {
  placeholders: string[];
  visible: boolean;
  live: boolean;
}) {
  const [slots, setSlots] = useState<Slot[]>([
    { text: placeholders[0], state: "active", instant: false },
    { text: placeholders[1 % placeholders.length], state: "waiting", instant: false },
  ]);
  const activeSlotRef = useRef(0);
  const nextIndexRef = useRef(2 % placeholders.length);

  useEffect(() => {
    if (!live) return;
    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    let rafOuter = 0;
    let rafInner = 0;

    const id = setInterval(() => {
      const activeIdx = activeSlotRef.current;
      const waitingIdx = activeIdx === 0 ? 1 : 0;

      setSlots((prev) => {
        const next = [...prev];
        next[activeIdx] = { ...next[activeIdx], state: "exiting" };
        next[waitingIdx] = { ...next[waitingIdx], state: "active" };
        return next;
      });
      activeSlotRef.current = waitingIdx;

      swapTimer = setTimeout(() => {
        const text = placeholders[nextIndexRef.current % placeholders.length];
        nextIndexRef.current += 1;
        setSlots((prev) => {
          const next = [...prev];
          next[activeIdx] = { text, state: "waiting", instant: true };
          return next;
        });
        rafOuter = requestAnimationFrame(() => {
          rafInner = requestAnimationFrame(() => {
            setSlots((prev) => {
              const next = [...prev];
              next[activeIdx] = { ...next[activeIdx], instant: false };
              return next;
            });
          });
        });
      }, 700);
    }, 2500);

    return () => {
      clearInterval(id);
      clearTimeout(swapTimer);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
    };
  }, [live, placeholders]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex items-center overflow-hidden px-6 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div className="relative h-12 w-full overflow-hidden">
        {slots.map((slot, i) => (
          <span
            key={i}
            className={`absolute inset-0 flex h-12 items-center whitespace-nowrap text-base font-semibold text-neutral-500 ${slot.instant ? "" : "transition-all duration-700 ease-in-out"
              }`}
            style={slotStyle(slot.state)}
          >
            {slot.text}
          </span>
        ))}
      </div>
    </div>
  );
}
