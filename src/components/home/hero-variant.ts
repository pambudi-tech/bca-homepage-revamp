/**
 * Shared between the desktop and mobile hero widgets: the two design phases
 * (see LayoutSwitcher on each) and the four login destinations the "initial"
 * phase's Login Cepat panel offers.
 */
export const HERO_VARIANTS = ["final", "initial"] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type LoginDestination = { label: string; icon: string; href: string; iconClass: string };

/** Left → right / row-major order, as in the design. */
export const LOGIN_DESTINATIONS: LoginDestination[] = [
  { label: "myBCA", icon: "/assets/quick-action/mybca-logo.svg", href: "https://mybca.bca.co.id/auth/login", iconClass: "size-10" },
  { label: "myBCA Bisnis", icon: "/assets/quick-action/mybca-bisnis-logo.svg", href: "https://mybca.bca.co.id/auth/login", iconClass: "size-10" },
  { label: "KlikBCA", icon: "/assets/quick-action/klikbca-logo.png", href: "https://ibank.klikbca.com/", iconClass: "h-10 w-auto" },
  { label: "KlikBCA Bisnis", icon: "/assets/quick-action/klikbca-bisnis-logo.webp", href: "https://bisnis.klikbca.com/", iconClass: "h-10 w-auto" },
];
