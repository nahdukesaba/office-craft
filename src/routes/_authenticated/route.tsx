import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { AuthState } from "@/stores/authStore";
import { ensureAuthBootstrap } from "@/services/auth-bootstrap";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";

function redirectForAuthState(state: AuthState, returnTo: string): void {
  if (state.authIssue === "ACCOUNT_PENDING_APPROVAL" || state.user?.status === "pending") {
    throw redirect({ to: "/auth/pending" });
  }
  if (
    state.authIssue === "ACCOUNT_REJECTED" ||
    state.authIssue === "ACCOUNT_DISABLED" ||
    state.user?.status === "rejected" ||
    state.user?.status === "disabled"
  ) {
    throw redirect({ to: "/auth/rejected" });
  }
  if (!state.authenticated || !state.user || state.user.status !== "approved") {
    throw redirect({ to: "/login", search: { redirect: returnTo } });
  }
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    try {
      await ensureAuthBootstrap();
    } catch (error) {
      const state = useAuthStore.getState();
      redirectForAuthState(state, location.href);
      throw error;
    }

    redirectForAuthState(useAuthStore.getState(), location.href);
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const t = useT();
  const authenticated = useAuthStore((state) => state.authenticated);
  const user = useAuthStore((state) => state.user);
  const authIssue = useAuthStore((state) => state.authIssue);
  const { status, isLoading, retry } = useAuthBootstrap();

  const destination =
    authIssue === "ACCOUNT_PENDING_APPROVAL" || user?.status === "pending"
      ? "/auth/pending"
      : authIssue === "ACCOUNT_REJECTED" ||
          authIssue === "ACCOUNT_DISABLED" ||
          user?.status === "rejected" ||
          user?.status === "disabled"
        ? "/auth/rejected"
        : !authenticated || !user || user.status !== "approved"
          ? "/login"
          : null;

  useEffect(() => {
    if (status === "ready" && destination) {
      void navigate({ to: destination, replace: true });
    }
  }, [destination, navigate, status]);

  if (isLoading || destination) return null;

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">{t("auth.serviceUnavailable")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.bootstrapUnavailable")}</p>
          <Button className="mt-6" onClick={() => void retry()}>
            {t("action.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
