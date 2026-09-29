import { Link } from "@/i18n/navigation";
import Navbar from "@/components/home/Navbar";
import PrioritasIndexTabs from "@/components/prioritas/PrioritasIndexTabs";
import { PrioritasButtonIcon, prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export default async function PrioritasMemberHeader({ activeTab, title, tabSurface = "overview", compactTitleTabGap = false, children }: { activeTab: "overview" | "privilege" | "banking" | "magazine" | "financial"; title?: string; tabSurface?: "overview" | "member"; compactTitleTabGap?: boolean; children?: ReactNode }) {
  const t = await getTranslations("memberOverview");
  return <>
    <div className="relative bg-pgold-100">
      <div className="absolute inset-x-0 top-0 h-[calc(7rem+env(safe-area-inset-top))] bg-pbrown-600 xl:h-[120px]" />
      <Navbar variant="prioritas" disableHideShow memberPreviewName={t("previewFullName")} />
      <div className="h-[calc(7rem+env(safe-area-inset-top))] xl:h-[120px]" />
    </div>
    <PrioritasIndexTabs activeTab={activeTab} surface={tabSurface} />
    <div className="bg-pgold-100">
      <header id="overview-start" className={`mx-auto flex w-full max-w-[1280px] flex-col justify-start px-4 pt-4 xl:px-0 ${children ? "h-[160px] pb-0 xl:h-[200px] xl:pb-0 xl:pt-6" : "xl:pt-6"} ${children ? "" : title ? "h-[130px] pb-8 xl:h-auto xl:pb-10" : "h-[160px] pb-3 xl:h-[200px] xl:pb-6"}`}>
        <Link href="/prioritas" className={prioritasButtonClassName({ kind: "text", surface: "default", size: "medium", className: `${compactTitleTabGap ? "mb-[28px]" : "mb-4"} w-fit xl:mb-9` })}>
          <PrioritasButtonIcon src="/assets/member-login/arrow-left.svg" />
          <span className="prio-button__label">{t("back")}</span>
        </Link>
        <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-pbrown-800 xl:text-[40px] xl:leading-12">{title ?? t("welcome", { name: t("previewFirstName") })}</h1>
        {!title ? <p className="mt-6 text-sm font-semibold text-pbrown-300">{t("lastLogin")}</p> : null}
        {children}
      </header>
    </div>
  </>;
}
