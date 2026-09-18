"use client";

import { useEffect, useRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const APP_STORE_URL = "https://apps.apple.com/id/app/mybca-new-bca-banking-apps/id1440241902";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?gl=ID&id=com.bca.mybca.omni.android";
const MYBCA_WEB_URL = "https://mybca.bca.co.id/auth/login";
const IOS_APP_URL = "mybca://";
const ANDROID_APP_URL = `intent://open/#Intent;scheme=mybca;package=com.bca.mybca.omni.android;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;

type MyBcaLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
};

function getPlatform() {
  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/i.test(userAgent)) return "ios";
  return "other";
}

function tryIosApp(url: string) {
  // Using an invisible iframe keeps Safari on the current page when the app is
  // not installed; assigning the custom scheme to window.location shows an
  // "address is invalid" error before the fallback can run.
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.display = "none";
  frame.src = url;
  document.body.appendChild(frame);
  window.setTimeout(() => frame.remove(), 2_000);
}

/** Opens myBCA on mobile, then takes a visitor without it to the official store. */
export function ApplyInMyBcaLink({ children, onClick, ...props }: MyBcaLinkProps) {
  const fallbackTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
  }, []);

  const clearFallback = () => {
    if (fallbackTimer.current !== null) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  };

  return (
    <a
      {...props}
      href={MYBCA_WEB_URL}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const platform = getPlatform();
        if (platform === "other") return;

        event.preventDefault();
        if (platform === "android") {
          window.location.assign(ANDROID_APP_URL);
          return;
        }

        // iOS custom schemes do not expose an installed-app result to the browser.
        // Cancel the store fallback as soon as the browser loses visibility for myBCA.
        const onVisibilityChange = () => {
          if (document.visibilityState === "hidden") clearFallback();
        };
        document.addEventListener("visibilitychange", onVisibilityChange, { once: true });
        tryIosApp(IOS_APP_URL);
        fallbackTimer.current = window.setTimeout(() => {
          document.removeEventListener("visibilitychange", onVisibilityChange);
          window.location.assign(APP_STORE_URL);
        }, 1_200);
      }}
    >
      {children}
    </a>
  );
}

/** Sends a mobile visitor to the matching official myBCA store listing. */
export function DownloadMyBcaLink({ children, onClick, ...props }: MyBcaLinkProps) {
  return (
    <a
      {...props}
      href={PLAY_STORE_URL}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const platform = getPlatform();
        if (platform === "ios") {
          event.preventDefault();
          window.location.assign(APP_STORE_URL);
        }
      }}
    >
      {children}
    </a>
  );
}
