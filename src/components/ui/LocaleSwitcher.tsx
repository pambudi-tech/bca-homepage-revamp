"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const LOCALE_META: Record<AppLocale, { flag: string }> = {
  id: { flag: "/assets/cycle1/flag-id.svg" },
  en: { flag: "/assets/navbar/flag-en.png" },
  zh: { flag: "/assets/navbar/flag-zh.png" },
};

export default function LocaleSwitcher({
  label,
  appearance = "glass",
  onLocaleChange,
  onOpenChange,
}: {
  label: string;
  appearance?: "glass" | "surface";
  onLocaleChange?: (locale: AppLocale) => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languages");
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const otherLocales = routing.locales.filter((item) => item !== locale);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const isHighlighted = appearance === "surface" || hovered || open;

  function changeLocale(nextLocale: AppLocale) {
    setOpen(false);
    if (onLocaleChange) onLocaleChange(nextLocale);
    else router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex h-10 items-center gap-0.5 rounded-full border px-2 transition-colors ${
          isHighlighted
            ? "border-neutral-300 bg-white"
            : "border-white/15 bg-[rgba(5,13,25,0.2)]"
        }`}
      >
        <img src={LOCALE_META[locale].flag} alt="" className="size-6 rounded-full object-cover" />
        <span className={`w-8 text-center text-base font-bold ${isHighlighted ? "text-neutral-900" : "text-white"}`}>
          {locale.toUpperCase()}
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-menu" role="menu" aria-label={label}>
          {otherLocales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              onClick={() => changeLocale(code)}
              className="flex w-36 items-center gap-2 p-4 text-left text-neutral-900 transition-colors hover:bg-blue-100 focus-visible:bg-blue-100 focus-visible:outline-none"
            >
              <img src={LOCALE_META[code].flag} alt="" className="size-6 rounded-full object-cover" />
              <span className="font-semibold">{t(code)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
