import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth";
import { authApi } from "@/services/api/auth.api";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · SILAPET" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setRequestError(null);

    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to request password recovery",
      );
    }
  }

  if (sent) {
    return (
      <AuthLayout title={t("auth.recoveryEmailSent")} subtitle={t("auth.recoveryEmailSentDesc")}>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Mail className="size-5" />
            </div>
          </div>

          <Button asChild className="w-full">
            <Link to="/login">{t("auth.backToSignIn")}</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("auth.forgotPasswordTitle")} subtitle={t("auth.forgotPasswordDesc")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        {requestError && <p className="text-sm text-destructive">{requestError}</p>}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
        </Button>

        <p className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            {t("auth.backToSignIn")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
