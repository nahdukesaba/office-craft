import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";
import { authApi } from "@/services/api/auth.api";
import { useT } from "@/i18n/LanguageProvider";
import { isApiCode } from "@/lib/errors";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · SILAPET" }] }),
  component: ResetPasswordPage,
});

function readRecoveryToken(): string | null {
  if (typeof window === "undefined") return null;

  const hash = new URLSearchParams(
    window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash,
  );

  const query = new URLSearchParams(window.location.search);

  return hash.get("access_token") ?? query.get("access_token") ?? null;
}

function ResetPasswordPage() {
  const t = useT();
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const token = readRecoveryToken();

    setRecoveryToken(token);
    setTokenChecked(true);

    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    if (!recoveryToken) return;

    setRequestError(null);

    try {
      await authApi.resetPassword(recoveryToken, values.password);
      setRecoveryToken(null);
      setSuccess(true);
      form.reset();
    } catch (error) {
      if (
        isApiCode(error, "INVALID_RECOVERY_TOKEN") ||
        isApiCode(error, "invalid_token") ||
        isApiCode(error, "missing_token")
      ) {
        setRecoveryToken(null);
        setRequestError(t("auth.invalidRecoveryToken"));
        return;
      }

      setRequestError(error instanceof Error ? error.message : "Failed to reset password");
    }
  }

  if (!tokenChecked) {
    return (
      <AuthLayout title={t("auth.resetPasswordTitle")} subtitle={t("auth.resetPasswordDesc")}>
        <p className="text-sm text-muted-foreground">{t("auth.validatingRecoveryLink")}</p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        title={t("auth.resetPasswordSuccess")}
        subtitle={t("auth.resetPasswordSuccessDesc")}
      >
        <Button asChild className="w-full">
          <Link to="/login">{t("auth.backToSignIn")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  if (!recoveryToken) {
    return (
      <AuthLayout
        title={t("auth.resetPasswordTitle")}
        subtitle={requestError ?? t("auth.invalidRecoveryLink")}
      >
        <Button asChild className="w-full">
          <Link to="/forgot-password">{t("auth.requestNewRecoveryLink")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("auth.resetPasswordTitle")} subtitle={t("auth.resetPasswordDesc")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          id="password"
          label={t("auth.newPassword")}
          visible={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          error={form.formState.errors.password?.message}
          input={form.register("password")}
        />

        <PasswordField
          id="confirm-password"
          label={t("auth.confirmPassword")}
          visible={showConfirmation}
          onToggle={() => setShowConfirmation((value) => !value)}
          error={form.formState.errors.confirmPassword?.message}
          input={form.register("confirmPassword")}
        />

        {requestError && <p className="text-sm text-destructive">{requestError}</p>}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? t("auth.resettingPassword")
            : t("auth.resetPasswordAction")}
        </Button>
      </form>
    </AuthLayout>
  );
}

function PasswordField({
  id,
  label,
  visible,
  onToggle,
  error,
  input,
}: {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  input: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          className="pr-10"
          {...input}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
