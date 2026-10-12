"use client";
import { createContext } from "react";
export const PreviewViewportContext = createContext<number | null>(null);

export const PreviewFrozenContext = createContext(false);

// Initial states for the real navigation controls inside inert documentation.
// Normal routes have no provider and keep their usual closed state.
export const PreviewNavigationContext = createContext<{
  languageOpen?: boolean;
  mobileMenuOpen?: boolean;
  accountMenuOpen?: boolean;
  memberArea?: boolean;
} | null>(null);
