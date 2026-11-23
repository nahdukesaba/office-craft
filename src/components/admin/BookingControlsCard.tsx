import { useId, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRemindOverdue, useUpdateBookingRules } from "@/hooks/mutations/useBookingMutations";
import { useBookingRules, useOverdueSummary } from "@/hooks/queries/useBookings";
import { useT } from "@/i18n/LanguageProvider";
import { friendlyError } from "@/lib/errors";
import type { BookingRules } from "@/types";

const fill = (text: string, values: Record<string, number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const RULES: { key: keyof BookingRules; label: string; description: string }[] = [
  {
    key: "blockResourceOpenUsage",
    label: "bookingRules.asset",
    description: "bookingRules.assetDesc",
  },
  { key: "blockUserUnfinished", label: "bookingRules.user", description: "bookingRules.userDesc" },
];

export function BookingControlsCard() {
  const t = useT();
  const uid = useId();
  const { data: rules, isError: rulesFailed } = useBookingRules();
  const { data: overdue } = useOverdueSummary();
  const updateRules = useUpdateBookingRules();
  const remind = useRemindOverdue();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function setRule(key: keyof BookingRules, value: boolean) {
    if (!rules) return;
    updateRules.mutate(
      { ...rules, [key]: value },
      {
        onSuccess: () => toast.success(t("bookingRules.saved")),
        onError: (e) => toast.error(friendlyError(e, t("bookingDetail.failed"))),
      },
    );
  }

  function sendReminders() {
    remind.mutate(undefined, {
      onSuccess: (sent) => {
        setConfirmOpen(false);
        toast.success(fill(t("overdue.sending"), { users: sent.users }));
      },
      onError: (e) => {
        setConfirmOpen(false);
        toast.error(friendlyError(e, t("bookingDetail.failed")));
      },
    });
  }

  const hasOverdue = (overdue?.users ?? 0) > 0;

  return (
    <Card>
      <CardContent className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h2 className="text-lg font-semibold">{t("bookingRules.title")}</h2>
          {rulesFailed && (
            <p className="mt-1 text-sm text-destructive-text">{t("bookingRules.loadFailed")}</p>
          )}
          <div className="mt-2 divide-y divide-border">
            {RULES.map((rule) => (
              <div key={rule.key} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <Label htmlFor={`${uid}-${rule.key}`}>{t(rule.label)}</Label>
                  <p id={`${uid}-${rule.key}-desc`} className="mt-1 text-sm text-muted-foreground">
                    {t(rule.description)}
                  </p>
                </div>
                <Switch
                  id={`${uid}-${rule.key}`}
                  aria-describedby={`${uid}-${rule.key}-desc`}
                  checked={rules?.[rule.key] ?? false}
                  disabled={!rules || updateRules.isPending}
                  onCheckedChange={(value) => setRule(rule.key, value)}
                />
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col items-start gap-3 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h2 className="text-lg font-semibold">{t("overdue.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {hasOverdue
              ? fill(t("overdue.summary"), {
                  bookings: overdue?.bookings ?? 0,
                  users: overdue?.users ?? 0,
                })
              : t("overdue.none")}
          </p>
          <Button
            variant="outline"
            disabled={!hasOverdue || remind.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <BellRing className="mr-1 size-4" />
            {t("overdue.send")}
          </Button>
        </section>
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={fill(t("overdue.confirmTitle"), { users: overdue?.users ?? 0 })}
        description={
          <>
            {fill(t("overdue.confirmDesc"), { bookings: overdue?.bookings ?? 0 })}
            {(overdue?.withoutPhone ?? 0) > 0 &&
              ` ${fill(t("overdue.noPhone"), { count: overdue?.withoutPhone ?? 0 })}`}
          </>
        }
        confirmLabel={t("overdue.send")}
        pending={remind.isPending}
        onConfirm={sendReminders}
      />
    </Card>
  );
}
