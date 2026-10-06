"use server";

import { cookies } from "next/headers";
import { MEMBER_SESSION_COOKIE, MEMBER_SESSION_MAX_AGE_SECONDS, MEMBER_SESSION_VALUE, PORTFOLIO_VIEW_SESSION_COOKIE, SOLITAIRE_SESSION_VALUE, type MemberBrand } from "@/lib/member-auth";

export type MemberLoginState = { status: "idle" | "error" | "success"; brand?: MemberBrand };

const DEMO_BCA_ID = "ANDHINIPUTRI26";
const DEMO_EMAIL = "andhini.putri@example.test";
const DEMO_PASSWORD = "PrioDemo!2026";
const SOLITAIRE_BCA_ID = "ANDHIKAPUTRA26";
const SOLITAIRE_EMAIL = "andhika.putra@example.test";
const SOLITAIRE_PASSWORD = "SoliDemo!2026";

export async function loginMember(
  _previousState: MemberLoginState,
  formData: FormData,
): Promise<MemberLoginState> {
  const identifier = formData.get("identifier");
  const password = formData.get("password");
  const normalizedIdentifier = typeof identifier === "string" ? identifier.trim().toLowerCase() : "";

  const prioritas = (normalizedIdentifier === DEMO_BCA_ID.toLowerCase() || normalizedIdentifier === DEMO_EMAIL) && password === DEMO_PASSWORD;
  const solitaire = (normalizedIdentifier === SOLITAIRE_BCA_ID.toLowerCase() || normalizedIdentifier === SOLITAIRE_EMAIL) && password === SOLITAIRE_PASSWORD;
  if (!prioritas && !solitaire) return { status: "error" };
  const brand: MemberBrand = solitaire ? "solitaire" : "prioritas";

  const cookieStore = await cookies();
  cookieStore.delete(PORTFOLIO_VIEW_SESSION_COOKIE);
  cookieStore.set(MEMBER_SESSION_COOKIE, solitaire ? SOLITAIRE_SESSION_VALUE : MEMBER_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MEMBER_SESSION_MAX_AGE_SECONDS,
  });

  return { status: "success", brand };
}

export async function logoutMember(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_SESSION_COOKIE);
  cookieStore.delete(PORTFOLIO_VIEW_SESSION_COOKIE);
}
