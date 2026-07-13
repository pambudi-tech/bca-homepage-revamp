export type FooterLinkColumn = {
  heading: string;
  links: string[];
};

export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    heading: "Tentang BCA",
    links: ["Profil Perusahaan", "Karir di BCA", "Berita & Siaran Pers", "Penghargaan"],
  },
  {
    heading: "Layanan",
    links: ["Lokasi Cabang & ATM", "Pusat Bantuan", "Promo", "Simulasi & Kalkulator"],
  },
  {
    heading: "Produk",
    links: ["myBCA", "Kartu Kredit", "Pinjaman", "Kredit Usaha"],
  },
];

export const FOOTER_BOTTOM_LINKS = ["SBDK", "Lokasi BCA", "Pusat Bantuan", "Kebijakan Privasi", "Syarat & Ketentuan"];

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
