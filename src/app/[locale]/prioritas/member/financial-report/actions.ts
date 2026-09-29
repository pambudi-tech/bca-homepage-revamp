"use server";

import { cookies } from "next/headers";
import { PORTFOLIO_VIEW_SESSION_COOKIE, PORTFOLIO_VIEW_SESSION_MAX_AGE_SECONDS } from "@/lib/member-auth";

/** Demo OTP verification grants a separate ten-minute portfolio viewing session. */
export async function activatePortfolioViewSession(code: string): Promise<number | null> {
  if (!/^\d{6}$/.test(code)) return null;

  const expiresAt = Date.now() + PORTFOLIO_VIEW_SESSION_MAX_AGE_SECONDS * 1000;
  (await cookies()).set(PORTFOLIO_VIEW_SESSION_COOKIE, String(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PORTFOLIO_VIEW_SESSION_MAX_AGE_SECONDS,
  });

  return expiresAt;
}
