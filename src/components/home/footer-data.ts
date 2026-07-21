/** Keys into the `footer.linkColumns` translation namespace, in display order. */
export const FOOTER_LINK_COLUMN_KEYS = ["Tentang BCA", "Layanan", "Produk"] as const;

export type SocialLink = {
  label: string;
  icon: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Goodlife BCA", icon: "/assets/footer/fb.svg" },
  { label: "@goodlifebca", icon: "/assets/footer/ig.svg" },
  { label: "Solusi BCA", icon: "/assets/footer/ytube.svg" },
  { label: "@BankBCA", icon: "/assets/footer/x.svg" },
];
