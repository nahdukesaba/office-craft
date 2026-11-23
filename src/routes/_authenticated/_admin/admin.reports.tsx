import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { QueryError } from "@/components/common/QueryError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsights } from "@/hooks/queries/useStats";
import { statsApi } from "@/services/api/stats.api";
import { useT } from "@/i18n/LanguageProvider";
import { colorForResource } from "@/lib/colors";

export const Route = createFileRoute("/_authenticated/_admin/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · SILAPET" }] }),
  component: ReportsPage,
});

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--popover-foreground)",
};

function ReportsPage() {
  const t = useT();
  const today = format(new Date(), "yyyy-MM-dd");
  const monthAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, refetch } = useInsights(from, to);

  const statusRows = useMemo(
    () => Object.entries(data?.byStatus ?? {}).map(([status, count]) => ({ status, count })),
    [data],
  );
  const typeRows = useMemo(
    () => Object.entries(data?.byResourceType ?? {}).map(([type, count]) => ({ type, count })),
    [data],
  );
  const autoRejectedPct = data && data.totalBookings > 0
    ? Math.round((data.autoRejectedCount / data.totalBookings) * 100)
    : 0;

  async function handleExport() {
    try {
      setExporting(true);
      const { blob, filename } = await statsApi.exportCsv({ from, to });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reports.exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("reports.title")} description={t("reports.subtitle")} />

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="grid gap-1">
            <Label htmlFor="from">{t("reports.from")}</Label>
            <Input id="from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="to">{t("reports.to")}</Label>
            <Input id="to" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            {t("reports.apply")}
          </Button>
          <div className="ml-auto">
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
              {t("reports.exportCsv")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : isError ? (
        <QueryError onRetry={() => void refetch()} />
      ) : !data ? (
        <EmptyState title={t("reports.emptyTitle")} description={t("reports.emptyDesc")} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("reports.total")} value={data.totalBookings} />
            <StatCard label={t("reports.avgDuration")} value={`${Math.round(data.averageDurationMinutes)}m`} />
            <StatCard label={t("reports.autoRejected")} value={`${data.autoRejectedCount} (${autoRejectedPct}%)`} />
            <StatCard label={t("reports.range")} value={`${from} → ${to}`} valueClassName="text-base" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t("reports.byStatus")}</CardTitle></CardHeader>
              <CardContent className="h-72">
                {statusRows.length === 0 ? (
                  <EmptyState title={t("reports.noData")} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusRows} dataKey="count" nameKey="status" innerRadius={50} outerRadius={90} isAnimationActive={false}>
                        {statusRows.map((r, i) => (
                          <Cell key={r.status} fill={colorForResource(`status-${i}`)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("reports.byResourceType")}</CardTitle></CardHeader>
              <CardContent className="h-72">
                {typeRows.length === 0 ? (
                  <EmptyState title={t("reports.noData")} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="type" tick={AXIS_TICK} />
                      <YAxis allowDecimals={false} tick={AXIS_TICK} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="var(--primary)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{t("reports.byDay")}</CardTitle></CardHeader>
              <CardContent className="h-72">
                {data.byDay.length === 0 ? (
                  <EmptyState title={t("reports.noData")} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.byDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={AXIS_TICK} />
                      <YAxis allowDecimals={false} tick={AXIS_TICK} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("reports.byResource")}</CardTitle></CardHeader>
              <CardContent className="h-80">
                {data.byResource.length === 0 ? (
                  <EmptyState title={t("reports.noData")} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byResource} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
                      <YAxis type="category" dataKey="resourceName" width={120} tick={AXIS_TICK} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="var(--primary)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("reports.topUsers")}</CardTitle></CardHeader>
              <CardContent>
                {data.topUsers.length === 0 ? (
                  <EmptyState title={t("reports.noData")} />
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="py-2 text-left font-medium">{t("reports.user")}</th>
                        <th className="py-2 text-right font-medium">{t("reports.bookings")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topUsers.map((u) => (
                        <tr key={u.userId} className="border-b border-border/50">
                          <td className="py-2">{u.fullName}</td>
                          <td className="py-2 text-right tabular-nums">{u.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
