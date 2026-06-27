import { useState } from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/LanguageProvider";
import { bookingsApi } from "@/services/api/bookings.api";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toast } from "sonner";

export function ExportBookingsDialog() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const { items } = await bookingsApi.list({ from, to });
      const csv = toCsv(
        items.map((b) => ({
          id: b.id,
          resource: b.resource?.name ?? b.resourceId,
          type: b.resource?.type ?? "",
          user: b.user?.fullName ?? "",
          email: b.user?.email ?? "",
          date: b.date,
          endDate: b.endDate ?? b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          createdAt: b.createdAt,
        })),
        [
          { key: "id", label: "ID" },
          { key: "resource", label: "Resource" },
          { key: "type", label: "Type" },
          { key: "user", label: "User" },
          { key: "email", label: "Email" },
          { key: "date", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "startTime", label: "Start Time" },
          { key: "endTime", label: "End Time" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created At" },
        ],
      );
      downloadCsv(`bookings_${from}_to_${to}.csv`, csv);
      setOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-1 size-4" />
          {t("admin.export")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("admin.exportTitle")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="export-from">{t("admin.exportFrom")}</Label>
            <Input id="export-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="export-to">{t("admin.exportTo")}</Label>
            <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleExport} disabled={busy || !from || !to || from > to}>
          <Download className="mr-1 size-4" />
          {t("admin.exportDownload")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}