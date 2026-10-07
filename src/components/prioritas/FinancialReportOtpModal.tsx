"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import { prioritasButtonClassName, solitaireButtonClassName } from "@/components/prioritas/PrioritasButton";

type Step = "request" | "verify" | "noPhone";

export default function FinancialReportOtpModal({ onClose, onVerified, phoneNumbers = ["0812•••••925"], solitaire = false }: {
  onClose: () => void;
  onVerified: (code: string) => Promise<number | null>;
  phoneNumbers?: string[];
  solitaire?: boolean;
}) {
  const t = useTranslations("memberFinancialReport.visibility");
  const [step, setStep] = useState<Step>(phoneNumbers.length ? "request" : "noPhone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [seconds, setSeconds] = useState(119);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (step !== "verify" || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  useEffect(() => {
    if (step === "verify") codeRef.current?.focus();
  }, [step]);

  const requestCode = () => {
    if (!phone) { setError(true); return; }
    setError(false);
    setCode("");
    setSeconds(119);
    setStep("verify");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/65 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="financial-otp-title" tabIndex={-1} className={`relative w-full max-w-96 rounded-xl bg-white px-6 text-center text-neutral-800 shadow-card outline-none ${step === "noPhone" ? "py-6" : "py-8"}`}>
        {step !== "noPhone" ? <>
          <button type="button" onClick={onClose} aria-label={t("close")} className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-pgold-500"><span aria-hidden className="text-2xl leading-none">×</span></button>
          <img src="/assets/prioritas/financial-report/otp-email.svg" alt="" aria-hidden className={`mx-auto mb-5 size-16 ${solitaire ? "grayscale" : ""}`} />
        </> : null}
        <h2 id="financial-otp-title" className="text-xl font-semibold leading-7 text-neutral-900">{t(`${step}.title`)}</h2>
        <p className="mx-auto mt-2 max-w-[310px] text-sm leading-5 text-neutral-700">{step === "verify" ? t("verify.description", { phone }) : t(`${step}.description`)}</p>

        {step === "request" ? <>
          <div className="mt-7 text-left">
            <PrioritasDirectoryDropdown id="financial-otp-phone" label={t("request.phoneLabel")} value={phone} placeholder={t("request.phonePlaceholder")} onChange={(value) => { setPhone(value); setError(false); }} options={phoneNumbers.map((number) => ({ value: number, label: number }))} size="medium" xlSize="large" tone={solitaire ? "solitaire" : "prioritas"} />
            {error ? <p role="alert" className="mt-2 text-sm text-red-600">{t("request.phoneRequired")}</p> : null}
          </div>
          <div role="note" className="mt-5 flex items-start gap-3 rounded-xl bg-blue-200 p-4 text-left text-sm leading-5 text-blue-600">
            <img src="/assets/member-login/info.svg" alt="" aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{t("request.feeNotice")}</span>
          </div>
          <button type="button" onClick={requestCode} className={(solitaire ? solitaireButtonClassName : prioritasButtonClassName)({ size: "large", className: "mt-6 w-full" })}><span className="prio-button__label">{t("request.send")}</span></button>
        </> : null}

        {step === "verify" ? <>
          <div className="relative mt-8" onClick={() => codeRef.current?.focus()}>
            <div aria-hidden className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }, (_, index) => {
                const hasDigit = code[index] !== undefined;
                return <span key={index} className={`flex h-14 items-center justify-center rounded-xl border bg-neutral-200 text-2xl ${error ? "border-red-600" : codeVerified ? "border-green-600" : "border-neutral-300"} ${hasDigit ? "text-neutral-800" : "text-neutral-600"}`}>{code[index] ?? "0"}</span>;
              })}
            </div>
            <input ref={codeRef} value={code} disabled={submitting} aria-invalid={error} aria-describedby={error ? "financial-otp-error" : undefined} onChange={async (event) => {
              const next = event.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(next);
              setCodeVerified(false);
              setError(false);
              if (next.length === 6 && !submitting) {
                setSubmitting(true);
                setError(false);
                const expiresAt = await onVerified(next);
                if (expiresAt) {
                  setCodeVerified(true);
                  window.setTimeout(onClose, 700);
                }
                else { setSubmitting(false); setError(true); }
              }
            }} inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label={t("verify.codeLabel")} className="absolute inset-0 h-full w-full cursor-text opacity-0" />
          </div>
          {error ? <p id="financial-otp-error" role="alert" className="mt-3 text-sm font-medium text-red-600">{t("verify.invalidCode")}</p> : null}
          <p className="mt-6 text-sm font-semibold text-neutral-800">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</p>
          <button type="button" disabled={seconds > 0} onClick={() => { setCode(""); setSeconds(119); codeRef.current?.focus(); }} className="mt-1 text-sm font-semibold text-pbrown-600 disabled:text-neutral-500">{t("verify.resend")}</button>
        </> : null}

        {step === "noPhone" ? <button type="button" onClick={onClose} className={(solitaire ? solitaireButtonClassName : prioritasButtonClassName)({ variant: "secondary", size: "large", className: "mt-8 w-full" })}><span className="prio-button__label">{t("noPhone.back")}</span></button> : null}
      </div>
    </div>,
    document.body,
  );
}
