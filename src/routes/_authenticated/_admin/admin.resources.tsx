import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { useResources } from "@/hooks/queries/useResources";
import { useCreateResource, useDeleteResource, useUpdateResource } from "@/hooks/mutations/useResourceMutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import type { Resource } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin/resources")({
  head: () => ({ meta: [{ title: "Manage Resources · Admin" }] }),
  component: AdminResources,
});

function AdminResources() {
  const { data, isLoading } = useResources();
  const create = useCreateResource();
  const update = useUpdateResource();
  const remove = useDeleteResource();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manage Resources"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 size-4" />New resource</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create resource</DialogTitle></DialogHeader>
              <ResourceForm
                loading={create.isPending}
                onSubmit={async (v) => {
                  try { await create.mutateAsync(v); toast.success("Resource created"); setCreateOpen(false); }
                  catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <LoadingSkeleton /> : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="capitalize">{r.type}</TableCell>
                  <TableCell>{r.isAvailable ? "Available" : "Unavailable"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleting(r)}><Trash2 className="size-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit resource</DialogTitle></DialogHeader>
          {editing && (
            <ResourceForm
              defaultValues={editing}
              loading={update.isPending}
              onSubmit={async (v) => {
                try { await update.mutateAsync({ id: editing.id, input: v }); toast.success("Updated"); setEditing(null); }
                catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete resource?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!deleting) return;
          try { await remove.mutateAsync(deleting.id); toast.success("Deleted"); }
          catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed"); }
          setDeleting(null);
        }}
      />
    </div>
  );
}