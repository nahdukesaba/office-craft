import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/auth/pending")({
  head: () => ({ meta: [{ title: "Awaiting approval · SILAPET" }] }),
  component: PendingPage,
});

function PendingPage() {
  const t = useT();
  const signOut = useAuthStore((s) => s.signOut);
  return (
    <AuthLayout title={t("auth.pendingTitle")} subtitle={t("auth.pendingSubtitle")}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("auth.pendingDesc")}</p>
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link to="/login" onClick={() => signOut()}>{t("action.signIn")}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">{t("action.goHome")}</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}