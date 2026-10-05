import type { ReactNode } from "react";
import SolitaireDirectoryLayout from "@/components/solitaire/SolitaireDirectoryLayout";

export default function SolitaireEventLayout({ children }: { children: ReactNode }) {
  return <SolitaireDirectoryLayout>{children}</SolitaireDirectoryLayout>;
}
