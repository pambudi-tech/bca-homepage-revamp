"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import InfoTip from "@/components/ui/InfoTip";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import TextField from "@/components/ui/TextField";
import { loginMember, type MemberLoginState } from "@/app/[locale]/member/login/actions";
import "./member-login.css";

type LoginMethod = "bcaId" | "email";
type Brand = "prioritas" | "solitaire";

const TEXT_BUTTON_CLASS = "font-semibold text-blue-500 transition-colors hover:text-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500";
const TEXT_BUTTON_SMALL_CLASS = `${TEXT_BUTTON_CLASS} text-sm leading-5`;

function EyeIcon({ visible }: { visible: boolean }) {
  return <img aria-hidden src={`/assets/member-login/eye${visible ? "" : "-off"}.svg`} alt="" className="size-6" />;
}

function LoginAlert({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div role="alert" aria-hidden={!visible} className={`absolute bottom-[calc(100%+1rem)] left-1/2 z-10 flex min-h-14 w-fit max-w-full -translate-x-1/2 items-start gap-3 rounded-xl bg-red-100 p-4 text-sm leading-5 text-red-600 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:bottom-[calc(100%+2.5rem)] ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <img aria-hidden src="/assets/member-login/close.svg" alt="" className="size-6 shrink-0" />
      <span className="w-fit pt-0.5">{message}</span>
    </div>
  );
}

export default function MemberLoginExperience({ brand, magazineSlug, redirectTo }: { brand: Brand; magazineSlug?: string; redirectTo?: string }) {
  const t = useTranslations("memberLogin");
  const router = useRouter();
  const [loginState, formAction, pending] = useActionState<MemberLoginState, FormData>(loginMember, { status: "idle" });
  const [method, setMethod] = useState<LoginMethod>("bcaId");
  const [bcaId, setBcaId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showCredentialsError, setShowCredentialsError] = useState(false);
  const [notice, setNotice] = useState("");
  const backHref = `/${brand}`;
  const identifier = method === "bcaId" ? bcaId : email;
  const validIdentifier = method === "bcaId"
    ? identifier.trim().length >= 6 && identifier.trim().length <= 21
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const canSubmit = validIdentifier && password.length > 0;
  const identifierError = identifierTouched && identifier.length > 0 && !validIdentifier
    ? t(method === "bcaId" ? "bcaIdLengthError" : "emailFormatError")
    : undefined;

  function selectMethod(next: LoginMethod) {
    setMethod(next);
    setIdentifierTouched(false);
    setNotice("");
  }

  function handleBack(event: MouseEvent<HTMLAnchorElement>) {
    if (!document.referrer || window.history.length <= 1) return;

    try {
      const previousPage = new URL(document.referrer);
      const cameFromThisSite = previousPage.origin === window.location.origin;
      const cameFromLogin = /(?:^|\/)member\/login\/?$/.test(previousPage.pathname);

      if (cameFromThisSite && !cameFromLogin) {
        event.preventDefault();
        router.back();
      }
    } catch {
      // Keep the brand homepage link as a safe fallback for invalid referrers.
    }
  }

  useEffect(() => {
    if (loginState.status === "success" && loginState.brand) {
      const requestedPath = redirectTo && routing.locales.some((locale) => redirectTo.startsWith(`/${locale}/`))
        ? redirectTo.replace(/^\/[^/]+/, "")
        : redirectTo;
      const destination = requestedPath?.startsWith(`/${loginState.brand}/member/`) || requestedPath === `/${loginState.brand}/member`
        ? requestedPath
        : `/${loginState.brand}/member/overview`;
      router.replace(destination);
    }
  }, [loginState, redirectTo, router]);

  useEffect(() => {
    if (loginState.status !== "error" || pending) return;

    const showTimer = window.setTimeout(() => setShowCredentialsError(true), 0);
    const dismissTimer = window.setTimeout(() => setShowCredentialsError(false), 5000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [loginState, pending]);

  return (
    <main id="main-content" className="member-login relative isolate flex min-h-dvh flex-col overflow-hidden bg-neutral-200 text-neutral-800">
      <div aria-hidden className="member-login-light pointer-events-none absolute inset-0 -z-10" />

      <header className="member-login-header relative mx-auto grid w-full max-w-[1512px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 lg:px-10 lg:py-10">
        <Link href={backHref} onClick={handleBack} className={`member-login-back inline-flex w-fit items-center gap-2 text-sm leading-5 ${TEXT_BUTTON_CLASS}`}>
          <img aria-hidden src="/assets/member-login/arrow-left.svg" alt="" className="size-5" /> <span>{t("backHome")}</span>
        </Link>
        <div className="member-login-brands flex items-center justify-center gap-5 sm:gap-8" aria-label={t("brandsLabel")}>
          <img src="/assets/soliprio/solitaire-logo.svg" alt="BCA Solitaire" className="member-login-solitaire h-11 w-auto" />
          <img src="/assets/prioritas/logo.svg" alt="BCA Prioritas" className="h-11 w-auto" />
        </div>
        <div className="member-login-language justify-self-end">
          <LocaleSwitcher label={t("language")} appearance="surface" onLocaleChange={(code: AppLocale) => {
            const query = new URLSearchParams({ from: brand });
            if (magazineSlug) query.set("magazine", magazineSlug);
            if (redirectTo) query.set("redirectTo", redirectTo);
            window.location.href = `/${code}/member/login?${query}`;
          }} />
        </div>
      </header>

      <div className="member-login-center flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="relative flex w-full flex-col items-center">
          {loginState.status === "error" ? <LoginAlert message={t("credentialsError")} visible={showCredentialsError} /> : null}
        <section className="member-login-card w-full max-w-[392px] rounded-xl border border-neutral-300/70 bg-white p-4 pb-6 shadow-card sm:p-7" aria-label={t("pageTitle")}>
          <h1 className="sr-only">{t("pageTitle")}</h1>
          <div role="tablist" aria-label={t("methodLabel")} className="relative grid h-12 grid-cols-2 rounded-xl border border-neutral-300 bg-neutral-200 p-1">
            <span aria-hidden className={`pointer-events-none absolute bottom-1 left-1 top-1 z-0 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-emphasis motion-reduce:transition-none ${method === "email" ? "translate-x-full" : "translate-x-0"}`} />
            <button type="button" role="tab" aria-selected={method === "bcaId"} onClick={() => selectMethod("bcaId")} className={`relative z-10 h-full rounded-lg text-base font-semibold leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${method === "bcaId" ? "text-neutral-900" : "text-neutral-700 hover:text-blue-500"}`}>{t("bcaId")}</button>
            <button type="button" role="tab" aria-selected={method === "email"} onClick={() => selectMethod("email")} className={`relative z-10 h-full rounded-lg text-base font-semibold leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${method === "email" ? "text-neutral-900" : "text-neutral-700 hover:text-blue-500"}`}>{t("email")}</button>
          </div>

          <p className="mt-6 text-sm leading-5 text-neutral-700">{t("intro")}</p>
          <form action={formAction} onSubmit={() => setShowCredentialsError(false)} className="mt-6">
            <TextField
              key={method}
              fieldSize="medium"
              label={t(method)}
              labelAdornment={method === "bcaId" ? <InfoTip label={t("bcaIdHelpLabel")} message={t("bcaIdHelp")} /> : undefined}
              type={method === "email" ? "email" : "text"}
              name="identifier"
              autoComplete={method === "email" ? "email" : "username"}
              required
              maxLength={method === "bcaId" ? 21 : undefined}
              value={identifier}
              error={identifierError}
              onBlur={() => setIdentifierTouched(true)}
              onChange={(event) => {
                if (method === "bcaId") setBcaId(event.target.value);
                else setEmail(event.target.value);
                setNotice("");
              }}
              placeholder={t(method === "bcaId" ? "bcaIdPlaceholder" : "emailPlaceholder")}
            />

            <div className="mt-5">
              <TextField
                fieldSize="medium"
                label={t("password")}
                type={passwordVisible ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => { setPassword(event.target.value); setNotice(""); }}
                placeholder={t("passwordPlaceholder")}
                trailingAdornment={<button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={t(passwordVisible ? "hidePassword" : "showPassword")} className="inline-flex size-8 items-center justify-center rounded-full text-neutral-700 hover:text-blue-500 focus-visible:outline-2 focus-visible:outline-blue-500"><EyeIcon visible={passwordVisible} /></button>}
              />
            </div>
            <div className="mt-2 text-right"><button type="button" onClick={() => setNotice(t("prototypeNotice"))} className={TEXT_BUTTON_SMALL_CLASS}>{t("forgotPassword")}</button></div>
            <button type="submit" disabled={!canSubmit || pending} className="btn-base btn-primary mt-7 w-full font-semibold disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:hover:bg-neutral-300">{t("submit")}</button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm text-neutral-700">
            <p>{t("noAccount")} <button type="button" onClick={() => setNotice(t("prototypeNotice"))} className={TEXT_BUTTON_SMALL_CLASS}>{t(method === "email" ? "registerEmail" : "register")}</button></p>
            <p>{t("noBcaId")} <button type="button" onClick={() => setNotice(t("prototypeNotice"))} className={TEXT_BUTTON_SMALL_CLASS}>{t("tutorial")}</button></p>
          </div>
          {notice && <p role="status" className="mt-5 rounded-lg bg-blue-100 px-4 py-3 text-center text-sm leading-5 text-blue-700">{notice}</p>}
        </section>
        </div>
      </div>

    </main>
  );
}
