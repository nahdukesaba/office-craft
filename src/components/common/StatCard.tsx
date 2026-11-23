import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, valueClassName }: { label: string; value: string | number; icon?: LucideIcon; valueClassName?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-semibold tabular-nums", valueClassName)}>{value}</p>
        </div>
        {Icon && <Icon className="size-6 text-muted-foreground" />}
      </CardContent>
    </Card>
  );
}