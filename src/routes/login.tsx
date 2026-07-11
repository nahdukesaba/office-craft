import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · SILAPET" }] }),
  beforeLoad: () => {
    if (useAuthStore.getState().token) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const t = useT();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "user@example.com", password: "password" },
  });

  async function onSubmit(v: LoginValues) {
    try {
      await signIn.mutateAsync(v);
      toast.success(t("auth.welcomeBack"));
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      if (isApiCode(e, "ACCOUNT_PENDING_APPROVAL")) {
        navigate({ to: "/auth/pending" });
        return;
      }
      if (isApiCode(e, "ACCOUNT_REJECTED")) {
        navigate({ to: "/auth/rejected" });
        return;
      }
      toast.error(e instanceof Error ? e.message : t("auth.signInFailed"));
    }
  }

  return (
    <AuthLayout title={t("auth.signInTitle")} subtitle={t("auth.signInSubtitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>{t("auth.emailLabel")}</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label>{t("auth.passwordLabel")}</Label>
          <Input type="password" {...form.register("password")} />
        </div>
        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? t("auth.signingIn") : t("action.signIn")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")} <Link to="/register" className="text-primary hover:underline">{t("auth.createOne")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}