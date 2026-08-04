"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, type LoginState } from "./actions";

const PASSWORD_FIELD_ID = "preview-password";
const PASSWORD_ERROR_ID = "preview-password-error";
const SUCCESS_TOAST_DELAY_MS = 900;

type LoginFormProps = {
  redirectTo: string;
  heading: string;
  subheading: string;
  passwordPlaceholder: string;
  wrongPassword: string;
  successMessage: string;
  submit: string;
};

export default function LoginForm({
  redirectTo,
  heading,
  subheading,
  passwordPlaceholder,
  wrongPassword,
  successMessage,
  submit,
}: LoginFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, "idle");

  useEffect(() => {
    if (state !== "success") return;

    const timeout = window.setTimeout(() => router.replace(redirectTo), SUCCESS_TOAST_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [redirectTo, router, state]);

  const hasError = state === "error";
  const isSuccessful = state === "success";

  return (
    <>
      <form
        action={formAction}
        className="w-full max-w-[360px] rounded-2xl border border-neutral-300 bg-white p-8 shadow-card"
      >
        <h1 className="text-heading text-neutral-900">{heading}</h1>
        <p className="mt-2 text-sm text-neutral-700">{subheading}</p>

        <input
          id={PASSWORD_FIELD_ID}
          type="password"
          name="password"
          placeholder={passwordPlaceholder}
          autoFocus
          required
          disabled={isSuccessful}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? PASSWORD_ERROR_ID : undefined}
          className={`mt-6 h-12 w-full rounded-xl border bg-neutral-200 px-3.5 text-sm leading-5 text-neutral-700 outline-none transition-colors placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60 ${
            hasError ? "border-red-500" : "border-neutral-300 focus:border-cyan-500"
          }`}
        />

        {hasError && (
          <p id={PASSWORD_ERROR_ID} role="alert" className="mt-2 text-sm text-red-500">
            {wrongPassword}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || isSuccessful}
          className="btn-base btn-primary mt-6 w-full font-semibold disabled:cursor-wait disabled:opacity-60"
        >
          {submit}
        </button>
      </form>

      {isSuccessful && (
        <div className="pointer-events-none fixed inset-x-4 top-6 z-[110] flex justify-center">
          <p
            role="status"
            aria-live="polite"
            className="login-success-toast rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-neutral-100 shadow-panel"
          >
            {successMessage}
          </p>
        </div>
      )}
    </>
  );
}
