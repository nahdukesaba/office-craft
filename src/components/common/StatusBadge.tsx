import { Badge } from "@/components/ui/badge";
import { STATUS_COLOR, STATUS_LABEL } from "@/config/constants";
import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant="outline" className={cn("border", STATUS_COLOR[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}