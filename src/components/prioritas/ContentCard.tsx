import type { Promo } from "@/components/home/promo-data";
import type { EventPromo } from "@/components/prioritas/event-data";
import CardVisual from "@/components/promo/CardVisual";
import type { PrivilegePromo } from "@/lib/partner-privileges";

export type ContentCardVariant = "complimentary" | "lifestyle" | "event" | "promo";

type ContentCardProps = {
  now: Date;
  fill?: boolean;
  reveal?: boolean;
  detailHref?: string;
  solitaire?: boolean;
  compact?: boolean;
  showPromoTimestamp?: boolean;
  previewViewport?: "mobile" | "desktop";
} & (
  | { variant: "complimentary" | "lifestyle"; item: PrivilegePromo }
  | { variant: "event"; item: EventPromo }
  | { variant: "promo"; item: Promo }
);

const detailSegment: Record<ContentCardVariant, string> = {
  complimentary: "privilege",
  lifestyle: "lifestyle-privilege",
  event: "event",
  promo: "promo",
};

/** The shared Prioritas card structure, with content slots selected by data context. */
export default function ContentCard({ now, fill = true, reveal = false, detailHref, solitaire = false, compact = false, showPromoTimestamp = false, previewViewport, ...content }: ContentCardProps) {
  const { variant, item } = content;

  return (
    <CardVisual
      previewViewport={previewViewport}
      promo={item}
      now={now}
      reveal={reveal}
      variant="prioritas"
      solitaire={solitaire}
      fill={fill}
      compact={compact}
      detail={!showPromoTimestamp}
      detailHref={detailHref ?? `/${solitaire ? "solitaire" : "prioritas"}/${detailSegment[variant]}/${item.id}`}
      promoPage={variant === "promo" && !showPromoTimestamp}
      partnerPrivilege={variant === "complimentary" || variant === "lifestyle"}
      birthdayGift={variant === "complimentary" && content.item.birthdayGift}
      eventDate={variant === "event" ? content.item.dateTile : undefined}
      usePrioritasButtonLibrary={variant !== "promo"}
      showPromoTimestamp={showPromoTimestamp}
      className={`content-card content-card--${variant}`}
    />
  );
}
