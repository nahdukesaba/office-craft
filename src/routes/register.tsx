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
      toast.success(t("auth.accountCreated"));
      navigate({ to: "/auth/pending" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("auth.registrationFailed"));
    }
  }

  return (
    <AuthLayout title={t("auth.createTitle")}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2"><Label>{t("auth.fullNameLabel")}</Label><Input {...form.register("fullName")} /></div>
        <div className="space-y-2"><Label>{t("auth.emailLabel")}</Label><Input type="email" {...form.register("email")} /></div>
        <div className="space-y-2"><Label>{t("auth.passwordLabel")}</Label><Input type="password" {...form.register("password")} /></div>
        <div className="space-y-2">
          <Label>{t("auth.phoneLabel")}</Label>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="6281234567890"
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
          <p className="text-xs text-muted-foreground">{t("auth.phoneHint")}</p>
        </div>
        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? t("auth.creating") : t("action.createAccount")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")} <Link to="/login" className="text-primary hover:underline">{t("action.signIn")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}