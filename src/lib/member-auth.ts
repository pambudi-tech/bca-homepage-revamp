import { routing } from "@/i18n/routing";

export const MEMBER_SESSION_COOKIE = "bca-member-demo";
export const MEMBER_SESSION_VALUE = "authenticated";
export const MEMBER_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const PORTFOLIO_VIEW_SESSION_COOKIE = "bca-portfolio-view";
export const PORTFOLIO_VIEW_SESSION_MAX_AGE_SECONDS = 10 * 60;

export function getPortfolioViewSessionExpiry(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;

  const expiresAt = Number(value);
  return Number.isSafeInteger(expiresAt) && expiresAt > Date.now() ? expiresAt : null;
}

export function isMemberAreaPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const pathSegments = routing.locales.includes(firstSegment as (typeof routing.locales)[number])
    ? segments.slice(1)
    : segments;

  const isPrioritasMemberRoute = pathSegments[0] === "prioritas" && pathSegments[1] === "member";
  // These legacy overview URLs render the same member pages as /prioritas/member/*.
  const isLegacyMemberOverviewRoute = pathSegments[0] === "prioritas" && pathSegments[1] === "overview";

  return isPrioritasMemberRoute || isLegacyMemberOverviewRoute;
}

export function isSafeMemberRedirect(pathname: string | undefined): pathname is string {
  return typeof pathname === "string" && /^\/prioritas\/(?:member|overview)(?:\/|$)/.test(pathname);
}
