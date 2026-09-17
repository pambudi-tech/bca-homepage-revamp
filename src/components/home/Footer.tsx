"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  ALL_SOCIAL_MEDIA_LINK,
  BOTTOM_LINK_HREFS,
  FOOTER_LINK_COLUMN_KEYS,
  FOOTER_LINK_HREFS,
  SOCIAL_LINKS,
} from "./footer-data";
import { useLenis } from "@/components/SmoothScroll";

type FooterColumn = {
  key: (typeof FOOTER_LINK_COLUMN_KEYS)[number];
  heading: string;
  links: string[];
};

function ContactRow({ icon, label, iconSizeClassName = "size-5" }: { icon: string; label: string; iconSizeClassName?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img loading="lazy" decoding="async" src={icon} alt="" className={`${iconSizeClassName} shrink-0`} />
      <p className="text-sm text-white">{label}</p>
    </div>
  );
}

function FooterLinks({ column, align = "start" }: { column: FooterColumn; align?: "start" | "end" }) {
  return (
    <div className={`flex flex-col gap-4 ${align === "end" ? "items-end gap-6" : "items-start"}`}>
      {column.links.map((link, index) => {
        const href = FOOTER_LINK_HREFS[column.key][index];
        const className = `text-sm text-white/70 transition-colors hover:text-white ${align === "end" ? "text-right" : "text-left"}`;
        return href ? (
          <a key={link} href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {link}
          </a>
        ) : (
          <button key={link} className={className}>{link}</button>
        );
      })}
    </div>
  );
}

function AccordionChevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-180">
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const parallaxRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const copyright = t("copyright");
  const bottomLinks = t.raw("bottomLinks") as string[];
  const linkColumns = FOOTER_LINK_COLUMN_KEYS.map((key) => {
    const column = t.raw(`linkColumns.${key}`) as { heading: string; links: string[] };
    return { key, ...column };
  });

  useEffect(() => {
    if (!lenis) return;
    let docHeight = document.documentElement.scrollHeight;
    const measure = () => { docHeight = document.documentElement.scrollHeight; };
    measure();
    window.addEventListener("resize", measure);
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const distanceToBottom = Math.max(0, docHeight - (window.innerHeight + window.scrollY));
      parallaxRef.current.style.transform = `translateY(${distanceToBottom * 1.3}px)`;
    };
    lenis.on("scroll", handleScroll);
    handleScroll();
    return () => {
      lenis.off("scroll", handleScroll);
      window.removeEventListener("resize", measure);
    };
  }, [lenis]);

  const legalLinks = (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {bottomLinks.map((link, index) => (
        <a key={link} href={BOTTOM_LINK_HREFS[index]} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-sm font-semibold text-white transition-colors hover:text-white/80">
          {link}
        </a>
      ))}
    </div>
  );

  return (
    <footer className="relative overflow-clip bg-blue-500 pb-[184px] pt-10 xl:pb-8 xl:pt-14">
      <div ref={parallaxRef} className="pointer-events-none absolute inset-0 z-0 overflow-visible mix-blend-multiply" style={{ isolation: "isolate" }}>
        <img loading="lazy" decoding="async" src="/assets/footer/footer-clove-pattern.svg" alt="" aria-hidden className="absolute bottom-[-512px] left-1/2 h-[1879px] w-[2568px] max-w-none -translate-x-[calc(50%+300px)]" />
      </div>

      {/* Mobile structure from the revised footer exploration. */}
      <div className="relative z-10 mx-auto w-full max-w-[420px] px-4 xl:hidden">
        <div className="flex flex-col items-start gap-6">
          <img loading="lazy" decoding="async" src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-8 w-[102px]" />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-white">{t("kantorPusat")}</p>
            <p className="whitespace-pre-line text-xs leading-[18px] text-white/70">{t("alamat")}</p>
          </div>
        </div>

        <div className="mt-10 divide-y divide-white/15 border-y border-white/15">
          {linkColumns.map((column) => (
            <details key={column.key} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-white marker:content-none">
                {column.heading}
                <AccordionChevron />
              </summary>
              <div className="pb-5"><FooterLinks column={column} /></div>
            </details>
          ))}
          <details className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-white marker:content-none">
              {t("mediaSocialHeading")}
              <AccordionChevron />
            </summary>
            <div className="flex flex-col items-start gap-4 pb-5">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                  <ContactRow icon={social.icon} label={social.label} />
                </a>
              ))}
              <a href={ALL_SOCIAL_MEDIA_LINK.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white underline transition-colors hover:text-white/80">
                {t("allSocialMedia")}
              </a>
            </div>
          </details>
        </div>

        <div className="mt-8">
          {legalLinks}
          <div className="mt-6 flex flex-col gap-3 text-xs leading-[18px] text-white/60">
            <p>{t("ojkLine")}</p>
            <p>{t("lpsLinePrefix")} <a href="https://apps.lps.go.id/BankPesertaLPSRate" target="_blank" rel="noopener noreferrer" className="underline">{t("lpsLinkLabel")}</a></p>
            <p>{copyright}</p>
          </div>
        </div>
      </div>

      {/* Desktop intentionally keeps the previous footer structure. */}
      <div className="relative z-10 mx-auto hidden w-[1280px] flex-col gap-16 xl:flex">
        <div className="flex items-center justify-between">
          <img loading="lazy" decoding="async" src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-14 w-[178.5px]" />
          <div className="flex items-start gap-8">
            {SOCIAL_LINKS.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                <ContactRow icon={social.icon} label={social.label} />
              </a>
            ))}
            <a href={ALL_SOCIAL_MEDIA_LINK.href} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-white underline transition-colors hover:text-white/80">{t("allSocialMedia")}</a>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col items-start gap-2">
              <p className="w-[222px] text-base font-semibold text-white">{t("kantorPusat")}</p>
              <p className="w-[222px] whitespace-pre-line text-sm leading-5 text-white/70">{t("alamat")}</p>
            </div>
            <div className="flex flex-col items-start gap-4">
              <ContactRow icon="/assets/footer/outline-phone.svg" label="Halo BCA 1500998" iconSizeClassName="size-6" />
              <ContactRow icon="/assets/footer/outline-envelope.svg" label="halobca@bca.co.id" iconSizeClassName="size-6" />
              <ContactRow icon="/assets/footer/outline-whatsapp.svg" label="62 811-1500-998" iconSizeClassName="size-6" />
            </div>
          </div>
          <div className="flex flex-nowrap justify-end gap-8 text-right text-white">
            {linkColumns.map((column) => (
              <div key={column.key} className="flex w-[200px] flex-col items-end gap-10">
                <p className="text-xs font-semibold uppercase tracking-[1.8px]">{column.heading}</p>
                <FooterLinks column={column} align="end" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start gap-6">
            {legalLinks}
            <p className="w-[445px] text-xs leading-[18px] text-white/60">{copyright}</p>
          </div>
          <div className="flex w-[545px] flex-col items-end gap-3 text-right text-xs text-white/60">
            <p className="whitespace-nowrap leading-tight">{t("ojkLine")}</p>
            <p className="leading-[1.5]">{t("lpsLinePrefix")} <a href="https://apps.lps.go.id/BankPesertaLPSRate" target="_blank" rel="noopener noreferrer" className="underline">{t("lpsLinkLabel")}</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
