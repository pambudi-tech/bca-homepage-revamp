import { routing } from "@/i18n/routing";

export const AUTH_COOKIE_NAME = "preview_auth";

/**
 * Where the preview gate lives for a given locale. `localePrefix: "as-needed"`
 * means the default locale is unprefixed, so this is `/login` for `id` and
 * `/{locale}/login` for the rest.
 */
export function loginPathForLocale(locale: string): string {
  return locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
}

/**
 * The always-prefixed form, `/id/login` included. This is what the gate's own
 * language switcher links to, and the prefix is load-bearing: a plain link to
 * `/login` carries no locale, so next-intl re-detects one from
 * `Accept-Language` and an English browser is bounced straight back to
 * `/en/login` — the switcher looks broken. Hitting `/{locale}/login` instead
 * lets the middleware read the locale off the prefix, write `NEXT_LOCALE`,
 * and redirect on to the canonical path, which then resolves from that cookie.
 */
export function prefixedLoginPath(locale: string): string {
  return `/${locale}/login`;
}

/**
 * The set the proxy checks before gating a request — derived from `routing`
 * rather than written out, so adding a locale can't leave its gate behind the
 * gate and produce a redirect loop. Both forms are listed: `/id/login` has to
 * reach next-intl for the switcher hand-off above to work at all.
 */
export const LOGIN_PATHS: ReadonlySet<string> = new Set(
  routing.locales.flatMap((locale) => [
    loginPathForLocale(locale),
    prefixedLoginPath(locale),
  ])
);

/**
 * The gate to send an unauthenticated request to. A visitor deep in `/en/…`
 * gets the English gate rather than always being dropped on the Indonesian
 * one; anything without a recognised locale segment falls back to the default.
 */
export function loginPathForRequest(pathname: string): string {
  const segment = pathname.split("/")[1];
  const matched = routing.locales.find((locale) => locale === segment);
  return loginPathForLocale(matched ?? routing.defaultLocale);
}
