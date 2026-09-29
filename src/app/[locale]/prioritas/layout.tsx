import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import PrioritasDirectoryLayout from "@/components/prioritas/PrioritasDirectoryLayout";
import { MEMBER_SESSION_COOKIE, MEMBER_SESSION_VALUE } from "@/lib/member-auth";

export const metadata: Metadata = {
  icons: {
    icon: "/prioritas-icon.svg",
  },
};

export default async function PrioritasLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
  const memberPreviewName = session === MEMBER_SESSION_VALUE
    ? await (await getTranslations("memberOverview"))("previewFullName")
    : undefined;
  return <PrioritasDirectoryLayout memberPreviewName={memberPreviewName}>{children}</PrioritasDirectoryLayout>;
}
