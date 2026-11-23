import type { LogoutResponse } from "@/types";
import { safeReturnPath } from "./returnPath.ts";

export function logoutDestination(
  response: LogoutResponse | null,
  apiBaseUrl: string,
  returnTo?: string,
): string {
  if (!response?.centralLogoutRequired) return "/login";
  const base = `${apiBaseUrl.replace(/\/$/, "")}/auth/sso/logout`;
  const safe = safeReturnPath(returnTo);
  return safe ? `${base}?cancel_return=${encodeURIComponent(safe)}` : base;
}
