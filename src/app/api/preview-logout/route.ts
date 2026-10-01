import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MEMBER_SESSION_COOKIE, MEMBER_SESSION_VALUE } from "@/lib/member-auth";
import { AUTH_COOKIE_NAME } from "@/lib/preview-auth";

export async function GET() {
  const authenticated = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value === MEMBER_SESSION_VALUE;
  return NextResponse.json(
    { authenticated },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
