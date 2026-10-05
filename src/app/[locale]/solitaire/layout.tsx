import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: "/solitaire-icon.svg",
  },
};

export default function SolitaireLayout({ children }: { children: ReactNode }) {
  return children;
}
