import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/queries/useUsers";
import { useApproveUser, useRejectUser } from "@/hooks/mutations/useUserMutations";
import { useT } from "@/i18n/LanguageProvider";

import type { AppUser, UserStatus } from "@/types";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users · SILAPET" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const t = useT();
  const [tab, setTab] = useState<UserStatus>("pending");

  return (
    <div className="space-y-6">
      <PageHeader title={t("adminUsers.title")} description={t("adminUsers.subtitle")} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as UserStatus)}>
        <TabsList>
          <TabsTrigger value="pending">{t("adminUsers.tab.pending")}</TabsTrigger>
          <TabsTrigger value="approved">{t("adminUsers.tab.approved")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("adminUsers.tab.rejected")}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <UsersTable status="pending" />
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <UsersTable status="approved" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <UsersTable status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTable({ status }: { status: UserStatus }) {
  const t = useT();
  const { data, isLoading, error } = useUsers(status);
  const approve = useApproveUser();
  const reject = useRejectUser();
  const [confirm, setConfirm] = useState<{ action: "approve" | "reject"; user: AppUser } | null>(
    null,
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  const users = data ?? [];
  if (users.length === 0) {
    return (
      <EmptyState title={t("adminUsers.emptyTitle")} description={t("adminUsers.emptyDesc")} />
    );
  }

  async function run() {
    if (!confirm) return;
    try {
      if (confirm.action === "approve") {
        await approve.mutateAsync(confirm.user.id);
        toast.success(t("adminUsers.approved"));
      } else {
        await reject.mutateAsync(confirm.user.id);
        toast.success(t("adminUsers.rejected"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminUsers.col.name")}</TableHead>
              <TableHead>{t("adminUsers.col.email")}</TableHead>
              <TableHead>{t("adminUsers.col.phone")}</TableHead>
              <TableHead>{t("adminUsers.col.role")}</TableHead>
              <TableHead>{t("adminUsers.col.createdAt")}</TableHead>
              <TableHead className="text-right">{t("adminUsers.col.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{u.role}</Badge>
                </TableCell>
                <TableCell>{u.createdAt ? fmtDate(u.createdAt) : "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {status !== "approved" && (
                    <Button size="sm" onClick={() => setConfirm({ action: "approve", user: u })}>
                      {t("action.approve")}
                    </Button>
                  )}
                  {status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirm({ action: "reject", user: u })}
                    >
                      {t("action.reject")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.action === "approve" ? t("adminUsers.approveQ") : t("adminUsers.rejectQ")}
        description={confirm ? `${confirm.user.fullName} · ${confirm.user.email}` : undefined}
        confirmLabel={confirm?.action === "approve" ? t("action.approve") : t("action.reject")}
        onConfirm={run}
      />
    </>
  );
}
