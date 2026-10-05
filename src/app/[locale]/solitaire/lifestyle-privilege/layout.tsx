import type { ReactNode } from "react";
import SolitaireDirectoryLayout from "@/components/solitaire/SolitaireDirectoryLayout";

export default function SolitaireLifestylePrivilegeLayout({ children }: { children: ReactNode }) {
  return <SolitaireDirectoryLayout>{children}</SolitaireDirectoryLayout>;
}
