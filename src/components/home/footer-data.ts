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

/** Hrefs for `footer.linkColumns` entries, keyed by column key then aligned by link index (same order in every locale). */
export const LINK_COLUMN_HREFS: Record<string, (string | null)[]> = {
  "Tentang BCA": [null, null, null, null],
  Layanan: [null, "https://www.bca.co.id/id/individu/layanan/customer-service", null, "https://www.bca.co.id/id/individu/layanan/jaringan-cabang"],
  Wawasan: [null, null, null, null],
};

/** Hrefs for `footer.bottomLinks`, aligned by index (same order in every locale). `null` = no link yet. */
export const BOTTOM_LINK_HREFS: (string | null)[] = [
  "https://www.bca.co.id/id/informasi/Suku-Bunga-Dasar-Kredit",
  "https://www.bca.co.id/id/informasi/Kebijakan",
  "https://www.bca.co.id/id/Syarat-dan-Ketentuan",
];
