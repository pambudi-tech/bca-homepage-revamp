/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { ProductAccordion, type ProductAccordionItem } from "@/components/home/ProductSection";

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
  application: "/assets/kartu-kredit/apply.svg",
  "add-card": "/assets/kartu-kredit/apply-addition.svg",
  installment: "/assets/kartu-kredit/change-transaction.svg",
  miles: "/assets/kartu-kredit/redeem-reward.svg",
  reward: "/assets/kartu-kredit/check-balance.svg",
  limit: "/assets/kartu-kredit/req-limit.svg",
  control: "/assets/kartu-kredit/control.svg",
  contactless: "/assets/kartu-kredit/contactless.svg",
};

function FeatureIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={48} height={48} className="size-12 object-contain" />;
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <article
      className="relative h-[200px] w-[200px] rounded-xl border border-neutral-300 bg-white p-4 shadow-card transition-transform duration-200 xl:hover:-translate-y-1"
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

export default function CreditCardBenefitsFeatures() {
  const t = useTranslations("creditCardDetail.benefitsFeatures");
  const benefits = t.raw("benefits") as BenefitItem[];
  const features = t.raw("features") as FeatureItem[];
  const benefitCards: ProductAccordionItem[] = benefits.map((item) => ({
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
            {t("benefitHeading")}
          </h2>
        </div>

        <div className="mt-10">
          <ProductAccordion items={benefitCards} defaultKey="reward" />
        </div>

        <div id="fitur" className="pt-20 xl:pt-28" aria-labelledby="fitur-title">
          <div className="max-w-[560px]">
            <p className="text-eyebrow uppercase text-blue-500 xl:text-eyebrow-lg">{t("featureEyebrow")}</p>
            <h2 id="fitur-title" className="mt-4 text-heading text-blue-700 xl:text-display">
              {t("featureHeading")}
            </h2>
          </div>

          <div className="mt-10">
            <div
              ref={featureRailRef}
              className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:hidden"
            >
              {[...features, ...features, ...features].map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  aria-hidden={index < features.length || index >= features.length * 2}
                  className="w-[200px] shrink-0 snap-center"
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
