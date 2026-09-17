import type { PromoBadgeKey } from "@/components/home/promo-data";

const RIBBON_STYLE: Record<
  Exclude<PromoBadgeKey, "default">,
  { from: string; to: string; shadow: string; shadowDark: string; text: string; border: string }
> = {
  popular: { from: "#fe924d", to: "#fe6706", shadow: "#b24906", shadowDark: "#762e00", text: "#ffffff", border: "#b24906" },
  almostEnd: { from: "#ffd31c", to: "#ffba00", shadow: "#b28301", shadowDark: "#745501", text: "#4c3801", border: "rgba(0,0,0,0.3)" },
};

export default function PromoRibbon({
  badgeKey,
  label,
  side = "right",
  flow = false,
}: {
  badgeKey: Exclude<PromoBadgeKey, "default">;
  label: string;
  side?: "left" | "right";
  flow?: boolean;
}) {
  const style = RIBBON_STYLE[badgeKey];
  const isLeft = side === "left";

  return (
    <div className={`${flow ? "relative left-[-24px] min-h-[44px]" : `absolute z-20 ${isLeft ? "bottom-3 left-[-6px]" : "right-[-8px] top-40"}`} flex items-center`}>
      <div className={`absolute ${isLeft ? "left-0" : "right-0"} top-[22px] flex h-[22px] w-2 items-center justify-center`}>
        <div className={isLeft ? "-rotate-90" : "rotate-90"}>
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 8C0 3.58172 3.58172 0 8 0L17.1111 0C19.8112 0 22 2.18883 22 4.88889V8L0 8Z" fill={style.to} />
          </svg>
        </div>
      </div>
      <div className={`absolute ${isLeft ? "left-0" : "right-0"} top-[34px] flex h-[10px] w-2 items-center justify-center`}>
        <div className={isLeft ? "-rotate-90" : "rotate-90"}>
          <div className="h-2 w-[10px] rounded-t-[40px]" style={{ backgroundColor: style.shadow }} />
        </div>
      </div>
      <div className={`absolute ${isLeft ? "left-[2px]" : "right-[2px]"} top-9 flex h-2 w-1.5 items-center justify-center`}>
        <div className={isLeft ? "-rotate-90" : "rotate-90"}>
          <div className="h-1.5 w-2 rounded-t-[40px]" style={{ backgroundColor: style.shadowDark }} />
        </div>
      </div>
      <div
        className={`relative flex h-9 shrink-0 items-center overflow-clip border-b-2 py-3 ${
          isLeft ? "rounded-br-3xl rounded-tl-lg pl-6 pr-6" : "rounded-bl-3xl rounded-tr-lg pl-4 pr-6"
        }`}
        style={{
          backgroundImage: `linear-gradient(to bottom, ${style.from}, ${style.to})`,
          borderColor: style.border,
        }}
      >
        <p className="whitespace-nowrap text-sm font-semibold leading-5" style={{ color: style.text }}>
          {label}
        </p>
      </div>
    </div>
  );
}
