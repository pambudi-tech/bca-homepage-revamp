"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type PrioritasDetailSubnavProps = {
  label: string;
  privilege: string;
  banking: string;
  magazine: string;
};

export default function PrioritasDetailSubnav({ label, privilege, banking, magazine }: PrioritasDetailSubnavProps) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setFilled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const surface = filled ? "bg-pbrown-800/95 backdrop-blur-md" : "bg-transparent";

  return (
    <nav className={`absolute inset-x-0 top-[72px] z-30 hidden h-11 overflow-x-auto px-4 [scrollbar-width:none] transition-[background-color,backdrop-filter] duration-200 xl:block ${surface}`} aria-label={label}>
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center">
        <Link href="/prioritas" className="group relative flex h-11 shrink-0 items-center justify-center whitespace-nowrap px-4 text-sm font-bold leading-[14px] text-pbrown-200 transition-opacity">
          {privilege}
          <span className="absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-pgold-500" />
        </Link>
        <Link href="/prioritas" className="group relative flex h-11 shrink-0 items-center justify-center whitespace-nowrap px-4 text-sm font-semibold leading-[14px] text-pbrown-200 opacity-50 transition-opacity hover:opacity-100">
          {banking}
          <span className="absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-pgold-500 opacity-0 transition-opacity group-hover:opacity-40" />
        </Link>
        <Link href="/prioritas" className="group relative flex h-11 shrink-0 items-center justify-center whitespace-nowrap px-4 text-sm font-semibold leading-[14px] text-pbrown-200 opacity-50 transition-opacity hover:opacity-100">
          {magazine}
          <span className="absolute inset-x-0 bottom-0 h-1 rounded-t-xl bg-pgold-500 opacity-0 transition-opacity group-hover:opacity-40" />
        </Link>
      </div>
    </nav>
  );
}
