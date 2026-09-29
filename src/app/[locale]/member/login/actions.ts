"use server";

import { cookies } from "next/headers";
import { MEMBER_SESSION_COOKIE, MEMBER_SESSION_MAX_AGE_SECONDS, MEMBER_SESSION_VALUE } from "@/lib/member-auth";

export type MemberLoginState = "idle" | "error" | "success";

const DEMO_BCA_ID = "ANDHINIPUTRI26";
const DEMO_EMAIL = "andhini.putri@example.test";
const DEMO_PASSWORD = "PrioDemo!2026";

export async function loginMember(
  _previousState: MemberLoginState,
  formData: FormData,
): Promise<MemberLoginState> {
  const identifier = formData.get("identifier");
  const password = formData.get("password");
  const normalizedIdentifier = typeof identifier === "string" ? identifier.trim().toLowerCase() : "";

  if (
    (normalizedIdentifier !== DEMO_BCA_ID.toLowerCase() && normalizedIdentifier !== DEMO_EMAIL) ||
    password !== DEMO_PASSWORD
  ) {
    return "error";
  }

  (await cookies()).set(MEMBER_SESSION_COOKIE, MEMBER_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MEMBER_SESSION_MAX_AGE_SECONDS,
  });

  return "success";
}

export async function logoutMember(): Promise<void> {
  (await cookies()).delete(MEMBER_SESSION_COOKIE);
}
