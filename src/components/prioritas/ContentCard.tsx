import type { Promo } from "@/components/home/promo-data";
import type { EventPromo } from "@/components/prioritas/event-data";
import PromoCard from "@/components/promo/PromoCard";
import type { PrivilegePromo } from "@/lib/partner-privileges";

export type ContentCardVariant = "complimentary" | "lifestyle" | "event" | "promo";

type ContentCardProps = {
  now: Date;
  fill?: boolean;
  reveal?: boolean;
  detailHref?: string;
  solitaire?: boolean;
} & (
  | { variant: "complimentary" | "lifestyle"; item: PrivilegePromo }
  | { variant: "event"; item: EventPromo }
  | { variant: "promo"; item: Promo }
);

const detailBase: Record<ContentCardVariant, string> = {
  complimentary: "/prioritas/privilege",
  lifestyle: "/prioritas/lifestyle-privilege",
  event: "/prioritas/event",
  promo: "/prioritas/promo",
};

/** The shared Prioritas card structure, with content slots selected by data context. */
export default function ContentCard({ now, fill = true, reveal = false, detailHref, solitaire = false, ...content }: ContentCardProps) {
  const { variant, item } = content;

  return (
    <PromoCard
      promo={item}
      now={now}
      reveal={reveal}
      variant="prioritas"
      solitaire={solitaire}
      fill={fill}
      detail
      detailHref={detailHref ?? `${detailBase[variant]}/${item.id}`}
      promoPage={variant === "promo"}
      partnerPrivilege={variant === "complimentary" || variant === "lifestyle"}
      birthdayGift={variant === "complimentary" && content.item.birthdayGift}
      eventDate={variant === "event" ? content.item.dateTile : undefined}
      usePrioritasButtonLibrary={variant !== "promo"}
      className={`content-card content-card--${variant}`}
    />
  );
}
