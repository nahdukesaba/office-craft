import { cn } from "@/lib/utils";
import { useT } from "@/i18n/LanguageProvider";

/**
 * SILAP Aset brand mark: a monogram badge + wordmark, replacing the
 * generic lucide "Boxes" icon previously duplicated in AppSidebar,
 * AuthLayout, and PublicHeader.
 */
export function BrandMark({ size = "sm" }: { size?: "sm" | "lg" }) {
  const t = useT();
  const badge = size === "lg" ? "size-9 text-sm" : "size-7 text-xs";
  const name = size === "lg" ? "text-lg" : "text-sm";

  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-primary font-display font-bold text-primary-foreground",
          badge,
        )}
      >
        SA
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn("truncate font-display font-semibold tracking-tight text-foreground", name)}>
          {t("app.name")}
        </span>
        <span className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
          {t("app.fullName")}
        </span>
      </span>
    </span>
  );
}