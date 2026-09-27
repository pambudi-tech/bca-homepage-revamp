"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MagazineCard from "@/components/prioritas/MagazineCard";
import { PrioritasDirectoryPanel } from "@/components/prioritas/PrioritasDirectory";
import issues from "@/components/prioritas/magazine-issues.json";

const MAGAZINE_PAGE_SIZE = 12;

export default function MagazineIndexExperience() {
  const t = useTranslations("magazineIndex");
  const [page, setPage] = useState(1);
  const visibleIssues = issues.slice((page - 1) * MAGAZINE_PAGE_SIZE, page * MAGAZINE_PAGE_SIZE);

  return <main id="main-content" className="min-h-screen overflow-x-clip bg-pgold-200 pb-12 text-pbrown-800 xl:pb-20">
    <div className="relative z-10 mx-auto -mt-12 w-full max-w-[1280px] px-4 xl:-mt-14 xl:px-0">
      <PrioritasDirectoryPanel
        headingId="magazine-directory-title"
        header={<h2 id="magazine-directory-title" className="sr-only">{t("breadcrumb")}</h2>}
        page={page}
        total={issues.length}
        pageSize={MAGAZINE_PAGE_SIZE}
        onPageChange={setPage}
        paginationPlacement="top"
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
            href={issue.href}
            className="aspect-[3/4] w-full"
          />
          <figcaption className="mt-4 text-center text-sm font-medium text-neutral-700">{issue.title}</figcaption>
        </figure>)}
      </PrioritasDirectoryPanel>
    </div>
  </main>;
}
