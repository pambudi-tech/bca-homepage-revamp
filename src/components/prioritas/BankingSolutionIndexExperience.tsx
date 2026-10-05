"use client";

import { useTranslations } from "next-intl";
import { BankingPrivilegeCard, WealthCard, type PrivilegeCard, type WealthCardData } from "@/components/prioritas/BankingSolutionSection";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";

const root = "/assets/prioritas/banking-solution";
const existing = "/assets/prioritas/banking";
const privilegeAssets = [
  { key: "jcb", image: `${root}/jcb-welcome-bonus.png`, imagePosition: "55% center", id: "jcb-black" },
  { key: "vehicle", image: `${existing}/privilege-vehicle.png`, id: "kkb" },
  { key: "branch", image: `${existing}/privilege-branch.png`, id: "layanan-cabang" },
  { key: "insurance", image: `${root}/insurance.png`, id: "asuransi" },
  { key: "fees", image: `${root}/special-transaction-fees.png`, id: "biaya-transaksi" },
  { key: "transaction", image: `${existing}/privilege-transaction.png`, id: "fitur-transaksi" },
  { key: "media", image: `${root}/information-media.jpg`, id: "media-informasi" },
  { key: "advisor", image: `${root}/branch-service-advisor.png`, id: "personal-banker" },
  { key: "family", image: `${root}/branch-service-family.png`, id: "young-community" },
  { key: "contact", image: `${root}/contact-center.png`, id: "contact-center" },
  { key: "credit", image: `${existing}/privilege-credit.png`, id: "kartu-kredit" },
  { key: "home", image: `${existing}/privilege-home.png`, id: "kpr" },
  { key: "motorcycle", image: `${root}/motorcycle-loan.png`, id: "ksm" },
  { key: "merchant", image: `${root}/merchant-edc.png`, id: "merchant-edc" },
  { key: "deposit", image: `${existing}/privilege-deposit.png`, id: "safe-deposit-box" },
  { key: "forex", image: `${root}/foreign-exchange.png`, id: "valuta-asing" },
] as const;

const privilegeCardKeys = [
  "vehicle", "home", "motorcycle", "insurance",
  "jcb", "credit", "merchant",
  "fees", "transaction", "forex", "deposit",
  "branch", "advisor", "family", "contact", "media",
] as const;

function WealthGroup({ group, backdrops, tone }: { group: "house" | "market"; backdrops: Record<string, string>; tone: "prioritas" | "solitaire" }) {
  const t = useTranslations("bankingSolutionIndex");
  const assets = group === "house" ? insightAssets.house.slice(0, 3) : insightAssets.market;
  const cards: WealthCardData[] = assets.map(({ key, image, actionIcon }) => ({
    title: t(`insight.${key}.title`),
    image,
    imageAlt: t(`insight.${key}.alt`),
    action: t("downloadAction"),
    actionIcon: actionIcon === "download" ? "download" : undefined,
    backdrop: backdrops[key],
    href: group === "house"
      ? "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/House-View-Report"
      : "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/Weekly-Market-Overview",
    metadata: [
      { icon: `${existing}/calendar.svg`, label: t(`insight.${key}.date`) },
    ],
  }));

  return <section aria-labelledby={`wealth-${group}`} className="relative">
    <h2 id={`wealth-${group}`} className="text-subtitle text-neutral-800 xl:text-title">{t(`groups.${group}`)}</h2>
    <div className="hide-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 xl:grid-cols-3">
      {cards.map((card) => <div key={card.title} className="w-[280px] shrink-0 snap-center sm:w-auto sm:shrink">
        <WealthCard card={card} tone={tone} />
      </div>)}
    </div>
  </section>;
}

export default function BankingSolutionIndexExperience({ activeTab, backdrops = {}, memberArea = false, publicBasePath = "/prioritas" }: { activeTab: "privilege" | "wealth"; backdrops?: Record<string, string>; memberArea?: boolean; publicBasePath?: string }) {
  const t = useTranslations("bankingSolutionIndex");
  const isSolitaire = publicBasePath === "/solitaire" && !memberArea;

  return <main className={`overflow-hidden ${isSolitaire ? "bg-neutral-200" : "bg-pgold-200"}`}>
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 xl:px-0">
      {activeTab === "privilege" ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {privilegeCardKeys.map((key) => {
          const asset = privilegeAssets.find((item) => item.key === key);
          if (!asset) throw new Error(`Unknown Banking Privilege card: ${key}`);
          const card: PrivilegeCard = {
            title: t(`privilege.${key}`),
            alt: t(`privilege.${key}`),
            image: asset.image,
            imagePosition: "imagePosition" in asset ? asset.imagePosition : undefined,
            href: activeTab === "privilege" ? `${memberArea ? "/prioritas/member" : publicBasePath}/banking-solution/privilege/${asset.id}` : undefined,
          };
          return <BankingPrivilegeCard key={key} card={card} action={t("more")} directory tone={isSolitaire ? "solitaire" : "prioritas"} />;
        })}
      </div> : <div className="flex flex-col gap-10">
        <WealthGroup group="house" backdrops={backdrops} tone={isSolitaire ? "solitaire" : "prioritas"} />
        <WealthGroup group="market" backdrops={backdrops} tone={isSolitaire ? "solitaire" : "prioritas"} />
      </div>}
    </div>
  </main>;
}
