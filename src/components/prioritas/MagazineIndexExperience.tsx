"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MagazineCard from "@/components/prioritas/MagazineCard";
import { PrioritasDirectoryPanel } from "@/components/prioritas/PrioritasDirectory";
import { usePathname } from "@/i18n/navigation";
import issues from "@/components/prioritas/magazine-issues.json";

const MAGAZINE_PAGE_SIZE = 12;

export default function MagazineIndexExperience({ memberLayout = false, tone = "prioritas" }: { memberLayout?: boolean; tone?: "prioritas" | "solitaire" }) {
  const t = useTranslations("magazineIndex");
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const visibleIssues = issues.slice((page - 1) * MAGAZINE_PAGE_SIZE, page * MAGAZINE_PAGE_SIZE);
  const activeTone = tone === "solitaire" || (memberLayout && pathname.startsWith("/solitaire/member")) ? "solitaire" : "prioritas";
  const isSolitaire = activeTone === "solitaire";

  return <main id="main-content" className={`min-h-screen overflow-x-clip pb-12 xl:pb-20 ${isSolitaire ? "bg-neutral-200 text-neutral-800" : "bg-pgold-200 text-pbrown-800"}`}>
    <div className={`relative z-10 mx-auto w-full max-w-[1280px] px-4 xl:px-0 ${memberLayout ? "mt-0 xl:-mt-6" : "-mt-12 xl:-mt-12"}`}>
      <PrioritasDirectoryPanel
        headingId="magazine-directory-title"
        header={<h2 id="magazine-directory-title" className="sr-only">{t("breadcrumb")}</h2>}
        page={page}
        total={issues.length}
        pageSize={MAGAZINE_PAGE_SIZE}
        onPageChange={setPage}
        paginationPlacement="top"
        tone={activeTone}
        gridClassName="grid-cols-2 xl:grid-cols-4"
        gridGap="compact"
        paginationLabel={t("paginationLabel")}
        emptyMessage={t("empty")}
      >
        {visibleIssues.map((issue) => <figure key={issue.slug} className="min-w-0">
          <MagazineCard
            title={issue.title}
            action={t("readNow")}
            image={issue.image}
            imageAlt={t("coverAlt", { title: issue.title })}
            href={`/member/login?from=${isSolitaire ? "solitaire" : "prioritas"}&magazine=${encodeURIComponent(issue.slug)}`}
            className="aspect-[3/4] w-full"
            usePrioritasButtonLibrary
            tone={activeTone}
          />
          <figcaption className="mt-4 text-center text-sm font-medium text-neutral-700">{issue.title}</figcaption>
        </figure>)}
      </PrioritasDirectoryPanel>
    </div>
  </main>;
}
