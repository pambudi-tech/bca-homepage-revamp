"use client";
import type { Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "./PrioritasButton";

/** The same directory/rail card rendered by SignaturePrivilegeExperience. */
export default function SignatureDirectoryCard({ href, image, title, tone = "prioritas", badgeLabel, active = false, hidden = false, progress = 0, cardRef, previewViewport }: { href: string; image: string; title?: string; tone?: "prioritas" | "solitaire"; badgeLabel?: string | null; active?: boolean; hidden?: boolean; progress?: number; cardRef?: Ref<HTMLAnchorElement>; previewViewport?: "mobile" | "desktop" }) {
  const t = useTranslations("signaturePrivilege");
  const isSolitaire = tone === "solitaire";
  const buttonClassName = isSolitaire ? solitaireButtonClassName : prioritasButtonClassName;
  const desktop = previewViewport === "desktop";
  const responsiveCard = previewViewport ? desktop ? "h-60 w-full" : `w-[280px] ${active ? "h-[360px]" : "h-[328px]"}` : `w-[280px] ${active ? "h-[360px]" : "h-[328px]"} sm:h-60 sm:w-auto sm:shrink sm:snap-none`;
  return <Link href={href} ref={cardRef} aria-hidden={hidden} inert={hidden} className={`group relative block shrink-0 snap-center overflow-hidden rounded-xl ${isSolitaire ? "bg-neutral-900" : "bg-pbrown-800 shadow-prioritas"} transition-[height,opacity,transform] duration-500 ease-in-out ${responsiveCard} ${hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}>
                <img src={image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isSolitaire ? "from-black/70 via-black/15" : "from-pbrown-900/90 via-pbrown-900/20"} to-transparent`} />
                {badgeLabel ? <span
                  className={`glass-panel ${isSolitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} absolute right-2 top-4 z-20 inline-flex max-w-[calc(100%-1rem)] items-center rounded-xl px-3 py-2 text-right text-xs font-semibold leading-4 text-white shadow-card sm:top-2 sm:text-sm`}
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-pbrown-600) 30%, transparent)", isolation: "isolate" }}
                >{badgeLabel}</span> : null}
                <div className={`absolute left-4 top-4 z-30 ${previewViewport ? desktop ? "hidden" : "" : "xl:hidden"}`}>
                  <svg viewBox="0 0 32 32" className={`size-8 -rotate-90 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} aria-hidden>
                    <circle cx="16" cy="16" r="16" fill="rgba(0,0,0,0.28)" />
                    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - (active ? progress : 0))} />
                  </svg>
                </div>
                <div
                  className={`glass-panel ${isSolitaire ? "glass-panel-solitaire" : "glass-panel-prioritas"} absolute inset-x-2 bottom-2 z-10 flex ${previewViewport ? desktop ? "h-auto" : "h-[120px]" : "h-[120px] sm:h-auto"} flex-col justify-between rounded-xl p-4`}
                  style={{ isolation: "isolate" }}
                >
                  <h2 className="min-h-14 text-subtitle text-white">{title}</h2>
                  <span className={buttonClassName({ kind: "text", surface: "inverse", size: "large", className: "mt-2 self-start" })}>
                    <span className="prio-button__label">{t("more")}</span>
                    <PrioritasButtonIcon src={isSolitaire ? "/assets/cycle1/pelajari-icon.svg" : "/assets/prioritas/privilege/arrow-small.svg"} />
                  </span>
                </div>
              </Link>;
}
