"use client";

import { useEffect, useRef } from "react";
import { FOOTER_BOTTOM_LINKS, FOOTER_LINK_COLUMNS, SOCIAL_LINKS } from "./footer-data";
import { useLenis } from "@/components/SmoothScroll";

const COPYRIGHT = "Copyrights © 2026 PT Bank Central Asia Tbk, All Rights Reserved";

function ContactRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <img loading="lazy" decoding="async" src={icon} alt="" className="size-5 shrink-0" />
      <p className="text-sm text-white">{label}</p>
    </div>
  );
}

export default function Footer() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const PARALLAX_SPEED = 1.3;

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const distanceToBottom = Math.max(0, docHeight - scrollBottom);

      parallaxRef.current.style.transform = `translateY(${distanceToBottom * PARALLAX_SPEED}px)`;
    };

    lenis.on("scroll", handleScroll);
    handleScroll();

    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

  return (
    <footer className="relative overflow-clip bg-blue-500 pt-12 pb-[88px] xl:pt-14 xl:pb-8">
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-visible mix-blend-multiply"
        style={{
          isolation: "isolate",
        }}
      >
        <img loading="lazy" decoding="async"
          src="/assets/footer/footer-clove-pattern.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 bottom-[-548px] h-[1879px] w-[2568px] max-w-none -translate-x-[calc(50%+300px)]"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col gap-10 px-4 xl:w-[1280px] xl:max-w-none xl:gap-16 xl:px-0">
        {/* Logo + socials — stacked & centered on mobile, split row on desktop. */}
        <div className="flex flex-col items-center gap-10 xl:flex-row xl:justify-between xl:gap-0">
          <img loading="lazy" decoding="async"
            src="/assets/cycle1/bca-logo.svg"
            alt="BCA"
            className="h-10 w-[127.5px] xl:h-14 xl:w-[178.5px]"
          />
          {/* 2×2 grid on mobile (aligned columns), inline row on desktop. */}
          <div className="grid w-fit grid-cols-2 gap-x-8 gap-y-4 xl:flex xl:w-auto xl:items-start xl:gap-8">
            {SOCIAL_LINKS.map((social) => (
              <ContactRow key={social.label} icon={social.icon} label={social.label} />
            ))}
          </div>
        </div>

        {/* Company info + link columns — stacked & centered on mobile, split row on desktop. */}
        <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-start xl:justify-between xl:gap-0">
          <div className="flex flex-col items-center gap-6 xl:items-start xl:gap-8">
            <div className="flex flex-col items-center gap-2 xl:items-start">
              <p className="w-[222px] text-center text-base font-semibold text-white xl:text-left">
                Kantor Pusat
              </p>
              <p className="w-[222px] text-center text-sm leading-5 text-white/70 xl:text-left">
                Menara BCA, Grand Indonesia,
                <br />
                Jl. MH Thamrin No. 1
                <br />
                Jakarta 10310
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 xl:items-start xl:gap-3">
              <ContactRow icon="/assets/footer/outline-phone.svg" label="Halo BCA 1500998" />
              <ContactRow icon="/assets/footer/outline-envelope.svg" label="halobca@bca.co.id" />
              <ContactRow icon="/assets/footer/outline-whatsapp.svg" label="62 811-1500-998" />
            </div>
          </div>

          {/* Wraps 2-up (Produk drops centered onto a 2nd row) on mobile; inline on desktop. */}
          <div className="flex flex-wrap justify-center gap-10 text-center text-white xl:flex-nowrap xl:justify-start xl:gap-8 xl:text-left">
            {FOOTER_LINK_COLUMNS.map((column) => (
              <div
                key={column.heading}
                className="flex w-[120px] flex-col items-center gap-6 xl:w-[200px] xl:items-start xl:gap-10"
              >
                <p className="text-xs font-semibold uppercase tracking-[1.8px]">{column.heading}</p>
                <div className="flex flex-col items-center gap-4 xl:items-start xl:gap-6">
                  {column.links.map((link) => (
                    <button
                      key={link}
                      className="text-center text-sm text-white/70 transition-colors hover:text-white xl:text-left"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom links / legal / copyright.
            Mobile stacks: links → legal → copyright (centered).
            Desktop: left column (links over copyright) + right column (legal). */}
        <div className="flex flex-col items-center gap-6 xl:flex-row xl:items-start xl:justify-between xl:gap-0">
          <div className="flex w-full flex-col items-center gap-6 xl:w-auto xl:items-start">
            <div className="flex flex-wrap items-center justify-center gap-6 xl:flex-nowrap xl:justify-start">
              {FOOTER_BOTTOM_LINKS.map((link) => (
                <button
                  key={link}
                  className="whitespace-nowrap text-sm font-semibold text-white transition-colors hover:text-white/80"
                >
                  {link}
                </button>
              ))}
            </div>
            {/* Desktop copyright — lives under the links; mobile shows its own copy last. */}
            <p className="hidden w-[445px] text-xs leading-[18px] text-white/60 xl:block">
              {COPYRIGHT}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-3 px-6 text-center text-xs text-white/60 xl:w-[545px] xl:items-end xl:px-0 xl:text-right">
            <p className="leading-tight xl:whitespace-nowrap">
              BCA berizin dan diawasi oleh Otoritas Jasa Keuangan &amp; Bank Indonesia
            </p>
            <p className="leading-[1.5]">
              BCA merupakan peserta penjaminan LPS. Maksimum nilai simpanan yang dijamin LPS per Nasabah per Bank
              adalah Rp2 miliar. Untuk cek Tingkat Bunga Penjaminan LPS, klik{" "}
              <a
                href="https://apps.lps.go.id/BankPesertaLPSRate"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                di sini
              </a>
            </p>
          </div>

          {/* Mobile copyright — last line, centered. Hidden on desktop. */}
          <p className="w-[280px] text-center text-xs leading-[18px] text-white/60 xl:hidden">
            {COPYRIGHT}
          </p>
        </div>
      </div>
    </footer>
  );
}