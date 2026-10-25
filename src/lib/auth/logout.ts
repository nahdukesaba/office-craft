import type { LogoutResponse } from "@/types";

export function logoutDestination(
  response: LogoutResponse | null,
  apiBaseUrl: string,
  returnTo?: string,
): string {
  if (!response?.centralLogoutRequired) return "/login";
  const base = `${apiBaseUrl.replace(/\/$/, "")}/auth/sso/logout`;
  if (
    returnTo &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.startsWith("/\\") &&
    !returnTo.includes("\\") &&
    !returnTo.includes("#")
  ) {
    return `${base}?cancel_return=${encodeURIComponent(returnTo)}`;
  }
  return base;
}
