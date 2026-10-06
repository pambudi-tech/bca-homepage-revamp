"use client";

import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { useTranslations } from "next-intl";
import "./general-private-banking.css";

export default function GeneralPrivateBankingHeader() {
  const login = useTranslations("login");

  return (
    <header className="relative z-40 flex h-[72px] shrink-0 items-center border-b border-neutral-300 bg-neutral-100 px-4 xl:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
        <Link href="/" aria-label="BCA Solitaire dan BCA Prioritas" className="inline-flex items-center gap-5 sm:gap-8">
          <img src="/assets/soliprio/solitaire-logo.svg" alt="BCA Solitaire" className="general-private-banking-solitaire-logo h-10 w-auto xl:h-11" />
          <img src="/assets/prioritas/logo.svg" alt="BCA Prioritas" className="h-10 w-auto xl:h-11" />
        </Link>
        <LocaleSwitcher label={login("languageSwitcher")} appearance="surface" />
      </div>
    </header>
  );
}
