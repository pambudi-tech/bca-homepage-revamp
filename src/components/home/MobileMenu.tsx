"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useMegaMenu } from "./use-megamenu";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import type { MegaMenuCategory } from "./megamenu-data";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";
import { useScrollLock } from "@/components/SmoothScroll";

const LOCALE_META: Record<AppLocale, { flag: string }> = {
  id: { flag: "/assets/cycle1/flag-id.svg" },
  en: { flag: "/assets/navbar/flag-en.png" },
  zh: { flag: "/assets/navbar/flag-zh.png" },
};

/* ------------------------------ icons ------------------------------ */

const iconBase = "shrink-0";
function ChevronRight({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
function ChevronLeft({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
function ExpandAll({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="m8 9 4-4 4 4" />
      <path d="m8 15 4 4 4-4" />
    </svg>
  );
}
function CloseIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className}`} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* ------------------------------ views ------------------------------ */

type View = { type: "main" } | { type: "segment" } | { type: "detail"; key: string };
type Dir = "fwd" | "back";
const viewKey = (v: View) => (v.type === "detail" ? `detail:${v.key}` : v.type);

export default function MobileMenu({
  open,
  onClose,
  productCategories,
  megamenuContent,
}: {
  open: boolean;
  onClose: () => void;
  /** Same live Supabase data the desktop nav gets (see `Navbar.tsx`) —
      without it, categories not curated into MEGAMENU_STRUCTURE (e.g.
      "Reward BCA") wouldn't show up here at all. */
  productCategories?: ProductCategory[];
  megamenuContent?: MegaMenuContent;
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tMobile = useTranslations("mobileMenu");
  const tLang = useTranslations("languages");
  const MEGAMENU = useMegaMenu(productCategories, megamenuContent);
  const SEGMENTS = Object.keys(tNav.raw("segments")) as string[];
  // Categories in Supabase's `product_categories` that aren't curated into
  // MEGAMENU_STRUCTURE — same rule as the desktop nav: no products means no
  // detail view to expand into.
  const extraCategories = (productCategories ?? []).filter(
    (c) => !MEGAMENU.some((menu) => menu.key === c.key)
  );
  const MENU_ITEMS = [
    ...MEGAMENU.map((c) => ({ key: c.key, label: c.label, expandable: true, href: undefined as string | undefined })),
    ...extraCategories.map((c) => ({
      key: c.key,
      label: c.label,
      expandable: false,
      href: undefined as string | undefined,
    })),
  ];
  const ACTION_ITEMS = [
    { key: "Promo", label: tNav("promo"), href: "https://promo.bca.co.id" },
    { key: "Pengajuan", label: tNav("pengajuan"), href: "https://www.bca.co.id/id/Forms/webform-bca" },
  ];
  const otherLocales = routing.locales.filter((l) => l !== locale);
  const switchLocale = (nextLocale: AppLocale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  const [segment, setSegment] = useState("Individu");
  const [view, setView] = useState<View>({ type: "main" });
  const [enterDir, setEnterDir] = useState<Dir | null>(null);
  const [exiting, setExiting] = useState<{ view: View; dir: Dir } | null>(null);
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates the createPortal below, which needs document.body and is unavailable during server render
    setMounted(true);
  }, []);

  useScrollLock(open);

  // Escape closes the menu, matching every other dismissible surface on the
  // site (HaloBcaChat, the hero search, LayoutSwitcher). Bound only while
  // open so a stray Escape elsewhere on the page costs nothing.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Remembers the control that opened the menu (the hamburger in MobileNav)
  // and hands focus back on close — otherwise focus falls to <body> and a
  // keyboard user restarts from the top of the page.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      return;
    }
    // Only steal focus back if it is not already somewhere deliberate —
    // guards against yanking focus during the closing animation if the user
    // has already clicked elsewhere. `.fade-overlay[data-shown="false"]`
    // delays its `visibility:hidden` switch by `--fade-ms` so the closing
    // animation stays smooth, so at the instant `open` flips false the
    // control the user just clicked (e.g. the X button) is still focused and
    // still technically inside the menu — it is NOT `document.body` yet.
    // Treat "still focused inside the closing menu" the same as "fell to
    // body": both mean nothing else outside the menu deliberately took focus.
    const activeEl = document.activeElement;
    const stillInsideMenu = portalRef.current?.contains(activeEl) ?? false;
    if (restoreFocusRef.current && (activeEl === document.body || stillInsideMenu)) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);

  // Focus trap. The menu is portaled to <body>, so every *other* body child is
  // the page behind it — marking them inert takes them out of the tab order
  // and the accessibility tree for as long as the menu is open, without
  // touching their styles or their animations. Cleanup is unconditional so a
  // fast open/close can never strand an inert page.
  useEffect(() => {
    if (!open) return;
    const root = portalRef.current;
    if (!root) return;

    const siblings = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert")
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));

    return () => siblings.forEach((el) => el.removeAttribute("inert"));
  }, [open]);

  // Reset to the root view each time the menu opens (the menu keeps its own
  // internal scroll via `data-lenis-prevent`, unrelated to the scroll lock).
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- KNOWN cascading render: resets view state when the menu opens. Deferred rather than fixed here because changing render timing needs visual verification this repo has no tests for. See plans/008.
      setView({ type: "main" });
      setEnterDir(null);
      setExiting(null);
    }
  }, [open]);

  const navigate = (to: View, dir: Dir) => {
    setExiting({ view, dir });
    setEnterDir(dir);
    setView(to);
  };

  const renderView = (v: View) => {
    if (v.type === "segment")
      return (
        <SegmentView
          segments={SEGMENTS}
          segment={segment}
          tNav={tNav}
          tMobile={tMobile}
          onPick={(s) => { setSegment(s); navigate({ type: "main" }, "back"); }}
          onBack={() => navigate({ type: "main" }, "back")}
        />
      );
    if (v.type === "detail") {
      const cat = MEGAMENU.find((c) => c.key === v.key);
      if (!cat) return null;
      return <DetailView cat={cat} onBack={() => navigate({ type: "main" }, "back")} onLeaf={onClose} />;
    }
    return (
      <MainView
        menuItems={MENU_ITEMS}
        actionItems={ACTION_ITEMS}
        tNav={tNav}
        tMobile={tMobile}
        tLang={tLang}
        locale={locale}
        otherLocales={otherLocales}
        onSwitchLocale={switchLocale}
        onOpenDetail={(key) => navigate({ type: "detail", key }, "fwd")}
        onLeaf={onClose}
      />
    );
  };

  const enterAnim = enterDir === "fwd" ? "menu-enter-fwd" : enterDir === "back" ? "menu-enter-back" : "";

  // `fade-overlay` rather than a bare `opacity-0`: this panel is a full-viewport
  // backdrop-filter that stays mounted for the whole session, and while it was
  // merely transparent the compositor still evaluated that blur every frame —
  // on a closed menu, for the entire visit. `visibility: hidden` takes it out of
  // the paint step without giving up either fade.
  //
  // Portaled to `document.body`: the page wraps its main content in a
  // `relative z-10` stacking context (so it can layer above the footer), which
  // caps every z-index inside it — including this overlay's `z-60` — below
  // siblings like `BackToTop` (`z-50`) that live outside that wrapper. The
  // portal escapes that context so the menu's z-index compares at the root.
  if (!mounted) return null;
  return createPortal(
    <div
      ref={portalRef}
      data-shown={open}
      role="dialog"
      aria-modal="true"
      aria-label={tMobile("menuLabel")}
      className="fade-overlay fixed inset-0 z-[60] flex justify-center xl:hidden"
      style={
        {
          "--fade-ms": "500ms",
          background: "linear-gradient(to bottom, rgba(0,92,170,0.5) 0%, #005caa 15%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        } as CSSProperties
      }
      aria-hidden={!open}
    >
      <div className="flex h-full w-full max-w-[440px] flex-col">
        {/* Menu nav bar */}
        <div className="flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
          <img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-8 w-[102px]" />
          <div className="flex items-center gap-2">
            {/* The segment picker is its own view, so the pill is hidden while it's open. */}
            {view.type !== "segment" && (
              <button
                onClick={() => navigate({ type: "segment" }, "fwd")}
                className="flex h-10 w-[148px] items-center justify-between rounded-full bg-blue-100 px-4 transition-transform active:scale-[0.98]"
              >
                <span className="text-sm font-semibold text-blue-500">{tNav(`segments.${segment}`)}</span>
                <ExpandAll className="size-4 text-blue-500" />
              </button>
            )}
            <button onClick={onClose} aria-label={tMobile("tutupMenu")} className="flex size-10 items-center justify-center text-white transition-transform active:scale-95">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Animated stage */}
        <div className="relative flex-1 overflow-hidden">
          {exiting && (
            <div
              key={viewKey(exiting.view)}
              className={`absolute inset-0 ${exiting.dir === "fwd" ? "menu-exit-fwd" : "menu-exit-back"}`}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setExiting(null);
              }}
            >
              <ViewScroller>{renderView(exiting.view)}</ViewScroller>
            </div>
          )}
          <div key={viewKey(view)} className={`absolute inset-0 ${enterAnim}`}>
            <ViewScroller>{renderView(view)}</ViewScroller>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ViewScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="hide-scrollbar h-full overflow-y-auto px-4 pb-6 [scrollbar-width:none]" data-lenis-prevent>
      <div className="flex min-h-full flex-col">{children}</div>
    </div>
  );
}

/* ------------------------------ Main view ------------------------------ */

function MainView({
  menuItems,
  actionItems,
  tNav,
  tMobile,
  tLang,
  locale,
  otherLocales,
  onSwitchLocale,
  onOpenDetail,
  onLeaf,
}: {
  menuItems: { key: string; label: string; expandable: boolean; href?: string }[];
  actionItems: { key: string; label: string; href: string }[];
  tNav: (key: string) => string;
  tMobile: (key: string) => string;
  tLang: (key: string) => string;
  locale: AppLocale;
  otherLocales: AppLocale[];
  onSwitchLocale: (locale: AppLocale) => void;
  onOpenDetail: (key: string) => void;
  onLeaf: () => void;
}) {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <a
          href="https://www.bca.co.id/id/tentang-bca"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-[rgba(186,213,255,0.25)] px-5 text-sm font-semibold text-white transition-colors active:bg-white/10"
        >
          {tNav("tentangBca")}
        </a>
        <a
          href="https://karir.bca.co.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-[rgba(186,213,255,0.25)] px-5 text-sm font-semibold text-white transition-colors active:bg-white/10"
        >
          {tNav("karir")}
        </a>
      </div>

      <nav className="mt-6 flex flex-col">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              if (item.expandable) return onOpenDetail(item.key);
              if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
              onLeaf();
            }}
            className="flex items-center justify-between px-1 py-5 text-left transition-opacity active:opacity-60"
          >
            <span className="text-base font-semibold leading-6 text-white">{item.label}</span>
            {item.expandable && <ChevronRight className="size-6 text-white/90" />}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col border-t border-[rgba(186,213,255,0.25)] pt-2">
        {actionItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLeaf}
            className="flex items-center justify-between px-1 py-4 text-left transition-opacity active:opacity-60"
          >
            <span className="text-base font-semibold leading-6 text-white">{item.label}</span>
          </a>
        ))}
      </div>

      <div className="relative flex h-14 items-center justify-between pl-1">
        <span className="text-base font-semibold leading-6 text-white">{tMobile("bahasa")}</span>
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-0.5 rounded-full border border-[rgba(186,213,255,0.25)] p-2 transition-colors active:bg-white/10"
        >
          <img src={LOCALE_META[locale].flag} alt="" className="size-6" />
          <span className="flex w-8 items-center justify-center px-0.5 text-base font-bold text-white">
            {locale.toUpperCase()}
          </span>
        </button>

        {langOpen && (
          <div className="absolute bottom-[calc(100%+8px)] right-0 z-10 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-menu-flat">
            {otherLocales.map((code) => (
              <button
                key={code}
                onClick={() => {
                  setLangOpen(false);
                  onSwitchLocale(code);
                }}
                className="flex w-[148px] items-center gap-2 p-4 text-left transition-colors hover:bg-blue-100"
              >
                <img src={LOCALE_META[code].flag} alt="" className="size-6 rounded-full object-cover" />
                <span className="flex-1 text-base font-semibold text-neutral-900">{tLang(code)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------ Segment view ------------------------------ */

function SegmentView({
  segment,
  segments,
  tNav,
  tMobile,
  onPick,
  onBack,
}: {
  segment: string;
  segments: string[];
  tNav: (key: string) => string;
  tMobile: (key: string) => string;
  onPick: (s: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="mt-6 flex h-10 items-center px-1">
        <button onClick={onBack} className="flex items-center gap-3 text-white transition-opacity active:opacity-60">
          <ChevronLeft className="size-6" />
          <span className="text-subtitle">{tMobile("kembali")}</span>
        </button>
      </div>

      <p className="mt-14 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        {tMobile("pilihSegmen")}
      </p>

      <div className="mt-12 flex flex-col items-center gap-8">
        {segments.map((s) => {
          const selected = s === segment;
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              className={`flex h-16 items-center justify-center text-2xl font-semibold leading-8 text-white transition-transform active:scale-95 ${selected ? "rounded-full border border-white px-10" : "opacity-90"
                }`}
            >
              {tNav(`segments.${s}`)}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------ Detail view ------------------------------ */

function DetailView({
  cat,
  onBack,
  onLeaf,
}: {
  cat: MegaMenuCategory;
  onBack: () => void;
  onLeaf: () => void;
}) {
  return (
    <>
      <div className="mt-6 flex h-10 items-center px-1">
        <button onClick={onBack} className="flex items-center gap-3 text-white transition-opacity active:opacity-60">
          <ChevronLeft className="size-6" />
          <span className="text-subtitle">{cat.label}</span>
        </button>
      </div>

      <nav className="mt-6 flex flex-col">
        {cat.products.map((product) => (
          <button
            key={product}
            onClick={onLeaf}
            className="flex items-center justify-between px-1 py-5 text-left transition-opacity active:opacity-60"
          >
            <span className="text-base font-semibold leading-6 text-white">{product}</span>
            <ChevronRight className="size-5 text-white/90" />
          </button>
        ))}
      </nav>
    </>
  );
}
