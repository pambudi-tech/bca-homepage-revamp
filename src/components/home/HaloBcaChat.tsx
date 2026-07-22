"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MOBILE_MENU_EVENT } from "./MobileNav";
import { PRELOADER_DONE_EVENT, hasPreloaderFinished } from "@/components/Preloader";

// Google's published test key — always renders and always validates, but is
// explicitly not for production traffic. Real deployments must set
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY (see .env.local).
const RECAPTCHA_TEST_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || RECAPTCHA_TEST_KEY;
const RECAPTCHA_SCRIPT_ID = "recaptcha-api-script";

type RecaptchaRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: RecaptchaRenderOptions) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaApiLoad?: () => void;
  }
}

/** Renders the actual Google reCAPTCHA v2 checkbox widget into `containerRef`.
    Kept as a hook rather than inline JSX because the widget is imperative —
    `grecaptcha.render()` mutates a DOM node directly, it isn't declarative
    React output. */
function useRecaptcha(containerRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  const [token, setToken] = useState<string | null>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetId.current !== null || !window.grecaptcha) return;
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(null),
      });
    };

    if (window.grecaptcha) {
      renderWidget();
    } else {
      window.onRecaptchaApiLoad = renderWidget;
      if (!document.getElementById(RECAPTCHA_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoad&render=explicit";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      widgetId.current = null;
      setToken(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- containerRef is a ref, stable by contract
  }, [active]);

  return token;
}

/** Inline, not <img> — the icon has to inherit the button's text color so the
    fill can swap along with the label on hover/open. */
function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12.002 2.2998C13.9905 2.2999 15.8975 3.09007 17.3037 4.49609C18.71 5.90239 19.5 7.81002 19.5 9.79883V10.4326C20.231 10.6902 20.8648 11.1682 21.3125 11.8008C21.7603 12.4334 22.0002 13.1898 22 13.9648C21.9982 14.6614 21.8025 15.3441 21.4346 15.9355C21.0666 16.5269 20.5409 17.0039 19.917 17.3135V17.7119C19.9169 19.6739 18.3748 21.0448 16.168 21.0449H14.6865C14.5031 21.3626 14.2197 21.6107 13.8809 21.751C13.5419 21.8914 13.1658 21.9163 12.8115 21.8213C12.4572 21.7264 12.1442 21.5166 11.9209 21.2256C11.6977 20.9346 11.5762 20.5776 11.5762 20.2109C11.5763 19.8443 11.6978 19.4881 11.9209 19.1973C12.1441 18.9063 12.4573 18.6966 12.8115 18.6016C13.1658 18.5067 13.5419 18.5315 13.8809 18.6719C14.2197 18.8123 14.5032 19.0603 14.6865 19.3779H16.168C17.1751 19.3778 18.2509 18.9398 18.251 17.7119V17.2383C18.1216 17.123 18.0171 16.982 17.9453 16.8242C17.8736 16.6665 17.8359 16.4954 17.834 16.3223V9.79883C17.834 9.0329 17.6828 8.27403 17.3896 7.56641C17.0966 6.85906 16.6673 6.21623 16.126 5.6748C15.5844 5.13322 14.941 4.70326 14.2334 4.41016C13.5259 4.11716 12.7677 3.96685 12.002 3.9668C11.2361 3.9668 10.4771 4.11705 9.76953 4.41016C9.06199 4.70323 8.41948 5.1333 7.87793 5.6748C7.33644 6.21629 6.90638 6.85894 6.61328 7.56641C6.32017 8.27403 6.16895 9.0329 6.16895 9.79883V16.3223C6.16967 16.5225 6.12279 16.7203 6.03125 16.8984C5.93966 17.0765 5.8059 17.2298 5.64258 17.3457C5.47939 17.4615 5.29095 17.5368 5.09277 17.5645C4.89436 17.5922 4.69181 17.5716 4.50293 17.5049C3.77114 17.2468 3.13772 16.7682 2.68945 16.1348C2.24118 15.5014 2 14.7446 2 13.9688C2.00005 13.1929 2.24122 12.4361 2.68945 11.8027C3.13771 11.1696 3.77124 10.6905 4.50293 10.4326V9.79883C4.50293 7.81002 5.29293 5.90239 6.69922 4.49609C8.10551 3.08989 10.0133 2.2998 12.002 2.2998Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Same mark as MobileMenu.tsx's CloseIcon — reused here so the open ↔ close
    affordance on this button reads the same way it does on the mobile menu
    burger. */
function CloseIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Text input per Figma "Text Input States" (node 1651:7098): 48px tall,
    neutral-200 fill, neutral-300 border that turns cyan-400 on focus and
    red-500 on error, with the error message beneath. Kept local to this
    component for now — promote to src/components/ui once a second caller
    needs it. */
function Field({
  label,
  error,
  as = "input",
  options,
  ...props
}: {
  label: string;
  error?: string;
  as?: "input" | "select";
  options?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;
  const box = [
    "h-12 w-full rounded-xl border bg-neutral-200 px-3.5 text-sm leading-5 text-neutral-700",
    "outline-none transition-colors placeholder:text-neutral-600",
    "disabled:text-neutral-500",
    error ? "border-red-500" : "border-neutral-300 focus:border-cyan-400",
  ].join(" ");

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-sm leading-5 font-bold text-neutral-800">
        {label}
      </label>
      {as === "select" ? (
        // `appearance-none` + our own chevron so the control matches the Figma
        // field in every browser instead of showing the OS default caret.
        <div className="relative w-full">
          <select
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`${box} appearance-none pr-10 ${props.value ? "" : "text-neutral-600"}`}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">{props.placeholder}</option>
            {options?.map((o) => (
              <option key={o} value={o} className="text-neutral-700">
                {o}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 12 8"
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3.5 w-3 -translate-y-1/2 text-neutral-600"
          >
            <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={box}
          {...props}
        />
      )}
      {error ? (
        <p id={errorId} className="text-xs leading-[18px] text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Values = { nama: string; email: string; telepon: string; produk: string };
const EMPTY: Values = { nama: "", email: "", telepon: "", produk: "" };

// Matches the `halobca-out` animation duration in globals.css — the panel
// stays mounted for this long after closing starts so the rise-down exit
// can play instead of the panel just vanishing.
const CLOSE_MS = 240;

export default function HaloBcaChat() {
  const t = useTranslations("halobca");
  // `open` mounts the panel; `closing` swaps it to the exit animation and is
  // cleared (unmounting the panel) once CLOSE_MS elapses.
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  // Mobile bottom-sheet drag-to-dismiss: `dragY` is the live finger offset in
  // px (0 = resting position), `dragging` suppresses the snap-back transition
  // while the pointer is down so the sheet tracks the finger 1:1.
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [captchaTouched, setCaptchaTouched] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const products = t.raw("products") as string[];
  // The mobile burger menu (MobileMenu.tsx) is a full-viewport overlay at
  // z-[60], but this button sits at z-[70] so it can float over page content —
  // that same z-index otherwise leaves it floating over the menu too.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Kept off-screen until the preloader curtain starts lifting, then fades up —
  // otherwise the button flashes in over the loading page on slow loads.
  const [ready, setReady] = useState(false);
  // Hides the floating button once the user scrolls past the News section
  // (and back into the footer) — the footer itself is always in the DOM
  // below the fold, so observing it directly would keep the button hidden
  // from the very first render.
  const [pastNews, setPastNews] = useState(false);

  useEffect(() => {
    const newsSection = document.getElementById("news-section");
    if (!newsSection) return;
    // threshold: 0 fires exactly when the section's edges cross the
    // viewport — i.e. the instant its bottom scrolls above the top (going
    // down) or back below it (scrolling up), which is exactly the "have we
    // scrolled past it" boundary we want.
    const observer = new IntersectionObserver(
      ([entry]) => setPastNews(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 }
    );
    observer.observe(newsSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // The done event fires the instant the curtain *starts* sliding away, not
    // once it's gone — revealing immediately would show the button fading in
    // while the curtain is still exiting. This delay lines it up with the
    // curtain actually clearing (matches CookieBanner's own post-event wait).
    let id: ReturnType<typeof setTimeout>;
    const reveal = () => {
      id = setTimeout(() => setReady(true), 400);
    };
    // `hasPreloaderFinished()` covers the race where the done event already
    // fired (and won't fire again) before this component mounted — e.g.
    // mounting during the ~1.35s exit transition, while `.pre-root` is still
    // in the DOM. Without this check the button was stuck permanently
    // invisible/unclickable whenever that timing lined up.
    if (document.querySelector(".pre-root") && !hasPreloaderFinished()) {
      window.addEventListener(PRELOADER_DONE_EVENT, reveal, { once: true });
      return () => {
        window.removeEventListener(PRELOADER_DONE_EVENT, reveal);
        clearTimeout(id);
      };
    }
    reveal();
    return () => clearTimeout(id);
  }, []);

  // `instant` skips the exit animation — used when the drag itself already
  // carried the sheet most of the way off-screen, so replaying the rise-down
  // keyframe from translateY(0) would read as a backwards jump.
  const close = (opts?: { instant?: boolean }) => {
    setOpen((wasOpen) => {
      if (wasOpen && !opts?.instant) setClosing(true);
      return false;
    });
  };

  useEffect(() => {
    const onMenuToggle = (e: Event) => {
      const isOpen = (e as CustomEvent<boolean>).detail;
      setMobileMenuOpen(isOpen);
      if (isOpen) close({ instant: true });
    };
    window.addEventListener(MOBILE_MENU_EVENT, onMenuToggle);
    return () => window.removeEventListener(MOBILE_MENU_EVENT, onMenuToggle);
  }, []);

  const DISMISS_PX = 96;

  const onHandlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStartY.current));
  };
  const endDrag = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    setDragging(false);
    if (dragY > DISMISS_PX) close({ instant: true });
    setDragY(0);
  };

  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(() => setClosing(false), CLOSE_MS);
    return () => clearTimeout(id);
  }, [closing]);

  // Esc closes; a click anywhere outside the panel (and outside the button,
  // which toggles on its own) closes too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // The button has its own onClick toggle — without this check, a click
      // anywhere on it besides the icon fired this "outside" close on
      // pointerdown, then the button's onClick immediately reopened it,
      // so only clicks that happened to land elsewhere ever stuck.
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Only mounts/renders the widget while the panel is actually in the DOM —
  // `open || closing` keeps it alive through the exit animation, same as the
  // panel's own condition below.
  const captchaToken = useRecaptcha(recaptchaRef, open || closing);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Values> = {};
    if (!values.nama.trim()) next.nama = t("errors.required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) next.email = t("errors.email");
    if (!/^[0-9+\-\s]{8,}$/.test(values.telepon)) next.telepon = t("errors.phone");
    if (!values.produk) next.produk = t("errors.required");
    setErrors(next);
    setCaptchaTouched(true);
    if (Object.values(next).some(Boolean) || !captchaToken) return;
    // Prototype only — no chat backend wired yet. `captchaToken` is the
    // g-recaptcha-response value a real submit would forward server-side for
    // verification against Google's siteverify endpoint.
  };

  if (mobileMenuOpen) return null;

  const hidden = pastNews && !open && !closing;

  return (
    // No `transform` utility on this wrapper — it's `position: fixed` and so
    // is the panel below it. A transform here (even an identity translate-y-0)
    // would make this div the containing block for that `fixed` descendant
    // instead of the viewport, shrinking the panel to this div's own
    // button-sized box. The reveal transform lives on the button itself
    // instead, a few lines down.
    <div className={`fixed right-4 bottom-4 z-[70] transition-opacity duration-500 ease-out xl:right-8 xl:bottom-8 ${ready && !hidden ? "opacity-100" : "pointer-events-none opacity-0"}`}>

      {open || closing ? (
        <>
          {/* Scrim for the mobile bottom sheet only — the desktop popover
              floats free and relies on the outside-pointerdown listener
              instead. */}
          <div
            aria-hidden
            data-state={closing ? "closing" : "open"}
            className="halobca-scrim fixed inset-0 z-[65] bg-neutral-900/40 xl:hidden"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={t("title")}
            // Dragging swaps off the CSS keyframe (data-state stays "open" but
            // the class no longer matches while `dragging`'s inline transform
            // wins) so the two transforms never fight over the same frame.
            data-state={closing ? "closing" : dragging ? undefined : "open"}
            // Lenis (SmoothScroll.tsx) hijacks wheel/touch scrolling on the
            // whole document — without this attribute it swallows the
            // events here too, so the mouse sits over a visibly-overflowing
            // panel that never actually scrolls. Same fix MobileMenu.tsx uses.
            data-lenis-prevent
            style={
              dragY > 0
                ? { transform: `translateY(${dragY}px)`, transition: dragging ? "none" : "transform 200ms ease-out" }
                : undefined
            }
            // Desktop cap is `100vh - 96px` (the button's own 32px offset +
            // ~48px height + the 16px gap above it) for the bottom side, and
            // another flat 32px for the top so the panel never presses flush
            // against the top edge on short viewports — a fixed 70vh clipped
            // the form on ordinary laptop screens instead. overflow-y-auto
            // stays as a safety net once even that shrunk height isn't enough.
            className="halobca-panel fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[calc(100vh-32px)] w-full max-w-[560px] overflow-y-auto rounded-t-2xl bg-neutral-100 p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.16)] xl:absolute xl:inset-x-auto xl:right-0 xl:bottom-[calc(100%+16px)] xl:mx-0 xl:max-h-[calc(100vh-128px)] xl:w-[min(calc(100vw-2.5rem),400px)] xl:max-w-none xl:rounded-2xl xl:pb-6 xl:shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
          >
            {/* Grab handle — mobile bottom-sheet affordance, hidden on desktop.
                `touch-none` stops the page from scrolling while dragging. */}
            <div
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="-mt-2 touch-none pt-2 xl:hidden"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />
            </div>
            <h2 className="text-lg leading-6 font-bold tracking-[-0.02em] text-neutral-900">{t("title")}</h2>
          <p className="mt-2 text-sm leading-5 text-neutral-600">{t("subtitle")}</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <Field label={t("fields.nama")} placeholder={t("fields.namaPlaceholder")} value={values.nama} onChange={set("nama")} error={errors.nama} />
            <Field label={t("fields.email")} type="email" placeholder={t("fields.emailPlaceholder")} value={values.email} onChange={set("email")} error={errors.email} />
            <Field label={t("fields.telepon")} type="tel" inputMode="tel" placeholder={t("fields.teleponPlaceholder")} value={values.telepon} onChange={set("telepon")} error={errors.telepon} />
            <Field as="select" label={t("fields.produk")} placeholder={t("fields.produkPlaceholder")} options={products} value={values.produk} onChange={set("produk")} error={errors.produk} />

            {/* Real Google reCAPTCHA v2 checkbox — grecaptcha.render() mounts
                its iframe into this div directly (see useRecaptcha above),
                it isn't React-rendered content. */}
            <div className="flex justify-center overflow-hidden">
              <div ref={recaptchaRef} />
            </div>
            {captchaTouched && !captchaToken ? (
              <p className="-mt-2 text-center text-xs leading-[18px] text-red-500">{t("errors.captcha")}</p>
            ) : null}

            <a href="#" className="text-center text-sm text-blue-500 underline">
              {t("terms")}
            </a>
            <button
              type="submit"
              // Matches the product section's CTA button (ProductSection.tsx)
              // — same height, radius, and hover/active blue steps.
              className="flex h-12 items-center justify-center rounded-full bg-blue-500 text-base font-semibold text-neutral-100 transition-colors duration-200 hover:bg-[#0068c0] active:bg-[#00457f]"
            >
              {t("submit")}
            </button>
          </form>
          </div>
        </>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        // Open keeps the hover treatment: `data-open` drives the same swap so
        // the button reads as active even when the pointer moves away.
        data-open={open}
        aria-label={open ? t("close") : t("label")}
        className={`flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 p-3.5 text-blue-500 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[background-color,color,transform] duration-500 ease-out hover:bg-blue-500 hover:text-neutral-100 data-[open=true]:bg-blue-500 data-[open=true]:text-neutral-100 xl:px-5 xl:py-3 ${ready ? "translate-y-0" : "translate-y-4"}`}
      >
        {/* Swaps to the mobile-menu's X once open — same icon, same
            second-click-to-close affordance. */}
        {open ? <CloseIcon className="size-6" /> : <HelpIcon className="size-6" />}
        <span className="hidden text-sm font-bold xl:inline">{t("label")}</span>
      </button>
    </div>
  );
}
