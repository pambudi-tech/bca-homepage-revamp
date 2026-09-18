"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";

type DetailSection = NonNullable<ComparisonCard["comparison"]>[number];
type TableCell = { text: string; colSpan?: number; rowSpan?: number };
type InformationTableBlock = { type: "table"; columns: string[]; rows: { label: string; labelColSpan?: number; cells: TableCell[] }[]; columnTooltips?: Record<string, string> };
type InformationTextBlock = { type: "text"; heading?: string; body?: string; bullets?: string[] };
type InformationBlock = InformationTableBlock | InformationTextBlock;
type InformationTopic = { key: string; label: string; columns: string[]; rows: { label: string; labelColSpan?: number; cells: TableCell[] }[]; blocks?: InformationBlock[] };

const sectionIds: Record<string, string> = { fees: "biaya", requirements: "syarat-pengajuan", limit: "limit", payments: "suku-bunga-pembayaran", simulation: "simulasi" };

function InformationTable({ columns, rows, columnTooltips }: { columns: string[]; rows: { label: string; labelColSpan?: number; cells: TableCell[] }[]; columnTooltips?: Record<string, string> }) {
  const isInterestTable = columns.length > 3;

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-300 bg-white">
      <table className={`w-full table-fixed border-collapse text-left ${columns.length > 3 ? "min-w-[1100px]" : "min-w-[640px]"}`}>
        <thead><tr className="bg-cyan-100 text-blue-500">{columns.map((column, index) => <th key={column} className={`${index === 0 ? (isInterestTable ? "w-[180px]" : "w-1/3") : index === 1 && isInterestTable ? "w-[320px]" : ""} px-6 py-4 text-base font-semibold`}><span className="inline-flex items-center gap-2">{column}{columnTooltips?.[column] ? <span title={columnTooltips[column]} aria-label={columnTooltips[column]} className="inline-flex size-5 cursor-help items-center justify-center rounded-full border border-blue-500 text-xs font-bold leading-none">i</span> : null}</span></th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.label}-${index}`} className="align-top border-t border-white bg-neutral-100"><th colSpan={row.labelColSpan} className="px-6 py-5 text-base font-normal leading-6 text-neutral-800">{row.label}</th>{row.cells.map((cell, cellIndex) => <td key={`${row.label}-${cellIndex}`} colSpan={cell.colSpan} rowSpan={cell.rowSpan} className="px-6 py-5 text-base leading-6 text-neutral-800">{cell.text}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function CreditCardDetailSections({ sections, labels, cardId }: { sections: DetailSection[]; labels: Record<string, string>; cardId?: string }) {
  const t = useTranslations("creditCardDetail.detailPage");
  const specificTopics = cardId === "krisflyer-signature" ? t.raw("cardSpecificInformation.krisflyer-signature.topics") as InformationTopic[] : [];
  const topicTemplate = t.raw("cardSpecificInformation.krisflyer-signature.topics") as InformationTopic[];
  const templateFees = topicTemplate.find((topic) => topic.key === "fees");
  const templateLimitRisk = topicTemplate.find((topic) => topic.key === "limit-risk");
  const templateSimulation = topicTemplate.find((topic) => topic.key === "simulation");
  const pointsFor = (keys: string[]) => sections
    .filter((section) => keys.includes(section.key))
    .flatMap((section) => section.groups.flatMap((group) => group.points));
  const feePoints = pointsFor(["fees"]);
  const limitRiskPoints = pointsFor(["requirements", "limit", "payments"]);
  const limitPoints = pointsFor(["limit"]);
  const paymentPoints = pointsFor(["payments"]);
  const limitBlocks = templateLimitRisk?.blocks ?? [];
  const limitIntro = limitBlocks[0]?.type === "text" ? limitBlocks[0] : undefined;
  const limitNote = limitBlocks[2]?.type === "text" ? limitBlocks[2] : undefined;
  const transactionIntro = limitBlocks[3]?.type === "text" ? limitBlocks[3] : undefined;
  const interestIntro = limitBlocks[5]?.type === "text" ? limitBlocks[5] : undefined;
  const riskIntro = limitBlocks[6]?.type === "text" ? limitBlocks[6] : undefined;
  const limitTable = limitBlocks[1]?.type === "table" ? limitBlocks[1] : undefined;
  const transactionTable = limitBlocks[4]?.type === "table" ? limitBlocks[4] : undefined;
  const cardLimitRows = (limitPoints.length ? limitPoints : limitRiskPoints).map((point) => ({ label: point.label, cells: [{ text: point.description ?? point.bullets?.join("; ") ?? "-", colSpan: 2 }] }));
  const transactionRows = limitPoints.map((point) => ({ label: point.label, cells: [{ text: point.description ?? point.bullets?.join("; ") ?? "-" }] }));
  const fallbackTopics: InformationTopic[] = [
    {
      key: "fees",
      label: templateFees?.label ?? labels.fees ?? "Biaya",
      columns: templateFees?.columns ?? [t("informationType"), t("primaryCard"), t("additionalCard")],
      rows: feePoints.map((point) => ({ label: point.label, cells: [{ text: point.description ?? point.bullets?.join("; ") ?? "-", colSpan: 2 }] })),
    },
    {
      key: "limit-risk",
      label: templateLimitRisk?.label ?? "Limit, Suku Bunga, & Risiko",
      columns: templateLimitRisk?.columns ?? [t("informationType"), t("primaryCard"), t("additionalCard")],
      rows: cardLimitRows,
      blocks: [
        limitIntro ?? { type: "text", heading: "Limit", bullets: [] },
        limitTable ? { ...limitTable, rows: cardLimitRows } : { type: "table", columns: ["Jenis Limit", "Kartu Utama", "Kartu Tambahan"], rows: cardLimitRows },
        limitNote ?? { type: "text", body: "Keterangan: Limit kredit akan diberikan sesuai hasil Analisis dari BCA." },
        transactionIntro ?? { type: "text", heading: "Limit Transaksi", bullets: [] },
        transactionTable ? { ...transactionTable, rows: transactionRows } : { type: "table", columns: ["Jenis Transaksi", "Limit"], rows: transactionRows },
        interestIntro ?? { type: "text", heading: "Suku bunga", body: paymentPoints.map((point) => point.description ?? point.bullets?.join("; ") ?? "-").join(" ") },
        riskIntro ?? { type: "text", heading: "Risiko", bullets: [] },
      ],
    },
    {
      key: "simulation",
      label: templateSimulation?.label ?? "Simulasi",
      columns: templateSimulation?.columns ?? [t("informationType"), t("primaryCard")],
      rows: templateSimulation?.rows ?? [],
      blocks: templateSimulation?.blocks,
    },
  ];
  const topics = specificTopics.length ? specificTopics : fallbackTopics;
  const [activeKey, setActiveKey] = useState(topics[0]?.key ?? "fees");
  const activeTopic = topics.find((topic) => topic.key === activeKey) ?? topics[0];
  const topicRefs = useRef(new Map<string, HTMLButtonElement>());
  const topicListRef = useRef<HTMLDivElement>(null);

  const selectTopic = (key: string) => {
    setActiveKey(key);
    const list = topicListRef.current;
    const chip = topicRefs.current.get(key);
    if (!list || !chip) return;

    const chipLeft = chip.offsetLeft;
    const chipRight = chipLeft + chip.offsetWidth;
    const viewLeft = list.scrollLeft;
    const viewRight = viewLeft + list.clientWidth;
    const gutter = 16;
    let target: number | null = null;
    if (chipLeft - gutter < viewLeft) target = chipLeft - gutter;
    else if (chipRight + gutter > viewRight) target = chipRight + gutter - list.clientWidth;
    if (target !== null) list.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <section id="informasi-lainnya" className="scroll-mt-[110px] bg-blue-100 px-4 py-14 xl:px-10 xl:py-20" aria-labelledby="informasi-lainnya-title">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2 id="informasi-lainnya-title" className="text-heading text-blue-700 xl:text-display">{t("informationTitle")}</h2>
        <div ref={topicListRef} className="hide-scrollbar -mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-2 xl:mx-0 xl:px-0" role="group" aria-label={t("informationTitle")}>
          {topics.map((topic) => (
            <button key={topic.key} type="button" ref={(element) => { if (element) topicRefs.current.set(topic.key, element); else topicRefs.current.delete(topic.key); }} aria-pressed={activeKey === topic.key} onClick={() => selectTopic(topic.key)} className={`flex h-12 shrink-0 items-center whitespace-nowrap rounded-xl border px-[18px] text-sm transition-colors xl:h-14 xl:px-4 xl:text-base ${activeKey === topic.key ? "border-cyan-500 bg-cyan-100 font-bold text-blue-500" : "border-neutral-300 bg-white font-semibold text-neutral-700 hover:border-cyan-500 hover:bg-cyan-100 hover:text-blue-500"}`}>
              {topic.label}
            </button>
          ))}
        </div>
        {activeTopic ? (
          <div id={`detail-${sectionIds[activeTopic.key] ?? activeTopic.key}`} className="mt-8">
            {activeTopic.blocks ? (
              <div className="flex flex-col gap-8">
                {activeTopic.blocks.map((block, index) => block.type === "table" ? <InformationTable key={`table-${index}`} columns={block.columns} rows={block.rows} columnTooltips={block.columnTooltips} /> : <div key={`text-${index}`} className="flex flex-col gap-3">{block.heading ? <h3 className="text-xl font-bold text-neutral-900">{block.heading}</h3> : null}{block.body ? <p className="text-base leading-6 text-neutral-700">{block.body}</p> : null}{block.bullets?.length ? <ul className="list-disc space-y-2 pl-6 text-base leading-6 text-neutral-700">{block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</div>)}
              </div>
            ) : <InformationTable columns={activeTopic.columns} rows={activeTopic.rows} />}
          </div>
        ) : null}
      </div>
    </section>
  );
}
