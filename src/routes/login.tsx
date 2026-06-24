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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · SILAP Aset" }] }),
  beforeLoad: () => {
    if (useAuthStore.getState().token) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "user@example.com", password: "password" },
  });

  async function onSubmit(v: LoginValues) {
    try {
      await signIn.mutateAsync(v);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Use admin@example.com or user@example.com to try the demo.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...form.register("password")} />
        </div>
        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}