"use client";

import { TabLink } from "@/components/ui/Tab";

type PrioritasDetailSubnavProps = {
  label: string;
  privilege: string;
  banking: string;
  magazine: string;
  active?: "privilege" | "banking" | "magazine" | null;
  basePath?: string;
  tone?: "prioritas" | "solitaire";
  visibleItems?: Array<"privilege" | "banking" | "magazine">;
};

export default function PrioritasDetailSubnav({ label, privilege, banking, magazine, active = "privilege", basePath = "/prioritas", tone = "prioritas", visibleItems }: PrioritasDetailSubnavProps) {
  const allItems = [
    { key: "privilege", href: `${basePath}/privilege`, text: privilege },
    { key: "banking", href: `${basePath}/banking-solution`, text: banking },
    { key: "magazine", href: `${basePath}/e-magazine`, text: magazine },
  ] as const;
  const items = visibleItems ? allItems.filter((item) => visibleItems.includes(item.key)) : allItems;

  return (
    <nav className={`hide-scrollbar absolute inset-x-0 top-16 z-30 h-12 overflow-x-auto border-b bg-transparent px-4 [scrollbar-width:none] xl:top-[72px] ${tone === "solitaire" ? "border-neutral-700/50" : "border-pgold-500/25"}`} aria-label={label}>
      <div className="mx-0 flex h-full w-max max-w-[1280px] items-center xl:mx-auto xl:w-full">
        {items.map((item) => <TabLink key={item.key} href={item.href} variant="underline" size="medium" tone={tone} active={active === item.key} aria-current={active === item.key ? "page" : undefined}>
          {item.text}
        </TabLink>)}
      </div>
    </nav>
  );
}
