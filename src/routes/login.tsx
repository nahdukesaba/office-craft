import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · SILAPET" }] }),
  beforeLoad: () => {
    const { token, role } = useAuthStore.getState();

    if (token) {
      throw redirect({
        to: role === "admin" ? "/admin" : "/dashboard",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);

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

        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? t("auth.signingIn") : t("action.signIn")}
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
