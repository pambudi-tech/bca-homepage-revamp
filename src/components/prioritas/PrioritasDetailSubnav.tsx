"use client";

import { TabLink } from "@/components/ui/Tab";

type PrioritasDetailSubnavProps = {
  label: string;
  privilege: string;
  banking: string;
  magazine: string;
  active?: "privilege" | "banking" | "magazine" | null;
};

export default function PrioritasDetailSubnav({ label, privilege, banking, magazine, active = "privilege" }: PrioritasDetailSubnavProps) {
  const items = [
    { key: "privilege", href: "/prioritas/privilege", text: privilege },
    { key: "banking", href: "/prioritas/banking-solution", text: banking },
    { key: "magazine", href: "/prioritas/e-magazine", text: magazine },
  ] as const;

  return (
    <nav className="hide-scrollbar absolute inset-x-0 top-16 z-30 h-12 overflow-x-auto border-b border-pgold-500/25 bg-transparent px-4 [scrollbar-width:none] xl:top-[72px]" aria-label={label}>
      <div className="mx-0 flex h-full w-max max-w-[1280px] items-center xl:mx-auto xl:w-full">
        {items.map((item) => <TabLink key={item.key} href={item.href} variant="underline" size="medium" tone="prioritas" active={active === item.key} aria-current={active === item.key ? "page" : undefined}>
          {item.text}
        </TabLink>)}
      </div>
    </nav>
  );
}
