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

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · SILAP Aset" }] }),
  beforeLoad: () => {
    if (useAuthStore.getState().token) throw redirect({ to: "/dashboard" });
  },
  component: RegisterPage,
});

function RegisterPage() {
  const signUp = useSignUp();
  const navigate = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(v: RegisterValues) {
    try {
      await signUp.mutateAsync(v);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    }
  }

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2"><Label>Full name</Label><Input {...form.register("fullName")} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" {...form.register("password")} /></div>
        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? "Creating..." : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}