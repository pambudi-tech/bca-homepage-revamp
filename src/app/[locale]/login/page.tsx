import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";

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
  const loginPath = locale === "id" ? "/login" : `/${locale}/login`;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form
        action={login}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: 280,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h1 style={{ fontSize: 18, margin: 0 }}>{t("heading")}</h1>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="loginPath" value={loginPath} />
        <input
          type="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
          autoFocus
          required
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        {error && (
          <p style={{ color: "crimson", fontSize: 13, margin: 0 }}>
            {t("wrongPassword")}
          </p>
        )}
        <button
          type="submit"
          style={{
            padding: 8,
            border: "none",
            borderRadius: 4,
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
