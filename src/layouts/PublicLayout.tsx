import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SkipLink } from "@/components/common/SkipLink";
import { useT } from "@/i18n/LanguageProvider";

export function PublicLayout({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 outline-none">{children}</main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("app.name")} · {t("app.fullName")} · {t("app.tagline")}
      </footer>
    </div>
  );
}