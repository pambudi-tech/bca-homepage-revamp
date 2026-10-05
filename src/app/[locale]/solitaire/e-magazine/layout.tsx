import type { ReactNode } from "react";
import SolitaireDirectoryLayout from "@/components/solitaire/SolitaireDirectoryLayout";

export default function SolitaireMagazineLayout({ children }: { children: ReactNode }) {
  return <SolitaireDirectoryLayout>{children}</SolitaireDirectoryLayout>;
}
