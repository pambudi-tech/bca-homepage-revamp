"use client";

import { useState, type CSSProperties, type Ref } from "react";
import { useTranslations } from "next-intl";

// Shared with any parent running the autoplay timer — the ring radius/circumference
// must match what the parent uses to compute strokeDashoffset.
export const DOT_RADIUS = 14;
export const DOT_CIRCUMFERENCE = 2 * Math.PI * DOT_RADIUS;

function PlayIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill={color} aria-hidden>
      <path d="M2 1.2v9.6l8-4.8-8-4.8z" />
    </svg>
  );
}

function PauseIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill={color} aria-hidden>
      <rect x="2" y="1.5" width="2.6" height="9" />
      <rect x="7.4" y="1.5" width="2.6" height="9" />
    </svg>
  );
}

type SlideDotsProps = {
  count: number;
  activeIndex: number;
  paused: boolean;
  onSelect: (index: number) => void;
  onTogglePause: () => void;
  /** Ref for the active dot's progress-ring circle — the parent's timer writes
      strokeDashoffset directly to it (no per-tick React state/re-render). */
  progressRef: Ref<SVGCircleElement>;
  activeColor?: string;
  inactiveColor?: string;
  /** Color the inactive dot eases toward on hover. Defaults to `inactiveColor`
      (no change) — pass a brighter/fuller variant to mimic a "lighten on hover". */
  inactiveHoverColor?: string;
  trackColor?: string;
  iconColor?: string;
  /** Pill background + blur behind the dots. Off = just the bare dots. */
  showPill?: boolean;
  /** Reports hover state of the active dot, so a parent can pause its own
      autoplay timer while the user is hovering (before/without clicking). */
  onActiveHoverChange?: (hovering: boolean) => void;
};

export default function SlideDots({
  count,
  activeIndex,
  paused,
  onSelect,
  onTogglePause,
  progressRef,
  activeColor = "#ffffff",
  inactiveColor = "rgba(255,255,255,0.4)",
  inactiveHoverColor,
  trackColor,
  iconColor,
  showPill = true,
  onActiveHoverChange,
}: SlideDotsProps) {
  const t = useTranslations("slideDots");
  const [hoveringActive, setHoveringActive] = useState(false);
  const showPauseIcon = !paused && hoveringActive;
  const showIcon = showPauseIcon || paused;
  const resolvedTrackColor = trackColor ?? inactiveColor;
  const resolvedIconColor = iconColor ?? activeColor;

  return (
    <div
      className={`flex items-center gap-0 ${
        showPill ? "rounded-[40px] bg-[rgba(0,0,0,0.5)] p-1 backdrop-blur-[4px]" : ""
      }`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === activeIndex;
        if (!isActive) {
          return (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => onSelect(i)}
              className="group flex size-8 items-center justify-center"
            >
              <span
                className="size-[10px] rounded-full bg-[var(--dot-color)] transition-colors group-hover:bg-[var(--dot-hover-color)]"
                style={
                  {
                    "--dot-color": inactiveColor,
                    "--dot-hover-color": inactiveHoverColor ?? inactiveColor,
                  } as CSSProperties
                }
              />
            </button>
          );
        }
        return (
          <button
            key={i}
            aria-label={paused ? t("play") : t("pause")}
            onClick={onTogglePause}
            onMouseEnter={() => {
              setHoveringActive(true);
              onActiveHoverChange?.(true);
            }}
            onMouseLeave={() => {
              setHoveringActive(false);
              onActiveHoverChange?.(false);
            }}
            className="relative flex size-8 items-center justify-center"
          >
            <svg viewBox="0 0 32 32" className="absolute inset-0 size-8 -rotate-90">
              <circle cx="16" cy="16" r={DOT_RADIUS} fill="none" stroke={resolvedTrackColor} strokeWidth="2" />
              <circle
                ref={progressRef}
                cx="16"
                cy="16"
                r={DOT_RADIUS}
                fill="none"
                stroke={activeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={DOT_CIRCUMFERENCE}
                strokeDashoffset={DOT_CIRCUMFERENCE}
              />
            </svg>
            {showIcon ? (
              paused ? <PlayIcon color={resolvedIconColor} /> : <PauseIcon color={resolvedIconColor} />
            ) : (
              <span className="size-[10px] rounded-full" style={{ backgroundColor: activeColor }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
