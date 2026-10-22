import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";
import { AuthLayout } from "@/layouts/AuthLayout";
import { isApiCode } from "@/lib/errors";
import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import type { AuthSession } from "@/types";

type CallbackSearch = {
  code?: string;
  state?: string;
  status?: "pending" | "denied";
};

export const Route = createFileRoute("/auth/sso/callback")({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    status: search.status === "pending" || search.status === "denied" ? search.status : undefined,
  }),
  head: () => ({ meta: [{ title: "SSO Balai · SILAPET" }] }),
  component: BrowserSSOCallbackPage,
});

function isAuthSession(value: unknown): value is AuthSession {
  return (
    !!value &&
    typeof value === "object" &&
    "token" in value &&
    "refreshToken" in value &&
    "user" in value
  );
}

function BrowserSSOCallbackPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const t = useT();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const { code, state, status } = search;
    window.history.replaceState({}, document.title, window.location.pathname);

    if (!state || (!code && !status)) {
      setError(t("auth.ssoFailed"));
      return;
    }

    void authApi
      .exchangeBrowserSSO({ code, state, status })
      .then((result) => {
        if (!isAuthSession(result)) {
          void navigate({ to: "/auth/pending", replace: true });
          return;
        }

        setSession(result);
        void navigate({
          to: result.user.role === "admin" ? "/admin" : "/dashboard",
          replace: true,
        });
      })
      .catch((reason: unknown) => {
        if (isApiCode(reason, "ACCOUNT_PENDING_APPROVAL")) {
          void navigate({ to: "/auth/pending", replace: true });
          return;
        }
        if (isApiCode(reason, "ACCOUNT_REJECTED") || isApiCode(reason, "ACCOUNT_DISABLED")) {
          void navigate({ to: "/auth/rejected", replace: true });
          return;
        }
        setError(reason instanceof Error ? reason.message : t("auth.ssoFailed"));
      });
  }, [navigate, search, setSession, t]);

  return (
    <AuthLayout title="SSO Balai" subtitle={error ?? t("auth.completingSSO")}>
      {error && (
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">{t("action.back")}</Link>
        </Button>
      )}
    </AuthLayout>
  );
}
