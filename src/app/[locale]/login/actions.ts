"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";

export type LoginState = "idle" | "error" | "success";

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");
  const expected = process.env.PREVIEW_PASSWORD;

  if (typeof password !== "string" || password !== expected) {
    return "error";
  }

  (await cookies()).set(AUTH_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return "success";
}
