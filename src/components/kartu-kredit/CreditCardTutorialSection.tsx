/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApplyInMyBcaLink } from "@/components/ui/MyBcaLinks";

const TUTORIAL_IMAGE_BASE = "https://pustaka.bca.co.id/images/assets-mybca/tutorial-mybca/2026";
const TUTORIAL_IMAGES = [
  `${TUTORIAL_IMAGE_BASE}/20260814-cara-mengajukan-kartu-kredit-bca-1.png`,
  ...Array.from({ length: 4 }, (_, index) =>
    `${TUTORIAL_IMAGE_BASE}/20260210-cara-mengajukan-kartu-kredit-bca-${index + 2}.png`,
  ),
];

type TutorialStep = { title: string; description: string };

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      {direction === "left" ? (
        <path d="M19 12H5m7 7-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path d="m5 9 7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CreditCardTutorialSection() {
  const t = useTranslations("creditCardDetail.tutorial");
  const steps = t.raw("steps") as TutorialStep[];
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const stepCount = Math.min(5, steps.length, TUTORIAL_IMAGES.length);

  const moveStep = (next: number) => {
    const bounded = Math.max(0, Math.min(stepCount - 1, next));
    setActiveStep(bounded);
    const slide = railRef.current?.children[bounded] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const updateActiveStep = () => {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;
    Array.from(rail.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const nextDistance = Math.abs(element.offsetLeft + element.offsetWidth / 2 - center);
      if (nextDistance < distance) {
        distance = nextDistance;
        closest = index;
      }
    });
    setActiveStep((current) => current === closest ? current : closest);
  };

  const toggleTutorial = () => {
    setActiveStep(0);
    setExpanded(true);
  };

  return (
    <section id="tutorial" className="relative isolate w-full overflow-hidden bg-neutral-900 text-white" aria-label={t("heading")}>
          <img
            src="/assets/kartu-kredit/tutorial-background.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-20 size-full object-cover object-center"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-neutral-900/75" />

          <div className="mx-auto max-w-[640px] px-5 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-12 xl:px-12">
            <h3 className="text-2xl font-semibold leading-8 text-white sm:text-3xl sm:leading-10">{t("heading")}</h3>
            <p className="mt-3 text-sm leading-5 text-neutral-100 sm:text-base sm:leading-6">{t("description")}</p>

            {!expanded ? (
              <img
                src="/assets/kartu-kredit/tutorial-preview.png"
                alt={t("previewAlt")}
                loading="lazy"
                decoding="async"
                className="mx-auto mt-6 block h-auto w-full max-w-[686px]"
              />
            ) : (
              <div className="relative mt-6">
                <div
                  id="credit-card-tutorial-carousel"
                  ref={railRef}
                  onScroll={updateActiveStep}
                  className="hide-scrollbar -mx-5 flex snap-x snap-mandatory scroll-smooth overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 xl:-mx-12 xl:px-12"
                  aria-label={t("carouselLabel")}
                >
                  {Array.from({ length: stepCount }, (_, index) => (
                    <div key={index} className="flex w-full shrink-0 snap-center justify-center">
                      <img
                        src={TUTORIAL_IMAGES[index]}
                        alt={steps[index].description}
                        loading="lazy"
                        decoding="async"
                        className="h-[min(112vw,460px)] w-auto max-w-[78vw] object-contain"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => moveStep(activeStep - 1)}
                  disabled={activeStep === 0}
                  aria-label={t("previousStep")}
                  className="absolute left-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-neutral-900/50 text-white transition-colors hover:bg-neutral-800 disabled:opacity-40 sm:left-1"
                >
                  <Arrow direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(activeStep + 1)}
                  disabled={activeStep === stepCount - 1}
                  aria-label={t("nextStep")}
                  className="absolute right-0 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-40 sm:right-1"
                >
                  <Arrow direction="right" />
                </button>
              </div>
            )}

            {expanded ? (
              <div key={activeStep} className="content-fade-in mt-5 text-center sm:mt-6">
                <p aria-live="polite" className="text-sm font-medium text-white/80">{t("stepLabel", { current: activeStep + 1 })}</p>
                <h4 className="mt-2 text-xl font-semibold leading-7 text-white">{steps[activeStep].title}</h4>
                <p aria-live="polite" className="mx-auto mt-2 max-w-[540px] text-sm leading-5 text-neutral-100 sm:text-base sm:leading-6">{steps[activeStep].description}</p>
                <a
                  href="https://www.bca.co.id/mybca#/tutorials/cara-mengajukan-kartu-kredit"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-white transition-colors hover:text-cyan-300"
                >
                  {t("seeFullSteps")}
                  <Arrow direction="right" />
                </a>
              </div>
            ) : null}

            {!expanded ? (
              <button
                type="button"
                aria-expanded={false}
                aria-controls="credit-card-tutorial-carousel"
                onClick={toggleTutorial}
                className="mx-auto mt-3 flex min-h-11 items-center justify-center gap-2 px-4 text-base font-semibold text-white transition-colors hover:text-cyan-300"
              >
                {t("showTutorial")}
                <Chevron />
              </button>
            ) : null}

            <div className="mt-5 grid w-full grid-cols-2 gap-3 border-t border-white/30 pt-6 sm:mx-auto sm:max-w-[440px]">
              <ApplyInMyBcaLink className="btn-base btn-primary justify-center whitespace-nowrap px-3 text-sm sm:text-base">
                {t("applyMyBca")}
              </ApplyInMyBcaLink>
              <a href="https://webform.bca.co.id/applycc" className="btn-base btn-secondary !border-white justify-center whitespace-nowrap bg-transparent px-3 text-sm text-white hover:bg-white/10 sm:text-base">
                {t("applyWeb")}
              </a>
            </div>
          </div>
    </section>
  );
}
