import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/auth/rejected")({
  head: () => ({ meta: [{ title: "Access declined · SILAP Aset" }] }),
  component: RejectedPage,
});

function RejectedPage() {
  const t = useT();
  const signOut = useAuthStore((s) => s.signOut);
  return (
    <AuthLayout title={t("auth.rejectedTitle")} subtitle={t("auth.rejectedSubtitle")}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("auth.rejectedDesc")}</p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login" onClick={() => signOut()}>{t("action.signIn")}</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}