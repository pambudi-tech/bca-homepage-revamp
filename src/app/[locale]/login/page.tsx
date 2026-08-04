import { getTranslations } from "next-intl/server";
import {
  prefixedLoginPath,
} from "@/lib/preview-auth";
import { routing } from "@/i18n/routing";
import LoginForm from "./LoginForm";

/**
 * Only ever redirect within this site. `redirectTo` arrives from the query
 * string, so without this an attacker-supplied absolute URL would turn the
 * preview gate into an open redirect off a BCA-branded domain — the classic
 * phishing hand-off. `proxy.ts` only ever writes a same-origin pathname here,
 * so nothing legitimate is lost.
 */
function safeRedirectTarget(value: unknown): string {
  if (typeof value !== "string") return "/";
  // Must be a single-slash-rooted path. `//evil.example` is protocol-relative
  // and `https://…` is absolute — both are external.
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  // A backslash is normalised to a forward slash by some user agents, so
  // `/\evil.example` can escape the origin too.
  if (value.includes("\\")) return "/";
  return value;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { locale } = await params;
  const { redirectTo: rawRedirectTo } = await searchParams;
  const redirectTo = safeRedirectTarget(rawRedirectTo);
  const t = await getTranslations({ locale, namespace: "login" });
  const tLanguages = await getTranslations({ locale, namespace: "languages" });

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
      />

      {/* Plain links rather than the navbar's client-side switcher: this page
          has no other client JS, and a full navigation is what carries
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
                  className={`block rounded-full px-3 py-1.5 text-sm transition-colors ${
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

      <p className="text-xs text-neutral-600">{t("disclaimer")}</p>
    </main>
  );
}
