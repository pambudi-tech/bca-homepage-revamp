import type { ComponentPropsWithRef, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type TabVisual =
  | { variant: "underline"; size: "large" | "medium"; tone: "default" | "prioritas" | "solitaire"; active: boolean }
  | { variant: "curved"; size?: never; tone?: never; active: boolean };

type TabContentProps = TabVisual & { children: ReactNode; className?: string };
type TabButtonProps = TabContentProps & Omit<ComponentPropsWithRef<"button">, "children" | "className">;
type TabLinkProps = TabContentProps & Omit<ComponentPropsWithRef<typeof Link>, "children" | "className">;

const underlineTones = {
  default: { text: "text-blue-500", indicator: "bg-blue-500" },
  prioritas: { text: "text-pbrown-200", indicator: "bg-pgold-500" },
  solitaire: { text: "text-neutral-100", indicator: "bg-neutral-100" },
} as const;

function tabClasses(visual: TabVisual, className?: string) {
  if (visual.variant === "curved") {
    return `tab-curved prioritas-index-tab relative flex h-12 shrink-0 items-center px-6 text-base font-semibold xl:px-8 ${visual.active ? "tab-curved-active prioritas-index-tab-active text-pbrown-600" : "text-pbrown-200"} ${className ?? ""}`;
  }

  const size = visual.size === "large"
    ? "h-14 px-3 xl:px-5 xl:text-base xl:leading-normal"
    : "h-12 px-3 xl:px-4";
  const state = visual.active
    ? "font-bold opacity-100"
    : `font-semibold opacity-50 ${visual.size === "medium" ? "hover:opacity-100" : ""}`;

  return `group relative flex shrink-0 items-center justify-center whitespace-nowrap text-sm leading-[14px] transition-opacity ${size} ${underlineTones[visual.tone].text} ${state} ${className ?? ""}`;
}

function TabContent({ variant, tone, active, children }: TabContentProps) {
  if (variant === "curved") return children;
  return <>
    {children}
    <span className={`absolute inset-x-0 bottom-0 h-1 rounded-t-xl transition-opacity ${underlineTones[tone].indicator} ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
  </>;
}

export function TabButton({ variant, size, tone, active, className, children, ...props }: TabButtonProps) {
  const visual = variant === "curved" ? { variant, active } as const : { variant, size: size!, tone: tone!, active } as const;
  return <button type="button" {...props} className={tabClasses(visual, className)}>
    <TabContent {...visual}>{children}</TabContent>
  </button>;
}

export function TabLink({ variant, size, tone, active, className, children, ...props }: TabLinkProps) {
  const visual = variant === "curved" ? { variant, active } as const : { variant, size: size!, tone: tone!, active } as const;
  return <Link {...props} className={tabClasses(visual, className)}>
    <TabContent {...visual}>{children}</TabContent>
  </Link>;
}
