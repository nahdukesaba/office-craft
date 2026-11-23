import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";

export function QueryError({ onRetry }: { onRetry: () => void }) {
  const t = useT();
  return (
    <div role="alert">
      <EmptyState
        title={t("state.loadFailedTitle")}
        description={t("state.loadFailedDesc")}
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("action.retry")}
          </Button>
        }
      />
    </div>
  );
}
