"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { useScrollLock } from "@/components/SmoothScroll";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";
import { SEGMENT_EXTERNAL_LINKS } from "./segment-links";

const LOCALE_META: Record<AppLocale, { flag: string }> = {
  id: { flag: "/assets/cycle1/flag-id.svg" },
  en: { flag: "/assets/navbar/flag-en.png" },
  zh: { flag: "/assets/navbar/flag-zh.png" },
};

const SEGMENTS = ["Individu", "Bisnis", "Prioritas", "Solitaire"] as const;

function ChevronRight() {
  return <img src="/assets/navbar/chevron-right-blue.svg" alt="" className="size-6 -rotate-90" />;
}

export default function MobileMenu({
  open,
  onClose,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  productCategories?: ProductCategory[];
  megamenuContent?: MegaMenuContent;
  variant?: "default" | "about" | "promo";
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tMobile = useTranslations("mobileMenu");
  const tLang = useTranslations("languages");
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const otherLocales = routing.locales.filter((item) => item !== locale);
  const closeMenu = useCallback(() => {
    setLangOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- createPortal needs document.body after hydration
    setMounted(true);
  }, []);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, open]);

  useEffect(() => {
    if (open) return;
    const activeElement = document.activeElement;
    if (restoreFocusRef.current && (activeElement === document.body || portalRef.current?.contains(activeElement))) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = portalRef.current;
    if (!root) return;
    const siblings = [...document.body.children].filter((element) => element !== root && !element.hasAttribute("inert"));
    siblings.forEach((element) => element.setAttribute("inert", ""));
    return () => siblings.forEach((element) => element.removeAttribute("inert"));
  }, [open]);

  useEffect(() => {
    const closeLanguage = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", closeLanguage);
    return () => document.removeEventListener("mousedown", closeLanguage);
  }, []);

  if (!mounted) return null;

  const menuItems = [
    ...SEGMENTS.map((segment) => ({
      key: segment,
      label: tNav(`segments.${segment}`),
      href: segment === "Individu" ? "/" : SEGMENT_EXTERNAL_LINKS[segment],
      active: variant === "default" && segment === "Individu",
    })),
    { key: "Tentang BCA", label: tNav("tentangBca"), href: "/tentang-bca", active: false },
    { key: "Karir", label: tNav("karir"), href: "https://karir.bca.co.id/", active: false },
  ];

  return createPortal(
    <div
      ref={portalRef}
      data-shown={open}
      role="dialog"
      aria-modal="true"
      aria-label={tMobile("menuLabel")}
      aria-hidden={!open}
      className="fade-overlay fixed inset-0 z-[60] bg-neutral-100 xl:hidden"
      style={{ "--fade-ms": "300ms" } as CSSProperties}
    >
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col bg-neutral-100 text-neutral-800">
        <header className="relative flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-neutral-300 px-4 pt-[env(safe-area-inset-top)]">
          <Link href="/" aria-label="BCA" onClick={closeMenu} className="inline-flex">
            <img src="/assets/navbar/bca-logo-blue.svg" alt="BCA" className="h-8 w-[102px]" />
          </Link>

          <div className="flex items-center gap-2">
            <div ref={langRef} className="relative">
              <button type="button" onClick={() => setLangOpen((value) => !value)} aria-expanded={langOpen} className="flex h-10 items-center gap-0.5 rounded-full border border-neutral-300 bg-neutral-100 p-2">
                <img src={LOCALE_META[locale].flag} alt="" className="size-6 rounded-full object-cover" />
                <span className="w-8 text-center text-base font-bold text-neutral-900">{locale.toUpperCase()}</span>
              </button>
              {langOpen ? (
                <div className="absolute right-0 top-12 z-10 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 shadow-menu-flat">
                  {otherLocales.map((code) => (
                    <button key={code} type="button" onClick={() => { setLangOpen(false); router.replace(pathname, { locale: code }); }} className="flex w-36 items-center gap-2 p-4 text-left hover:bg-blue-100">
                      <img src={LOCALE_META[code].flag} alt="" className="size-6 rounded-full object-cover" />
                      <span className="font-semibold text-neutral-900">{tLang(code)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" onClick={closeMenu} aria-label={tMobile("tutupMenu")} className="flex size-10 items-center justify-center rounded-full active:scale-95">
              <img src="/assets/cycle1/outline-close.svg" alt="" className="size-6" />
            </button>
          </div>
        </header>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-24" data-lenis-prevent>
          {menuItems.map((item) => {
            const content = (
              <>
                <span className={`text-base leading-6 ${item.active ? "font-bold text-blue-500" : "font-semibold text-neutral-800"}`}>{item.label}</span>
                {item.active ? (
                  <span className="flex h-8 items-center rounded-xl bg-blue-200 px-4 text-sm font-semibold text-blue-600">{tMobile("sesiAktif")}</span>
                ) : (
                  <span className="flex size-10 items-center justify-center"><ChevronRight /></span>
                )}
              </>
            );
            const className = "flex h-[72px] w-full items-center justify-between border-t border-neutral-300 text-left active:bg-neutral-200";

            if (item.key === "Tentang BCA") return <Link key={item.key} href="/tentang-bca" onClick={closeMenu} className={className}>{content}</Link>;
            if (item.active) return <div key={item.key} className={className}>{content}</div>;
            if (item.href === "/") return <Link key={item.key} href="/" onClick={closeMenu} className={className}>{content}</Link>;
            return <a key={item.key} href={item.href ?? "#"} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={className}>{content}</a>;
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          <a href="https://mybca.bca.co.id/auth/login" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="flex h-12 items-center justify-center rounded-full border border-blue-500 bg-neutral-100 px-6 text-base font-semibold text-blue-500 active:bg-blue-100">
            {tNav("login")}
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
