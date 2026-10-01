"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { useScrollLock } from "@/components/SmoothScroll";
import type { ProductCategory } from "./product-data";
import type { MegaMenuContent } from "@/lib/megamenu";
import { SEGMENT_EXTERNAL_LINKS, SEGMENT_INTERNAL_LINKS } from "./segment-links";
import { logoutMember } from "@/app/[locale]/member/login/actions";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { isMemberAreaPath } from "@/lib/member-auth";

const LOCALE_META: Record<AppLocale, { flag: string }> = {
  id: { flag: "/assets/cycle1/flag-id.svg" },
  en: { flag: "/assets/navbar/flag-en.png" },
  zh: { flag: "/assets/navbar/flag-zh.png" },
};

const SEGMENTS = ["Individu", "Bisnis", "Prioritas", "Solitaire"] as const;

function ChevronRight({ priorityMenu }: { priorityMenu: boolean }) {
  return <svg aria-hidden viewBox="0 0 24 24" fill="none" className={`size-6 -rotate-90 ${priorityMenu ? "text-pbrown-500" : "text-blue-500"}`}><path d="m5.12 9.12 6 6a1.25 1.25 0 0 0 1.76 0l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function MobileMenu({
  open,
  onClose,
  variant = "default",
  logoHref,
  memberPreviewName,
}: {
  open: boolean;
  onClose: () => void;
  productCategories?: ProductCategory[];
  megamenuContent?: MegaMenuContent;
  variant?: "default" | "about" | "promo" | "prioritas" | "solitaire";
  logoHref: string;
  memberPreviewName?: string;
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tMobile = useTranslations("mobileMenu");
  const tAccount = useTranslations("accountMenu");
  const tLang = useTranslations("languages");
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const otherLocales = routing.locales.filter((item) => item !== locale);
  const priorityMenu = variant === "prioritas";
  const inMemberArea = isMemberAreaPath(pathname);
  const memberLoginHref = variant === "prioritas" || variant === "solitaire" ? `/member/login?from=${variant}` : null;
  const logout = async () => {
    await logoutMember();
    setLogoutConfirmOpen(false);
    closeMenu();
    router.replace("/prioritas");
  };
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
      href: SEGMENT_INTERNAL_LINKS[segment] ?? SEGMENT_EXTERNAL_LINKS[segment],
      active: (variant === "default" && segment === "Individu") || (variant === "prioritas" && segment === "Prioritas") || (variant === "solitaire" && segment === "Solitaire"),
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
      className="fade-overlay fixed inset-0 z-[90] bg-neutral-100 xl:hidden"
      style={{ "--fade-ms": "300ms" } as CSSProperties}
    >
      <div className="mx-auto flex h-full w-full max-w-[440px] flex-col bg-neutral-100 text-neutral-800">
        <header className="relative flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-neutral-300 px-4 pt-[env(safe-area-inset-top)]">
          <Link href={logoHref} aria-label="BCA" onClick={closeMenu} className="inline-flex">
            <span aria-hidden className={`h-8 w-[102px] ${priorityMenu ? "bg-pbrown-500" : "bg-blue-500"} [mask-image:url('/assets/navbar/bca-logo-blue.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/assets/navbar/bca-logo-blue.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]`} />
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
              <svg aria-hidden viewBox="0 0 32 32" fill="none" className={`size-6 ${priorityMenu ? "text-pbrown-500" : "text-blue-500"}`}><path d="m10 8 14 14M24 8 10 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
          </div>
        </header>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-24" data-lenis-prevent>
          {menuItems.map((item) => {
            const content = (
              <>
                <span className={`text-base leading-6 ${item.active ? `font-bold ${priorityMenu ? "text-pbrown-500" : "text-blue-500"}` : "font-semibold text-neutral-800"}`}>{item.label}</span>
                {item.active ? (
                  <span className={`flex h-8 items-center rounded-xl px-4 text-sm font-semibold ${priorityMenu ? "bg-pgold-100 text-pbrown-500" : "bg-blue-200 text-blue-600"}`}>{tMobile("sesiAktif")}</span>
                ) : (
                  <span className="flex size-10 items-center justify-center"><ChevronRight priorityMenu={priorityMenu} /></span>
                )}
              </>
            );
            const className = "flex h-[72px] w-full items-center justify-between border-t border-neutral-300 text-left active:bg-neutral-200";

            if (item.key === "Tentang BCA") return <Link key={item.key} href="/tentang-bca" onClick={closeMenu} className={className}>{content}</Link>;
            if (item.active) return <div key={item.key} className={className}>{content}</div>;
            if (item.href?.startsWith("/")) return <Link key={item.key} href={item.href} onClick={closeMenu} className={className}>{content}</Link>;
            return <a key={item.key} href={item.href ?? "#"} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={className}>{content}</a>;
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          {memberPreviewName ? (
            <div className="flex flex-col gap-3">
              <Link href="/prioritas/member/overview" onClick={closeMenu} className="flex h-12 items-center gap-3 rounded-xl px-2 text-sm font-bold leading-5 text-neutral-800">
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundImage: "linear-gradient(262.59deg, #c2a266 0.18%, #98732c 100.18%)" }}>
                  <img src="/assets/prioritas/member-overview/account-user.svg" alt="" className="shrink-0" />
                </span>
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{memberPreviewName}</span>
              </Link>
              <Link href={inMemberArea ? "/prioritas" : "/prioritas/member/overview"} onClick={closeMenu} className={`flex h-12 items-center justify-center rounded-full border bg-neutral-100 px-6 text-base font-semibold ${priorityMenu ? "border-pbrown-500 text-pbrown-500 active:bg-pgold-100" : "border-blue-500 text-blue-500 active:bg-blue-100"}`}>{inMemberArea ? tAccount("home") : tAccount("overview")}</Link>
              <button type="button" onClick={() => setLogoutConfirmOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-full border border-red-600 bg-neutral-100 px-6 text-base font-semibold text-red-600 active:bg-red-50">
                <svg aria-hidden viewBox="0 0 32 32" fill="none" className="size-5"><path d="M11.867 10.08c.413-4.8 2.88-6.76 8.28-6.76h.173c5.96 0 8.347 2.387 8.347 8.347v8.693c0 5.96-2.387 8.347-8.347 8.347h-.173c-5.36 0-7.827-1.934-8.267-6.654" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" /><path d="M2.667 16H19.84m-2.973-4.467L21.333 16l-4.466 4.467" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {tMobile("logout")}
              </button>
            </div>
          ) : memberLoginHref ? (
            <Link href={memberLoginHref} onClick={closeMenu} className={`flex h-12 items-center justify-center rounded-full border bg-neutral-100 px-6 text-base font-semibold ${priorityMenu ? "border-pbrown-500 text-pbrown-500 active:bg-pgold-100" : "border-blue-500 text-blue-500 active:bg-blue-100"}`}>{tNav("login")}</Link>
          ) : (
            <a href="https://mybca.bca.co.id/auth/login" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="flex h-12 items-center justify-center rounded-full border border-blue-500 bg-neutral-100 px-6 text-base font-semibold text-blue-500 active:bg-blue-100">{tNav("login")}</a>
          )}
        </div>
      </div>
      <LogoutConfirmDialog open={logoutConfirmOpen} onCancel={() => setLogoutConfirmOpen(false)} onConfirm={() => void logout()} />
    </div>,
    document.body
  );
}
