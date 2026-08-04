import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  AUTH_COOKIE_NAME,
  loginPathForLocale,
  prefixedLoginPath,
} from "@/lib/preview-auth";
import { routing } from "@/i18n/routing";

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

async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");
  const expected = process.env.PREVIEW_PASSWORD;
  const redirectTo = safeRedirectTarget(formData.get("redirectTo"));
  const loginPath = formData.get("loginPath") as string;

  if (typeof password === "string" && password === expected) {
    (await cookies()).set(AUTH_COOKIE_NAME, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect(redirectTo);
  }

  redirect(`${loginPath}?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
}

const PASSWORD_FIELD_ID = "preview-password";
const PASSWORD_ERROR_ID = "preview-password-error";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { locale } = await params;
  const { error, redirectTo: rawRedirectTo } = await searchParams;
  const redirectTo = safeRedirectTarget(rawRedirectTo);
  const t = await getTranslations({ locale, namespace: "login" });
  const tLanguages = await getTranslations({ locale, namespace: "languages" });
  const loginPath = loginPathForLocale(locale);

  return (
    // The locale layout renders the skip link, which targets this id — without
    // it the link dangles on the one page that has no navbar to skip past.
    <main
      id="main-content"
      className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden bg-blue-100 px-6 py-16"
    >
      {/* Clove pattern, same two SVGs ProductSection uses. `isolate` on <main>
          plus `-z-10` here puts the motif above the page fill and below the
          card without any of the content needing a z-index of its own. Both
          SVGs are `preserveAspectRatio="none"`, so width AND height have to be
          pinned — `h-auto` collapses them and the motif stretches. Static, not
          parallaxed: there is nothing to scroll on this page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Under xl a single clove bottom-right, the treatment ProductSection
            gives its own mobile breakpoint — the pair below would crowd the
            card on a narrow screen. */}
        <img
          decoding="async"
          src="/assets/product/bg-clove-b.svg"
          alt=""
          className="absolute -right-24 -bottom-[120px] h-[460px] w-[350px] opacity-60 xl:hidden"
        />
        {/* The desktop pair fades out via a mask rather than relying on the
            SVG's own edges: bg-clove-{a,b} are each four overlapping
            translucent layers, and where a layer ends short of the ones
            beneath it, the art has a hard seam baked in — invisible against
            ProductSection's busy background, but a stray straight line
            floating on this page's plain fill. The radial mask dissolves
            every edge (seams included) to transparent before it reaches the
            image's own boundary, so nothing hard-edged survives to the eye. */}
        <img
          decoding="async"
          src="/assets/product/bg-clove-a.svg"
          alt=""
          style={{
            maskImage: "radial-gradient(70% 70% at 50% 45%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 45%, black 55%, transparent 100%)",
          }}
          className="absolute top-1/2 -left-[440px] hidden h-[850px] w-[620px] -translate-y-1/2 opacity-70 xl:block"
        />
        <img
          decoding="async"
          src="/assets/product/bg-clove-b.svg"
          alt=""
          style={{
            maskImage: "radial-gradient(70% 70% at 50% 45%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 45%, black 55%, transparent 100%)",
          }}
          className="absolute top-[calc(50%+320px)] -right-[232px] hidden h-[1009px] w-[768px] -translate-y-1/2 opacity-70 xl:block"
        />
      </div>

      <form
        action={login}
        className="w-full max-w-[360px] rounded-2xl border border-neutral-300 bg-white p-8 shadow-card"
      >
        <h1 className="text-heading text-neutral-900">{t("heading")}</h1>
        <p className="mt-2 text-sm text-neutral-700">{t("subheading")}</p>

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="loginPath" value={loginPath} />

        <input
          id={PASSWORD_FIELD_ID}
          type="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
          autoFocus
          required
          // The failure is reported by a sibling <p>, so without these two the
          // field reads as valid and unannotated to a screen reader — the
          // message is on screen but not attached to the thing that failed.
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? PASSWORD_ERROR_ID : undefined}
          // Same field recipe as the HaloBcaChat form fields — fill, radius,
          // height and states all come from there, so the two forms in this
          // codebase don't drift apart.
          className={`mt-6 h-12 w-full rounded-xl border bg-neutral-200 px-3.5 text-sm leading-5 text-neutral-700 outline-none transition-colors placeholder:text-neutral-600 ${
            error ? "border-red-500" : "border-neutral-300 focus:border-cyan-500"
          }`}
        />

        {error && (
          <p
            id={PASSWORD_ERROR_ID}
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            {t("wrongPassword")}
          </p>
        )}

        <button type="submit" className="btn-base btn-primary mt-6 w-full font-semibold">
          {t("submit")}
        </button>
      </form>

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
