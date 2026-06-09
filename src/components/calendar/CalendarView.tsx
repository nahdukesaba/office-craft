import { useMemo, useState } from "react";
import {
  addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  parseISO, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking } from "@/types";
import { STATUS_COLOR } from "@/config/constants";
import { cn } from "@/lib/utils";

export function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [cursor, setCursor] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const out: Date[] = [];
    for (let d = start; d <= end; d = new Date(d.getTime() + 24 * 3600 * 1000)) out.push(d);
    return out;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    });
    return map;
  }, [bookings]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-semibold">{format(cursor, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setCursor(subMonths(cursor, 1))}><ChevronLeft className="size-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
          <Button size="icon" variant="ghost" onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border bg-muted text-center text-xs font-medium text-muted-foreground">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="p-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const events = eventsByDay.get(key) ?? [];
          const muted = !isSameMonth(d, cursor);
          return (
            <div key={key} className={cn("min-h-24 border-b border-r border-border p-1.5 text-xs", muted && "bg-muted/30 text-muted-foreground")}>
              <div className={cn("mb-1 flex h-5 w-5 items-center justify-center rounded-full", isToday(d) && "bg-primary text-primary-foreground")}>
                {format(d, "d")}
              </div>
              <div className="space-y-1">
                {events.slice(0, 3).map((e) => (
                  <div key={e.id} className={cn("truncate rounded px-1 py-0.5 text-[10px]", STATUS_COLOR[e.status])} title={`${e.resource?.name ?? ""} · ${e.startTime}-${e.endTime}`}>
                    {e.startTime} {e.resource?.name ?? "Booking"}
                  </div>
                ))}
                {events.length > 3 && <div className="text-[10px] text-muted-foreground">+{events.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
      {/* keep parseISO imported reference for future use */}
      <span className="hidden">{parseISO("2025-01-01").toString()}</span>
    </div>
  );
}