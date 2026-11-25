import { createElement, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { env } from "@/lib/env";

const SCRIPT_ID = "bp3kp-app-switcher-script";

function resolveDefaultSsoBaseUrl(): string {
  const configured = String(import.meta.env.VITE_SSO_BASE_URL ?? "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.hostname.endsWith("bp3kpsumatera2.com")) {
    return "https://sso.bp3kpsumatera2.com";
  }
  return "http://localhost:8082";
}

function resolveAppsEndpoint(): string {
  const rawApi = String(env.apiBaseUrl ?? "").trim().replace(/\/+$/, "");
  if (!rawApi) return "/api/auth/apps";
  return `${rawApi}/auth/apps`;
}

export function AppLauncher({
  ssoBaseUrl,
  currentApp = "silapet",
  align = "right",
  className,
}: {
  ssoBaseUrl?: string;
  currentApp?: string;
  align?: "left" | "right";
  className?: string;
}) {
  const { isAuthed } = useAuth();
  const cleanBase = (ssoBaseUrl ? ssoBaseUrl.trim() : resolveDefaultSsoBaseUrl()).replace(/\/+$/, "");
  const appsEndpoint = resolveAppsEndpoint();

  useEffect(() => {
    if (!isAuthed) return;
    if (typeof window === "undefined" || !window.customElements) return;
    if (window.customElements.get("bp3kp-app-switcher")) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${cleanBase}/widget/app-switcher.js`;
    script.defer = true;
    document.head.appendChild(script);
  }, [cleanBase, isAuthed]);

  if (!isAuthed) return null;

  return createElement("bp3kp-app-switcher", {
    "sso-url": cleanBase,
    "current-app": currentApp,
    "apps-endpoint": appsEndpoint,
    align,
    ...(className ? { class: className } : {}),
  });
}
