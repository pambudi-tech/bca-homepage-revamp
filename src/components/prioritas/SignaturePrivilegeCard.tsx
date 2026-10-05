"use client";

import type { PrivilegePromo } from "@/lib/partner-privileges";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PrioritasButtonIcon, prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

export default function SignaturePrivilegeCard({ promo, href, tone = "prioritas" }: { promo: PrivilegePromo; href: string; tone?: "prioritas" | "solitaire" }) {
  const t = useTranslations("signaturePrivilege");
  const solitaire = tone === "solitaire";
  const buttonClassName = solitaire ? solitaireButtonClassName : prioritasButtonClassName;

  return (
    <Link href={href} aria-label={`${promo.title} ${t("more")}`} className="group relative block h-[360px] w-[280px] shrink-0 snap-center overflow-hidden rounded-xl bg-pbrown-800 shadow-prioritas sm:h-60 sm:w-auto sm:shrink">
      <img src={promo.cover} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-pbrown-900/90 via-pbrown-900/20 to-transparent" />
      <div
        className={`glass-panel ${solitaire ? "" : "glass-panel-prioritas"} absolute inset-x-2 bottom-2 z-10 flex h-[120px] flex-col justify-between rounded-xl p-4 sm:h-auto`}
        style={{ backgroundColor: solitaire ? "rgba(0,0,0,0.3)" : undefined, backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", isolation: "isolate" }}
      >
        <h2 className="min-h-14 text-subtitle text-white">{promo.title}</h2>
        <span className={buttonClassName({ kind: "text", surface: "inverse", size: "large", className: "mt-2 self-start" })}>
          <span className="prio-button__label">{t("more")}</span>
          <PrioritasButtonIcon src={solitaire ? "/assets/cycle1/pelajari-icon.svg" : "/assets/prioritas/privilege/arrow-small.svg"} />
        </span>
      </div>
    </Link>
  );
}
