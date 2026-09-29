import type { ComponentPropsWithRef, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type TabVisual =
  | { variant: "underline"; size: "large" | "medium"; tone: "default" | "prioritas" | "prioritasMember" | "solitaire"; active: boolean }
  | { variant: "curved"; size?: "medium"; tone?: never; active: boolean };

type TabContentProps = TabVisual & { children: ReactNode; className?: string };
type TabButtonProps = TabContentProps & Omit<ComponentPropsWithRef<"button">, "children" | "className">;
type TabLinkProps = TabContentProps & Omit<ComponentPropsWithRef<typeof Link>, "children" | "className">;

const underlineTones = {
  default: { text: "text-blue-500", indicator: "bg-blue-500" },
  prioritas: { text: "text-pbrown-200", indicator: "bg-pgold-500" },
  prioritasMember: { text: "text-pbrown-500", indicator: "bg-pgold-500" },
  solitaire: { text: "text-neutral-100", indicator: "bg-neutral-100" },
} as const;

function tabClasses(visual: TabVisual, className?: string) {
  if (visual.variant === "curved") {
    const size = visual.size === "medium" ? "px-3 text-sm xl:px-8 xl:text-base" : "px-6 text-base xl:px-8";
    return `tab-curved prioritas-index-tab relative flex h-12 shrink-0 items-center font-semibold ${size} ${visual.active ? "tab-curved-active prioritas-index-tab-active text-pbrown-600" : "text-pbrown-200"} ${className ?? ""}`;
  }

  const size = visual.size === "large"
    ? "h-14 px-3 xl:px-5"
    : "h-12 px-3 xl:px-4";
  const typography = visual.size === "large" ? "text-base leading-normal" : "text-sm leading-[14px]";
  const textTone = visual.tone === "prioritasMember" && !visual.active ? "text-pbrown-400" : underlineTones[visual.tone].text;
  const state = visual.active
    ? "font-bold opacity-100"
    : `font-semibold ${visual.tone === "prioritasMember" ? "hover:text-pbrown-600" : `opacity-50 ${visual.size === "medium" ? "hover:opacity-100" : ""}`}`;

  return `group relative flex shrink-0 items-center justify-center whitespace-nowrap ${typography} transition-opacity ${size} ${textTone} ${state} ${className ?? ""}`;
}

function TabContent({ variant, tone, active, children }: TabContentProps) {
  if (variant === "curved") return children;
  return <>
    {children}
    <span className={`absolute inset-x-0 bottom-0 h-1 rounded-t-xl transition-opacity ${underlineTones[tone].indicator} ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
  </>;
}

export function TabButton({ variant, size, tone, active, className, children, ...props }: TabButtonProps) {
  const visual = variant === "curved" ? { variant, size, active } as const : { variant, size: size!, tone: tone!, active } as const;
  return <button type="button" {...props} className={tabClasses(visual, className)}>
    <TabContent {...visual}>{children}</TabContent>
  </button>;
}

export function TabLink({ variant, size, tone, active, className, children, ...props }: TabLinkProps) {
  const visual = variant === "curved" ? { variant, size, active } as const : { variant, size: size!, tone: tone!, active } as const;
  return <Link {...props} className={tabClasses(visual, className)}>
    <TabContent {...visual}>{children}</TabContent>
  </Link>;
}
