import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE } from "@/lib/member-auth";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";

export async function GET() {
  const brand = getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value);
  return NextResponse.json(
    { authenticated: brand !== null, brand },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
