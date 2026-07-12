import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";

async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");
  const expected = process.env.PREVIEW_PASSWORD;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

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

  redirect(`/login?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo = "/" } = await searchParams;

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
        <h1 style={{ fontSize: 18, margin: 0 }}>Preview password</h1>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
        {error && (
          <p style={{ color: "crimson", fontSize: 13, margin: 0 }}>
            Wrong password, try again.
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
          Enter
        </button>
      </form>
    </main>
  );
}
