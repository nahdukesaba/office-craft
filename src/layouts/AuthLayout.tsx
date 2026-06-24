import type { ReactNode } from "react";
import { Boxes } from "lucide-react";
import { HeaderControls } from "@/components/common/HeaderControls";
import { useT } from "@/i18n/LanguageProvider";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const t = useT();
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="absolute right-4 top-4"><HeaderControls /></div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-1 text-primary">
          <div className="flex items-center gap-2">
            <Boxes className="size-7" />
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t("app.fullName")}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}