import type { Metadata } from "next";
import type { ReactNode } from "react";
import PrioritasDirectoryLayout from "@/components/prioritas/PrioritasDirectoryLayout";

export const metadata: Metadata = {
  icons: {
    icon: "/prioritas-icon.svg",
  },
};

export default function PrioritasLayout({ children }: { children: ReactNode }) {
  return <PrioritasDirectoryLayout>{children}</PrioritasDirectoryLayout>;
}
