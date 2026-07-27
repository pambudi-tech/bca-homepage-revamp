/**
 * Shared between the desktop and mobile hero widgets: the two design phases
 * (see LayoutSwitcher on each) and the four login destinations the "initial"
 * phase's Login Cepat panel offers.
 */
export const HERO_VARIANTS = ["final", "initial"] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type LoginDestination = {
  label: string;
  icon: string;
  href: string;
  iconClass: string;
  /** Shown in the info panel above the card on hover — always rendered in
      the markup (just hidden with opacity/pointer-events) so search engines
      crawl it the same as any other on-page copy, not only sighted hover. */
  description: string;
};

/** Left → right / row-major order, as in the design. */
export const LOGIN_DESTINATIONS: LoginDestination[] = [
  {
    label: "myBCA",
    icon: "/assets/quick-action/mybca-logo.svg",
    href: "https://mybca.bca.co.id/auth/login",
    iconClass: "size-10",
    description: "Akses myBCA versi web untuk mudahnya transaksi harian",
  },
  {
    label: "myBCA Bisnis",
    icon: "/assets/quick-action/mybca-bisnis-logo.svg",
    href: "https://mybca.bca.co.id/auth/login",
    iconClass: "size-10",
    description: "Kelola beragam transaksi finansial bisnis kini makin mudah",
  },
  {
    label: "KlikBCA",
    icon: "/assets/quick-action/klikbca-logo.png",
    href: "https://ibank.klikbca.com/",
    iconClass: "h-10 w-auto",
    description: "Internet banking untuk kebutuhan transaksi individu",
  },
  {
    label: "KlikBCA Bisnis",
    icon: "/assets/quick-action/klikbca-bisnis-logo.webp",
    href: "https://bisnis.klikbca.com/",
    iconClass: "h-10 w-auto",
    description: "Internet banking untuk kebutuhan transaksi bisnis",
  },
];
