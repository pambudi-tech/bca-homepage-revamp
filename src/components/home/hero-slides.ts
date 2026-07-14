export type SlideCta = {
  label: string;
  icon: string;
  variant: "primary" | "secondary";
};
export type Slide = { image: string; alt: string; title: string; cta: SlideCta };

export const SLIDES: Slide[] = [
  {
    image: "/assets/cycle1/hero-image.webp",
    alt: "Keluarga BCA",
    title: "Capai Kebebasan Finansial Lebih Dini bersama BCA",
    cta: { label: "Download myBCA", icon: "/assets/cycle1/download-icon.svg", variant: "primary" },
  },
  {
    image: "/assets/cycle1/hero-banner.webp",
    alt: "BCA Presale The Weeknd",
    title: 'BCA Presale : The Weeknd "After Hour Til Down Tour" - Jakarta',
    cta: { label: "Dapatkan Tiket", icon: "/assets/cycle1/download-icon.svg", variant: "secondary" },
  },
  {
    image: "/assets/cycle1/hero-banner-jrf.webp",
    alt: "Terus Nabung buat Kejar Tiket myBCA JRF 2026",
    title: "Terus Nabung buat Kejar Tiket myBCA JRF 2026!",
    cta: { label: "Pelajari Lebih Lanjut", icon: "/assets/cycle1/download-icon.svg", variant: "secondary" },
  },
];

export const SLIDES_COUNT = SLIDES.length;
export const SLIDE_DURATION_MS = 8000;
