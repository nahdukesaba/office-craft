import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { useResources } from "@/hooks/queries/useResources";
import { useResourceStore } from "@/stores/resourceStore";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/resources/")({
  head: () => ({ meta: [{ title: "Resources · SILAPET" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const filters = useResourceStore((s) => s.filters);
  const { data, isLoading } = useResources(filters);
  const t = useT();
  return (
    <div className="space-y-4">
      <PageHeader title={t("resources.title")} description={t("resources.description")} />
      <ResourceFilters />
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState title={t("resources.emptyTitle")} description={t("resources.emptyDesc")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}
    </div>
  );
}