"use client";

import { useEffect, useRef } from "react";
import { FOOTER_BOTTOM_LINKS, FOOTER_LINK_COLUMNS, SOCIAL_LINKS } from "./footer-data";
import { useLenis } from "@/components/SmoothScroll";

function ContactRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <img src={icon} alt="" className="size-5 shrink-0" />
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
    <footer className="relative overflow-clip bg-[#005caa] pt-14 pb-8">
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-visible mix-blend-multiply"
        style={{
          isolation: "isolate",
        }}
      >
        <img
          src="/assets/footer/footer-clove-pattern.svg"
          alt=""
          aria-hidden
          className="absolute left-1/2 bottom-[-548px] h-[1879px] w-[2568px] max-w-none -translate-x-[calc(50%+300px)]"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-[1280px] flex-col gap-16">
        <div className="flex items-center justify-between">
          <img src="/assets/cycle1/bca-logo.svg" alt="BCA" className="h-14 w-[178.5px]" />
          <div className="flex items-start gap-8">
            {SOCIAL_LINKS.map((social) => (
              <ContactRow key={social.label} icon={social.icon} label={social.label} />
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col items-start gap-2">
              <p className="w-[222px] text-base font-semibold text-white">Kantor Pusat</p>
              <p className="w-[222px] text-sm leading-5 text-white/70">
                Menara BCA, Grand Indonesia,
                <br />
                Jl. MH Thamrin No. 1
                <br />
                Jakarta 10310
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <ContactRow icon="/assets/footer/outline-phone.svg" label="Halo BCA 1500998" />
              <ContactRow icon="/assets/footer/outline-envelope.svg" label="halobca@bca.co.id" />
              <ContactRow icon="/assets/footer/outline-whatsapp.svg" label="62 811-1500-998" />
            </div>
          </div>

          <div className="flex items-start gap-8 text-white">
            {FOOTER_LINK_COLUMNS.map((column) => (
              <div key={column.heading} className="flex w-[200px] flex-col items-start gap-10">
                <p className="text-xs font-semibold uppercase tracking-[1.8px]">{column.heading}</p>
                <div className="flex flex-col items-start gap-6">
                  {column.links.map((link) => (
                    <button
                      key={link}
                      className="text-left text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start gap-6">
            <div className="flex items-center gap-6">
              {FOOTER_BOTTOM_LINKS.map((link) => (
                <button
                  key={link}
                  className="whitespace-nowrap text-sm font-semibold text-white transition-colors hover:text-white/80"
                >
                  {link}
                </button>
              ))}
            </div>
            <p className="w-[445px] text-xs leading-[18px] text-white/60">
              Copyrights © 2026 PT Bank Central Asia Tbk, All Rights Reserved
            </p>
          </div>

          <div className="flex w-[545px] flex-col items-end gap-3 text-right text-xs text-white/60">
            <p className="whitespace-nowrap leading-tight">
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
        </div>
      </div>
    </footer>
  );
}