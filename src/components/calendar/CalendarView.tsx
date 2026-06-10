import { useMemo, useState } from "react";
import {
  addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay,
  isSameMonth, isToday, startOfMonth, startOfWeek, subMonths, subWeeks,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking } from "@/types";
import { cn } from "@/lib/utils";
import { colorForResource } from "@/lib/colors";
import { BookingDetailsDialog } from "./BookingDetailsDialog";

type View = "month" | "week";

function minsFromTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function statusStyle(status: Booking["status"]) {
  // pending = dashed + lower opacity; approved/completed = solid
  if (status === "pending") return { opacity: 0.85, borderStyle: "dashed" as const };
  return { opacity: 1, borderStyle: "solid" as const };
}

export function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Booking | null>(null);

  const resources = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    bookings.forEach((b) => {
      if (b.resource && !map.has(b.resource.id)) {
        map.set(b.resource.id, { id: b.resource.id, name: b.resource.name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  function shift(dir: -1 | 1) {
    if (view === "month") setCursor((c) => (dir > 0 ? addMonths(c, 1) : subMonths(c, 1)));
    else setCursor((c) => (dir > 0 ? addWeeks(c, 1) : subWeeks(c, 1)));
  }

  const title =
    view === "month"
      ? format(cursor, "MMMM yyyy")
      : `Week of ${format(startOfWeek(cursor), "MMM d, yyyy")}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <h3 className="min-w-44 text-center font-semibold">{title}</h3>
          <Button size="icon" variant="ghost" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>
            Today
          </Button>
        </div>
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          {(["month", "week"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <MonthGrid cursor={cursor} bookings={bookings} onSelect={setSelected} />
      ) : (
        <WeekGrid cursor={cursor} bookings={bookings} onSelect={setSelected} />
      )}

      <Legend resources={resources} />

      <BookingDetailsDialog
        booking={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </div>
  );
}

function MonthGrid({
  cursor, bookings, onSelect,
}: { cursor: Date; bookings: Booking[]; onSelect: (b: Booking) => void }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const out: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
    return out;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    });
    map.forEach((v) => v.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [bookings]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
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
            <div
              key={key}
              className={cn(
                "min-h-28 border-b border-r border-border p-1.5 text-xs",
                muted && "bg-muted/30 text-muted-foreground",
              )}
            >
              <div className={cn(
                "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                isToday(d) && "bg-primary text-primary-foreground font-semibold",
              )}>
                {format(d, "d")}
              </div>
              <div className="space-y-1">
                {events.slice(0, 3).map((e) => {
                  const color = colorForResource(e.resourceId);
                  const s = statusStyle(e.status);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelect(e)}
                      style={{
                        background: e.status === "pending" ? "transparent" : color,
                        borderColor: color,
                        color: e.status === "pending" ? color : "#fff",
                        borderStyle: s.borderStyle,
                        opacity: s.opacity,
                      }}
                      className="block w-full truncate rounded border px-1 py-0.5 text-left text-[10px] hover:brightness-110"
                      title={`${e.resource?.name ?? ""} · ${e.startTime}-${e.endTime} · ${e.user?.fullName ?? ""}`}
                    >
                      <span className="font-medium">{e.startTime}</span>{" "}
                      <span>{e.resource?.name ?? "Booking"}</span>
                      {e.user?.fullName && (
                        <span className="opacity-80"> · {e.user.fullName.split(" ")[0]}</span>
                      )}
                    </button>
                  );
                })}
                {events.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{events.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({
  cursor, bookings, onSelect,
}: { cursor: Date; bookings: Booking[]; onSelect: (b: Booking) => void }) {
  const HOUR_HEIGHT = 48;
  const START_HOUR = 7;
  const END_HOUR = 21;
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const days = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, minmax(0,1fr))" }}>
          <div className="border-b border-r border-border bg-muted" />
          {days.map((d) => (
            <div key={d.toISOString()} className={cn(
              "border-b border-r border-border bg-muted p-2 text-center text-xs",
              isToday(d) && "bg-primary/10 font-semibold text-primary",
            )}>
              <div>{format(d, "EEE")}</div>
              <div className="text-sm">{format(d, "d")}</div>
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, minmax(0,1fr))" }}>
          <div>
            {hours.map((h) => (
              <div
                key={h}
                className="border-b border-r border-border pr-1 text-right text-[10px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const dayEvents = bookings.filter((b) => b.date === key);
            return (
              <div key={key} className="relative border-r border-border">
                {hours.map((h) => (
                  <div key={h} className="border-b border-border" style={{ height: HOUR_HEIGHT }} />
                ))}
                {dayEvents.map((e) => {
                  const top = ((minsFromTime(e.startTime) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    18,
                    ((minsFromTime(e.endTime) - minsFromTime(e.startTime)) / 60) * HOUR_HEIGHT - 2,
                  );
                  const color = colorForResource(e.resourceId);
                  const s = statusStyle(e.status);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelect(e)}
                      className="absolute left-1 right-1 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[10px] leading-tight shadow-sm hover:brightness-110"
                      style={{
                        top,
                        height,
                        background: e.status === "pending" ? "transparent" : color,
                        color: e.status === "pending" ? color : "#fff",
                        borderColor: color,
                        borderStyle: s.borderStyle,
                        opacity: s.opacity,
                      }}
                      title={`${e.resource?.name ?? ""} · ${e.startTime}-${e.endTime}`}
                    >
                      <div className="font-medium">{e.resource?.name ?? "Booking"}</div>
                      <div className="opacity-90">{e.startTime}–{e.endTime}</div>
                      {e.user?.fullName && <div className="opacity-80">{e.user.fullName}</div>}
                    </button>
                  );
                })}
                {isSameDay(d, new Date()) && <div className="pointer-events-none absolute inset-0 bg-primary/[0.03]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ resources }: { resources: { id: string; name: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card p-3 text-xs">
      <div className="font-medium text-muted-foreground">Resources:</div>
      {resources.length === 0 && <span className="text-muted-foreground">No bookings yet</span>}
      {resources.map((r) => (
        <div key={r.id} className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm" style={{ background: colorForResource(r.id) }} />
          <span>{r.name}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm border-2 border-foreground/60" />
          <span className="text-muted-foreground">Approved / completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm border-2 border-dashed border-foreground/60" />
          <span className="text-muted-foreground">Requested (pending)</span>
        </div>
      </div>
    </div>
  );
}