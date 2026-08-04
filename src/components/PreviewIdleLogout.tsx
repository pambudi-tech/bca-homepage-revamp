"use client";

import { useEffect } from "react";
import {
  loginPathForRequest,
  PREVIEW_IDLE_TIMEOUT_MS,
} from "@/lib/preview-auth";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/** Ends the preview session after a period with no user activity. */
export default function PreviewIdleLogout() {
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/login" || /^(\/[^/]+)?\/login$/.test(pathname)) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let loggingOut = false;

    const logout = async () => {
      if (loggingOut) return;
      loggingOut = true;
      try {
        await fetch("/api/preview-logout", { method: "POST", credentials: "same-origin" });
      } finally {
        window.location.assign(loginPathForRequest(window.location.pathname));
      }
    };

    const arm = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => void logout(), PREVIEW_IDLE_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, arm, { passive: true }));
    arm();

    return () => {
      clearTimeout(timeout);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, arm));
    };
  }, []);

  return null;
}
