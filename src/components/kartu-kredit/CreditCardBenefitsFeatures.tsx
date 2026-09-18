/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ProductAccordion, type ProductAccordionItem } from "@/components/home/ProductSection";
import type { ComparisonCard } from "@/components/kartu-kredit/CreditCardComparison";

type BenefitItem = {
  key: string;
  title: string;
  description?: string;
};

type FeatureItem = {
  key: string;
  title: string;
  description: string;
  badge?: string;
};

const FEATURE_ICONS: Record<string, string> = {
  transactions: "/assets/kartu-kredit/apply.svg",
  application: "/assets/kartu-kredit/apply.svg",
  "add-card": "/assets/kartu-kredit/apply-addition.svg",
  installment: "/assets/kartu-kredit/change-transaction.svg",
  miles: "/assets/kartu-kredit/redeem-reward.svg",
  reward: "/assets/kartu-kredit/check-balance.svg",
  limit: "/assets/kartu-kredit/req-limit.svg",
  control: "/assets/kartu-kredit/control.svg",
  contactless: "/assets/kartu-kredit/contactless.svg",
};

const FEATURE_COPY = {
  bca: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM BCA", description: "Dapat bertransaksi di merchant online dan offline serta ATM BCA." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
    { key: "reward", title: "Reward BCA", description: "Dapatkan Reward BCA dari transaksi menggunakan kartu." },
  ],
  visa: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM Visa", description: "Dapat bertransaksi di merchant online dan offline serta ATM berlogo Visa." },
    { key: "contactless", title: "Transaksi Contactless", description: "Lakukan pembayaran contactless untuk kartu yang memiliki fitur ini." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
  ],
  mastercard: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM Mastercard", description: "Dapat bertransaksi di merchant online dan offline serta ATM berlogo Mastercard." },
    { key: "contactless", title: "Transaksi Contactless", description: "Lakukan pembayaran contactless untuk kartu yang memiliki fitur ini." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
  ],
  jcb: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM JCB", description: "Dapat bertransaksi di merchant online dan offline serta ATM berlogo JCB." },
    { key: "contactless", title: "Transaksi Contactless", description: "Lakukan pembayaran contactless untuk kartu yang memiliki fitur ini." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
  ],
  unionpay: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM UnionPay", description: "Dapat bertransaksi di merchant online dan offline serta ATM berlogo UnionPay." },
    { key: "contactless", title: "Transaksi Contactless", description: "Lakukan pembayaran contactless untuk kartu yang memiliki fitur ini." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
  ],
  americanExpress: [
    { key: "transactions", title: "Transaksi di Merchant dan ATM", description: "Dapat bertransaksi di merchant online dan offline serta ATM yang menerima American Express." },
    { key: "contactless", title: "Transaksi Contactless", description: "Lakukan pembayaran contactless untuk kartu yang memiliki fitur ini." },
    { key: "installment", title: "Cicilan BCA", description: "Ubah transaksi yang memenuhi syarat menjadi Cicilan BCA." },
  ],
} satisfies Record<string, FeatureItem[]>;

function getFeatureCluster(cardId: string) {
  if (["everyday-card", "card-platinum"].includes(cardId)) return "bca";
  if (["krisflyer-signature", "krisflyer-infinite", "pps-club-infinite", "visa-batman", "visa-black"].includes(cardId)) return "visa";
  if (["tiket-mastercard", "mastercard-black", "blibli-mastercard", "mastercard-globe", "mastercard-world"].includes(cardId)) return "mastercard";
  if (cardId === "jcb-black") return "jcb";
  if (cardId === "unionpay") return "unionpay";
  return "americanExpress";
}

function FeatureIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={48} height={48} className="size-12 object-contain" />;
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <article
      className="relative h-full w-full rounded-xl border border-neutral-300 bg-white p-4 shadow-card transition-transform duration-200 xl:hover:-translate-y-1"
    >
      {item.badge ? (
        <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
      <div className="mb-2 flex size-12 items-center justify-center">
        <FeatureIcon src={FEATURE_ICONS[item.key]} />
      </div>
      <h3 className="text-base font-semibold text-blue-700">{item.title}</h3>
      <p className="mt-2 text-sm leading-5 text-neutral-600">{item.description}</p>
    </article>
  );
}

export default function CreditCardBenefitsFeatures({ card }: { card?: ComparisonCard }) {
  const t = useTranslations("creditCardDetail.benefitsFeatures");
  const benefits = t.raw("benefits") as BenefitItem[];
  const cardId = card?.id;
  const comparisonBenefits = card?.comparison?.find((section) => section.key === "benefits")?.groups.flatMap((group) => group.points) ?? [];
  const comparisonFeatures = card?.comparison?.find((section) => section.key === "features")?.groups.flatMap((group) => group.points) ?? [];
  const cardBenefits = cardId === "krisflyer-signature" ? t.raw("cardSpecificBenefits.krisflyer-signature") as BenefitItem[] : comparisonBenefits.map((item, index) => ({ key: `${cardId ?? "card"}-benefit-${index}`, title: item.label, description: item.description ?? item.bullets?.join(" ") ?? "" }));
  const specificFeatures = cardId === "krisflyer-signature" ? t.raw("cardSpecificFeatures.krisflyer-signature") as FeatureItem[] : comparisonFeatures.map((item, index) => ({ key: `${cardId ?? "card"}-feature-${index}`, title: item.label, description: item.description ?? item.bullets?.join(" ") ?? "" }));
  const features = specificFeatures.length ? specificFeatures : cardId ? FEATURE_COPY[getFeatureCluster(cardId)] : t.raw("features") as FeatureItem[];
  const benefitHeading = cardId === "krisflyer-signature" ? t("cardSpecificHeadings.krisflyer-signature") : t("benefitHeading");
  const featureHeading = cardId === "krisflyer-signature" ? t("cardSpecificHeadings.features.krisflyer-signature") : t("featureHeading");
  const benefitCards: ProductAccordionItem[] = (cardBenefits.length ? cardBenefits : card?.benefits.map((item, index) => ({ key: `${cardId ?? "card"}-benefit-${index}`, title: item.label, description: item.label })) ?? benefits).map((item) => ({
    key: item.key,
    title: item.title,
    description: item.description ?? "",
    image: "/assets/kartu-kredit/benefit-placeholder.svg",
  }));
  const featureRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = featureRailRef.current;
    const count = features.length;
    if (!container || count === 0) return;

    const cardAt = (slot: number) => container.children[slot] as HTMLElement | undefined;
    const firstMiddleCopy = cardAt(count);
    if (firstMiddleCopy) {
      container.scrollLeft = firstMiddleCopy.offsetLeft - (container.clientWidth - firstMiddleCopy.offsetWidth) / 2;
    }

    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      frame = 0;
      const center = container.scrollLeft + container.clientWidth / 2;
      let nearest = 0;
      let bestDistance = Infinity;

      for (let slot = 0; slot < container.children.length; slot++) {
        const card = cardAt(slot);
        if (!card) continue;
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < bestDistance) {
          bestDistance = distance;
          nearest = slot;
        }
      }

      clearTimeout(settle);
      const twin = count + (nearest % count);
      if (twin === nearest) return;

      settle = setTimeout(() => {
        const from = cardAt(nearest);
        const to = cardAt(twin);
        if (!from || !to) return;
        container.style.scrollSnapType = "none";
        container.scrollLeft += to.offsetLeft - from.offsetLeft;
        requestAnimationFrame(() => {
          container.style.scrollSnapType = "";
        });
      }, 80);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [features.length]);

  return (
    <section id="manfaat" className="relative isolate overflow-hidden bg-blue-100 py-16 xl:py-24" aria-labelledby="manfaat-title">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src="/assets/product/bg-clove-a.svg" alt="" className="absolute -left-[520px] top-20 h-[1500px] w-[1110px] opacity-50" />
        <img src="/assets/product/bg-clove-b.svg" alt="" className="absolute -right-[500px] top-[360px] h-[1300px] w-[1110px] opacity-60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 xl:px-0">
        <div className="max-w-[560px]">
          <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">{t("benefitEyebrow")}</p>
          <h2 id="manfaat-title" className="mt-4 text-heading text-blue-700 xl:text-display">
            {benefitHeading}
          </h2>
        </div>

        <div className="mt-10">
          <ProductAccordion items={benefitCards} defaultKey={benefitCards[0]?.key} />
        </div>

        <div id="fitur" className="pt-20 xl:pt-28" aria-labelledby="fitur-title">
          <div className="max-w-[560px]">
            <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">{t("featureEyebrow")}</p>
            <h2 id="fitur-title" className="mt-4 text-heading text-blue-700 xl:text-display">
              {featureHeading}
            </h2>
          </div>

          <div className="mt-10">
            <div
              ref={featureRailRef}
              className="hide-scrollbar -mx-4 flex items-stretch snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:hidden"
            >
              {[...features, ...features, ...features].map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  aria-hidden={index < features.length || index >= features.length * 2}
                  className="flex w-[200px] shrink-0 snap-center"
                >
                  <FeatureCard item={item} />
                </div>
              ))}
            </div>
            <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:gap-4">
              {features.map((item) => <FeatureCard key={item.key} item={item} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
