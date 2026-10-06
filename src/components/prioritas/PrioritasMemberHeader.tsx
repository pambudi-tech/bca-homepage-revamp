import { Link } from "@/i18n/navigation";
import Navbar from "@/components/home/Navbar";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getMemberBrandFromSession, MEMBER_SESSION_COOKIE } from "@/lib/member-auth";

export default async function PrioritasMemberHeader({ activeTab, title, tabSurface = "overview", compactTitleTabGap = false, children }: { activeTab: "overview" | "privilege" | "banking" | "magazine" | "financial"; title?: string; tabSurface?: "overview" | "member"; compactTitleTabGap?: boolean; children?: ReactNode }) {
  const t = await getTranslations("memberOverview");
  const brand = getMemberBrandFromSession((await cookies()).get(MEMBER_SESSION_COOKIE)?.value) ?? "prioritas";
  const isSolitaire = brand === "solitaire";
  const buttonClassName = isSolitaire ? solitaireButtonClassName : prioritasButtonClassName;
  return <>
    <div className={`relative ${isSolitaire ? "bg-neutral-100" : "bg-pgold-100"}`}>
      <div className={`absolute inset-x-0 top-0 h-[calc(7rem+env(safe-area-inset-top))] xl:h-[120px] ${isSolitaire ? "bg-neutral-900" : "bg-pbrown-600"}`} />
      <Navbar variant={brand} disableHideShow memberPreviewName={t(brand === "solitaire" ? "solitairePreviewFullName" : "previewFullName")} />
      <div className="h-[calc(7rem+env(safe-area-inset-top))] xl:h-[120px]" />
    </div>
    <PrioritasIndexTabs activeTab={activeTab} surface={tabSurface} />
    <div className={isSolitaire ? "bg-neutral-100" : "bg-pgold-100"}>
      <header id="overview-start" className={`mx-auto flex w-full max-w-[1280px] flex-col justify-start px-4 pt-4 xl:px-0 ${children ? "h-[160px] pb-0 xl:h-[200px] xl:pb-0 xl:pt-6" : "xl:pt-6"} ${children ? "" : title ? "h-[130px] pb-8 xl:h-auto xl:pb-10" : "h-[160px] pb-3 xl:h-[200px] xl:pb-6"}`}>
        <Link href={`/${brand}`} className={buttonClassName({ kind: "text", surface: "default", size: "medium", className: `${compactTitleTabGap ? "mb-[28px]" : "mb-4"} w-fit xl:mb-9` })}>
          <PrioritasButtonIcon src="/assets/member-login/arrow-left.svg" />
          <span className="prio-button__label">{t("back")}</span>
        </Link>
        <h1 className={`text-2xl font-semibold leading-8 tracking-[-0.02em] xl:text-[40px] xl:leading-12 ${isSolitaire ? "text-neutral-800" : "text-pbrown-800"}`}>{title ?? t("welcome", { name: t(brand === "solitaire" ? "solitairePreviewFirstName" : "previewFirstName") })}</h1>
        {!title ? <p className={`mt-6 text-sm font-semibold ${isSolitaire ? "text-neutral-700" : "text-pbrown-300"}`}>{t("lastLogin")}</p> : null}
        {children}
      </header>
    </div>
  </>;
}
