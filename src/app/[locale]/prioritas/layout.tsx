import type { ReactNode } from "react";
import PrioritasDirectoryLayout from "@/components/prioritas/PrioritasDirectoryLayout";

export default function PrioritasLayout({ children }: { children: ReactNode }) {
  return <PrioritasDirectoryLayout>{children}</PrioritasDirectoryLayout>;
}
