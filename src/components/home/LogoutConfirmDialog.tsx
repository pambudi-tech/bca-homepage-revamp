"use client";

import { useTranslations } from "next-intl";

export default function LogoutConfirmDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const t = useTranslations("accountMenu");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-900/50 px-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title" aria-describedby="logout-confirm-description" className="w-full max-w-[400px] rounded-2xl bg-white p-6 text-neutral-800 shadow-card">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg aria-hidden viewBox="0 0 32 32" fill="none" className="size-6"><path d="M11.867 10.08c.413-4.8 2.88-6.76 8.28-6.76h.173c5.96 0 8.347 2.387 8.347 8.347v8.693c0 5.96-2.387 8.347-8.347 8.347h-.173c-5.36 0-7.827-1.934-8.267-6.654" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" /><path d="M2.667 16H19.84m-2.973-4.467L21.333 16l-4.466 4.467" stroke="currentColor" strokeWidth="2.18" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 id="logout-confirm-title" className="text-lg font-semibold">{t("confirmTitle")}</h2>
        <p id="logout-confirm-description" className="mt-2 text-sm leading-5 text-neutral-600">{t("confirmMessage")}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-11 rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 hover:bg-neutral-100">{t("cancel")}</button>
          <button type="button" onClick={onConfirm} className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">{t("logout")}</button>
        </div>
      </section>
    </div>
  );
}
