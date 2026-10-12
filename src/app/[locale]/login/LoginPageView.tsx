"use client";

import { useLocale, useTranslations } from "next-intl";
import { prefixedLoginPath } from "@/lib/preview-auth";
import { routing } from "@/i18n/routing";
import LoginForm from "./LoginForm";

/** Shared gate UI for the route and inert documentation snapshots. */
export default function LoginPageView({ redirectTo, preview }: { redirectTo: string; preview?: "idle" | "error" | "success" }) {
  const locale = useLocale();
  const t = useTranslations("login");
  const tLanguages = useTranslations("languages");
  return (
    // The locale layout renders the skip link, which targets this id — without
    // it the link dangles on the one page that has no navbar to skip past.
    <main
      id="main-content"
      className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-blue-100 px-6 py-16"
    >
      <LoginForm
        redirectTo={redirectTo}
        heading={t("heading")}
        subheading={t("subheading")}
        passwordPlaceholder={t("passwordPlaceholder")}
        wrongPassword={t("wrongPassword")}
        successMessage={t("success")}
        submit={t("submit")}
        preview={preview}
      />

      {/* Plain links rather than the navbar's client-side switcher: a full navigation carries
          `redirectTo` across to the gate in the next language. They point at
          the always-prefixed path — see `prefixedLoginPath` for why the
          unprefixed `/login` cannot work here. */}
      <nav aria-label={t("languageSwitcher")}>
        <ul className="flex items-center gap-1">
          {routing.locales.map((code) => {
            const isActive = code === locale;
            return (
              <li key={code}>
                <a
                  href={`${prefixedLoginPath(code)}?redirectTo=${encodeURIComponent(redirectTo)}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-full px-3 py-1.5 text-size-body-m transition-colors ${
                    isActive
                      ? "font-semibold text-blue-500"
                      : "text-neutral-700 hover:text-blue-500"
                  }`}
                >
                  {tLanguages(code)}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="text-size-body-s text-neutral-600">{t("disclaimer")}</p>
    </main>
  );
}
