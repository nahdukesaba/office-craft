import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { useResources } from "@/hooks/queries/useResources";
import {
  useCreateResource,
  useDeleteResource,
  useUpdateResource,
} from "@/hooks/mutations/useResourceMutations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { QueryError } from "@/components/common/QueryError";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ResourceColorDot } from "@/components/common/ResourceColorDot";
import { toast } from "sonner";
import type { Resource } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/_authenticated/_admin/admin/resources")({
  head: () => ({ meta: [{ title: "Manage Resources · Admin" }] }),
  component: AdminResources,
});

function AdminResources() {
  const { data, isLoading, isError, refetch } = useResources();
  const create = useCreateResource();
  const update = useUpdateResource();
  const remove = useDeleteResource();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const t = useT();

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("adminResources.title")}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" />
                {t("adminResources.new")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("adminResources.create")}</DialogTitle>
              </DialogHeader>
              <ResourceForm
                loading={create.isPending}
                onSubmit={async (v) => {
                  try {
                    await create.mutateAsync(v);
                    toast.success(t("adminResources.created"));
                    setCreateOpen(false);
                  } catch (e: unknown) {
                    toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminResources.name")}</TableHead>
                <TableHead>{t("adminResources.type")}</TableHead>
                <TableHead>{t("adminResources.info")}</TableHead>
                <TableHead>{t("adminResources.status")}</TableHead>
                <TableHead className="text-right">{t("adminResources.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-1.5">
                      <ResourceColorDot resourceId={r.id} resource={r} />
                      {r.name}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{t(`resource.type.${r.type}`)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.type === "car" || r.type === "bike"
                      ? (r.licensePlate ?? "—")
                      : r.location || "—"}
                  </TableCell>
                  <TableCell>
                    {r.isAvailable ? t("resource.available") : t("resource.unavailable")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`${t("action.edit")} ${r.name}`}
                      onClick={() => setEditing(r)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`${t("action.delete")} ${r.name}`}
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("adminResources.edit")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ResourceForm
              defaultValues={editing}
              loading={update.isPending}
              onSubmit={async (v) => {
                try {
                  await update.mutateAsync({ id: editing.id, input: v });
                  toast.success(t("adminResources.updated"));
                  setEditing(null);
                } catch (e: unknown) {
                  toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("adminResources.deleteQ")}
        description={t("adminResources.deleteDesc")}
        confirmLabel={t("action.delete")}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove.mutateAsync(deleting.id);
            toast.success(t("adminResources.deleted"));
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : t("bookingDetail.failed"));
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}
