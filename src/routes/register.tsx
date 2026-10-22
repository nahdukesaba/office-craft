import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/schemas/auth";
import { useSignUp } from "@/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/stores/authStore";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useT } from "@/i18n/LanguageProvider";
import { friendlyError, toApiError } from "@/lib/errors";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · SILAPET" }] }),
  beforeLoad: () => {
    if (useAuthStore.getState().token) throw redirect({ to: "/dashboard" });
  },
  component: RegisterPage,
});

function RegisterPage() {
  const signUp = useSignUp();
  const navigate = useNavigate();
  const t = useT();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", phone: "" },
  });

  async function onSubmit(v: RegisterValues) {
    try {
      await signUp.mutateAsync(v);
      form.reset();
      toast.success(t("auth.accountCreated"));
      void navigate({ to: "/auth/pending", replace: true });
    } catch (e: unknown) {
      const error = toApiError(e);
      const fields: Record<string, keyof RegisterValues> = {
        fullName: "fullName",
        full_name: "fullName",
        phone: "phone",
        email: "email",
        password: "password",
      };
      let hasFieldError = false;

      for (const [serverField, message] of Object.entries(error.fieldErrors ?? {})) {
        const field = fields[serverField];
        if (!field || !message) continue;
        form.setError(field, { type: "server", message }, { shouldFocus: !hasFieldError });
        hasFieldError = true;
      }

      if (!hasFieldError && error.code === "INVALID_PASSWORD") {
        form.setError(
          "password",
          { type: "server", message: error.message },
          { shouldFocus: true },
        );
        hasFieldError = true;
      }

      if (!hasFieldError && error.code === "ACCOUNT_ALREADY_EXISTS") {
        form.setError("email", { type: "server", message: error.message }, { shouldFocus: true });
        hasFieldError = true;
      }

      if (!hasFieldError) {
        toast.error(friendlyError(error, t("auth.registrationFailed")));
      }
    }
  }

  return (
    <AuthLayout title={t("auth.createTitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-full-name">{t("auth.fullNameLabel")}</Label>
          <Input
            id="register-full-name"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.fullName}
            aria-describedby={
              form.formState.errors.fullName ? "register-full-name-error" : undefined
            }
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p id="register-full-name-error" role="alert" className="text-xs text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-phone">{t("auth.phoneLabel")}</Label>
          <Input
            id="register-phone"
            type="tel"
            placeholder="6281234567890"
            autoComplete="tel"
            aria-invalid={!!form.formState.errors.phone}
            aria-describedby={
              form.formState.errors.phone ? "register-phone-error" : "register-phone-hint"
            }
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p id="register-phone-error" role="alert" className="text-xs text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
          <p id="register-phone-hint" className="text-xs text-muted-foreground">
            {t("auth.phoneHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">{t("auth.emailLabel")}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            aria-describedby={form.formState.errors.email ? "register-email-error" : undefined}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p id="register-email-error" role="alert" className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">{t("auth.passwordLabel")}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            aria-describedby={
              form.formState.errors.password ? "register-password-error" : "register-password-hint"
            }
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p id="register-password-error" role="alert" className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
          <p id="register-password-hint" className="text-xs text-muted-foreground">
            {t("auth.passwordPolicyHint")}
          </p>
        </div>

        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? t("auth.creating") : t("action.createAccount")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline">
            {t("action.signIn")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
