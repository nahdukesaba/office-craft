import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import { useSignIn } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/stores/authStore";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useT } from "@/i18n/LanguageProvider";
import { isApiCode } from "@/lib/errors";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { env } from "@/lib/env";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · SILAPET" }] }),
  component: LoginPage,
});

function LoginPage() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);
  const authenticated = useAuthStore((state) => state.authenticated);
  const user = useAuthStore((state) => state.user);
  const { status: bootstrapStatus, isLoading, retry } = useAuthBootstrap();

  useEffect(() => {
    if (bootstrapStatus !== "ready" || !authenticated || !user) return;
    if (user.status === "pending") {
      void navigate({ to: "/auth/pending", replace: true });
    } else if (user.status === "rejected" || user.status === "disabled") {
      void navigate({ to: "/auth/rejected", replace: true });
    } else if (user.status === "approved") {
      void navigate({
        to: user.role === "admin" ? "/admin" : "/dashboard",
        replace: true,
      });
    }
  }, [authenticated, bootstrapStatus, navigate, user]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(v: LoginValues) {
    try {
      const session = await signIn.mutateAsync(v);
      toast.success(t("auth.welcomeBack"));

      navigate({
        to: session.user.role === "admin" ? "/admin" : "/dashboard",
      });
    } catch (e: unknown) {
      if (isApiCode(e, "ACCOUNT_PENDING_APPROVAL")) {
        navigate({ to: "/auth/pending" });
        return;
      }

      if (isApiCode(e, "ACCOUNT_REJECTED") || isApiCode(e, "ACCOUNT_DISABLED")) {
        navigate({ to: "/auth/rejected" });
        return;
      }

      toast.error(e instanceof Error ? e.message : t("auth.signInFailed"));
    }
  }

  if (authenticated && isLoading) {
    return (
      <AuthLayout title={t("auth.signInTitle")} subtitle={t("auth.validatingSession")}>
        <p className="text-sm text-muted-foreground">{t("auth.pleaseWait")}</p>
      </AuthLayout>
    );
  }

  if (authenticated && bootstrapStatus === "error") {
    return (
      <AuthLayout title={t("auth.serviceUnavailable")} subtitle={t("auth.bootstrapUnavailable")}>
        <Button className="w-full" onClick={() => void retry()}>
          {t("action.retry")}
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("auth.signInTitle")} subtitle={t("auth.signInSubtitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>{t("auth.emailLabel")}</Label>
          <Input
            type="email"
            placeholder="user@example.com"
            autoComplete="email"
            {...form.register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("auth.passwordLabel")}</Label>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              autoComplete="current-password"
              className="pr-10"
              {...form.register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? t("auth.signingIn") : t("action.signIn")}
        </Button>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase text-muted-foreground">{t("auth.or")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.assign(`${env.apiBaseUrl.replace(/\/$/, "")}/auth/sso/start`);
          }}
        >
          {t("auth.signInWithSSO")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-primary hover:underline">
            {t("auth.createOne")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
