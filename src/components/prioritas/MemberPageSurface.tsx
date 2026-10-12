import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE } from "@/lib/member-auth";
import BrandPageSurface from "./BrandPageSurface";

export default async function MemberPageSurface({ children }: { children: ReactNode }) {
  const tone = getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value) ?? "prioritas";
  return <BrandPageSurface tone={tone}>{children}</BrandPageSurface>;
}
