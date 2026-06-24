import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { useResources } from "@/hooks/queries/useResources";
import { useResourceStore } from "@/stores/resourceStore";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/_authenticated/resources/")({
  head: () => ({ meta: [{ title: "Resources · SILAP Aset" }] }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const filters = useResourceStore((s) => s.filters);
  const { data, isLoading } = useResources(filters);
  return (
    <div className="space-y-4">
      <PageHeader title="Resources" description="Browse rooms and cars available for booking." />
      <ResourceFilters />
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}
    </div>
  );
}