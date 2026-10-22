import type { LogoutResponse } from "@/types";

export function logoutDestination(response: LogoutResponse | null, apiBaseUrl: string): string {
  if (!response?.centralLogoutRequired) return "/login";
  return `${apiBaseUrl.replace(/\/$/, "")}/auth/sso/logout`;
}
