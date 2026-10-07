"use client";

import { useTranslations } from "next-intl";
import { PrioritasButton } from "../prioritas/PrioritasButton";

export default function LogoutConfirmDialog({ open, onCancel, onConfirm, tone = "prioritas" }: { open: boolean; onCancel: () => void; onConfirm: () => void; tone?: "prioritas" | "solitaire" }) {
  const t = useTranslations("accountMenu");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-900/50 px-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title" aria-describedby="logout-confirm-description" className="w-full max-w-[400px] rounded-xl bg-white px-6 pb-6 pt-8 text-center text-neutral-800 shadow-card">
        <h2 id="logout-confirm-title" className="text-title font-bold">{t("confirmTitle")}</h2>
        <p id="logout-confirm-description" className="mt-2 text-sm leading-5 text-neutral-700">{t("confirmMessage")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <PrioritasButton tone={tone} variant="danger" size="large" className="w-full" onClick={onConfirm}>{t("confirmLogout")}</PrioritasButton>
          <PrioritasButton tone={tone} variant="secondary" size="large" className="w-full" onClick={onCancel}>{t("cancel")}</PrioritasButton>
        </div>
      </section>
    </div>
  );
}
