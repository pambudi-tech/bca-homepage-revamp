"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { onPreloaderDone } from "@/components/Preloader";

type RailAction = {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
};

/**
 * Desktop-only shortcuts attached to the right edge of the viewport. Its
 * background reuses BackToTop's trapezoid language, rotated vertically, while
 * the 64px cells keep each shortcut equally easy to target.
 */
export default function QuickActionRail() {
  const tNav = useTranslations("nav");
  const [ready, setReady] = useState(false);
  const [tooltipSuppressed, setTooltipSuppressed] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  useEffect(() => onPreloaderDone(() => setReady(true)), []);

  useEffect(() => {
    const resetRail = () => {
      setHoveredAction(null);
      setTooltipSuppressed(true);
    };

    window.addEventListener("pageshow", resetRail);
    window.addEventListener("focus", resetRail);
    return () => {
      window.removeEventListener("pageshow", resetRail);
      window.removeEventListener("focus", resetRail);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setTooltipSuppressed(true);
    setHoveredAction(null);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const actions: RailAction[] = [
    {
      label: tNav("produk"),
      icon: "/assets/quick-action/product.svg",
      onClick: () => scrollToSection("products"),
    },
    {
      label: tNav("pengajuan"),
      icon: "/assets/quick-action/document.svg",
      href: "https://www.bca.co.id/id/Forms/webform-bca",
    },
    {
      label: tNav("promo"),
      icon: "/assets/quick-action/discount-shape.svg",
      href: "https://promo.bca.co.id/",
    },
    {
      label: tNav("haloBca"),
      icon: "/assets/quick-action/message-question.svg",
      href: "https://www.bca.co.id/id/Individu/layanan/Customer-Service/HaloBCA",
    },
    {
      label: tNav("lokasiBca"),
      icon: "/assets/quick-action/location.svg",
      href: "https://www.bca.co.id/id/lokasi-bca",
    },
  ];
  const mobileActions = actions;

  return (
    <>
    <nav
      aria-label={tNav("quickActions")}
      className={`fixed inset-x-0 bottom-0 z-40 flex h-[calc(86px+env(safe-area-inset-bottom))] items-stretch overflow-hidden rounded-t-[20px] bg-blue-500 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 xl:hidden ${ready ? "translate-y-0" : "translate-y-full"}`}
    >
      {mobileActions.map((action) => {
        const content = (
          <>
            <img src={action.icon} alt="" className="size-6 brightness-0 invert" />
            <span className="text-xs font-semibold leading-[18px] text-neutral-100">{action.label}</span>
          </>
        );

        if (action.onClick) {
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors active:bg-white/10"
            >
              {content}
            </button>
          );
        }

        return (
          <a
            key={action.label}
            href={action.href}
            target={action.href?.startsWith("http") ? "_blank" : undefined}
            rel={action.href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors active:bg-white/10"
          >
            {content}
          </a>
        );
      })}
    </nav>

    <aside
      aria-label={tNav("quickActions")}
      onPointerLeave={() => {
        setHoveredAction(null);
        setTooltipSuppressed(false);
      }}
      className={`fixed top-1/2 right-0 z-20 hidden w-20 -translate-y-1/2 px-2 py-[18px] transition-[opacity,transform] duration-300 xl:block ${ready
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none translate-x-full opacity-0"
        }`}
    >
      {/* Fixed 56px end caps plus a flexible center. Keeping the caps in
          pixel-space prevents their trapezoid curves from stretching when
          actions are added or removed; only this middle segment grows. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <span
          className="absolute right-0 top-0 h-14 w-20 bg-black/60 backdrop-blur-md"
          style={{
            clipPath: "path('M 80 0 L 80 56 L 0 56 C 0 45.6 6.65 36.1 17.57 30.7 L 80 0 Z')",
          }}
        />
        <span className="absolute bottom-14 right-0 top-14 w-20 bg-black/60 backdrop-blur-md" />
        <span
          className="absolute bottom-0 right-0 h-14 w-20 -scale-y-100 bg-black/60 backdrop-blur-md"
          style={{
            clipPath: "path('M 80 0 L 80 56 L 0 56 C 0 45.6 6.65 36.1 17.57 30.7 L 80 0 Z')",
          }}
        />
      </span>
      <div className="relative z-10 flex flex-col">
        {actions.map((action, index) => {
          const shape = index === 0 ? "top" : index === actions.length - 1 ? "bottom" : undefined;
          const isHovered = !tooltipSuppressed && hoveredAction === action.label;
          const content = (
            <>
              {shape && (
                <svg
                  aria-hidden
                  viewBox="0 0 64 84"
                  className={`pointer-events-none absolute inset-x-0 h-[84px] w-16 text-white/10 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} ${shape === "top" ? "top-0" : "bottom-0 -scale-y-100"}`}
                >
                  <path
                    d="M2.90492e-05 39.4271L0.000103624 71.1595C0.000119079 77.7355 5.33104 83.0664 11.9071 83.0664H52.0931C58.6692 83.0664 64.0001 77.7355 64.0001 71.1594V8.01067C64.0001 2.06362 57.7416 -1.80435 52.4224 0.855253L11.0558 21.5385C4.28007 24.9264 1.1246e-05 31.8517 2.90492e-05 39.4271Z"
                    fill="currentColor"
                  />
                </svg>
              )}
              <img
                src={action.icon}
                alt=""
                className={`z-10 size-8 brightness-0 invert ${shape === "top" ? "absolute bottom-4" : shape === "bottom" ? "absolute top-4" : "relative"}`}
              />
            </>
          );
          const wrapperClass = shape ? "h-[84px] w-16" : "size-16";
          const tooltipPosition = shape === "top" ? "top-[52px]" : "top-8";
          const className = `relative flex w-16 items-center justify-center transition-colors duration-200 ${shape ? "h-[84px]" : `h-16 rounded-xl ${isHovered ? "bg-white/10" : ""}`}`;

          if (action.onClick) {
            return (
              <div key={action.label} onPointerEnter={() => { setTooltipSuppressed(false); setHoveredAction(action.label); }} className={`group/rail relative ${wrapperClass}`}>
                <button type="button" aria-label={action.label} onClick={action.onClick} className={className}>
                  {content}
                </button>
                {!tooltipSuppressed && hoveredAction === action.label && <RailTooltip label={action.label} positionClass={tooltipPosition} />}
              </div>
            );
          }

          return (
            <div key={action.label} onPointerEnter={() => { setTooltipSuppressed(false); setHoveredAction(action.label); }} className={`group/rail relative ${wrapperClass}`}>
              <a
                href={action.href}
                aria-label={action.label}
                target={action.href?.startsWith("http") ? "_blank" : undefined}
                rel={action.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className={className}
              >
                {content}
              </a>
              {!tooltipSuppressed && hoveredAction === action.label && <RailTooltip label={action.label} positionClass={tooltipPosition} />}
            </div>
          );
        })}
      </div>
    </aside>
    </>
  );
}

function RailTooltip({ label, positionClass }: { label: string; positionClass: string }) {
  return (
    <span className={`pointer-events-none absolute ${positionClass} right-[calc(100%+12px)] z-30 w-max max-w-48 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-semibold leading-5 text-neutral-800 shadow-panel`}>
      {label}
      <span
        aria-hidden
        className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rotate-45 rounded-tr-[4px] border-t border-r border-neutral-200 bg-white"
      />
    </span>
  );
}
