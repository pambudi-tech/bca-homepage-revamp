"use client";

import { Link } from "@/i18n/navigation";

type PrioritasDetailSubnavProps = {
  label: string;
  privilege: string;
  banking: string;
  magazine: string;
  active?: "privilege" | "banking" | "magazine";
};

export default function PrioritasDetailSubnav({ label, privilege, banking, magazine, active = "privilege" }: PrioritasDetailSubnavProps) {
  const items = [
    { key: "privilege", href: "/prioritas/privilege", text: privilege },
    { key: "banking", href: "/prioritas/banking-solution", text: banking },
    { key: "magazine", href: "/prioritas/e-magazine", text: magazine },
  ] as const;

  return (
    <nav className="hide-scrollbar absolute inset-x-0 top-16 z-30 h-12 overflow-x-auto border-b border-pgold-500/25 bg-transparent px-4 [scrollbar-width:none] xl:top-[72px] xl:h-11" aria-label={label}>
      <div className="mx-0 flex h-full w-max max-w-[1280px] items-center xl:mx-auto xl:w-full">
        {items.map((item) => <Link key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} className={`group relative flex h-full shrink-0 items-center justify-center whitespace-nowrap px-3 text-sm leading-[14px] text-pbrown-200 transition-opacity xl:px-4 ${active === item.key ? "font-bold" : "font-semibold opacity-50 hover:opacity-100"}`}>
          {item.text}
          <span className={`absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-pgold-500 transition-opacity ${active === item.key ? "" : "opacity-0 group-hover:opacity-40"}`} />
        </Link>)}
      </div>
    </nav>
  );
}
