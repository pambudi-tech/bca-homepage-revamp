/** Keys into the `footer.linkColumns` translation namespace, in display order. */
export const FOOTER_LINK_COLUMN_KEYS = ["Tentang BCA", "Layanan", "Wawasan"] as const;

export type SocialLink = {
  label: string;
  icon: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Goodlife BCA", icon: "/assets/footer/fb.svg", href: "http://www.facebook.com/GoodLifeBCA" },
  { label: "@goodlifebca", icon: "/assets/footer/ig.svg", href: "https://www.instagram.com/goodlifeBCA/" },
  { label: "Solusi BCA", icon: "/assets/footer/ytube.svg", href: "https://www.youtube.com/solusiBCA" },
  { label: "@BankBCA", icon: "/assets/footer/x.svg", href: "https://twitter.com/BankBCA" },
];

export const ALL_SOCIAL_MEDIA_LINK = {
  href: "https://www.bca.co.id/id/tentang-bca/media-riset/Social-Media",
};

export const FOOTER_LINK_HREFS: Record<(typeof FOOTER_LINK_COLUMN_KEYS)[number], (string | null)[]> = {
  "Tentang BCA": [null, null, null, null],
  Layanan: [null, "https://www.bca.co.id/id/individu/layanan/customer-service", null, "https://www.bca.co.id/id/individu/layanan/jaringan-cabang"],
  Wawasan: [null, null, null, null],
};

export const BOTTOM_LINK_HREFS = [
  "https://www.bca.co.id/id/informasi/Suku-Bunga-Dasar-Kredit",
  "https://www.bca.co.id/id/informasi/Kebijakan",
  "https://www.bca.co.id/id/Syarat-dan-Ketentuan",
] as const;
