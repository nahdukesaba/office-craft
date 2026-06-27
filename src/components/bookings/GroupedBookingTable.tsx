import { useT } from "@/i18n/LanguageProvider";
import { BookingTable } from "@/components/bookings/BookingTable";
import type { Booking, ResourceType } from "@/types";

const GROUPS: { type: ResourceType; key: string }[] = [
  { type: "car", key: "admin.groupCar" },
  { type: "room", key: "admin.groupRoom" },
  { type: "bike", key: "admin.groupBike" },
];

export function GroupedBookingTable({
  bookings,
  detailHrefBase,
}: {
  bookings: Booking[];
  detailHrefBase?: "/my-bookings" | "/admin/bookings";
}) {
  const t = useT();
  return (
    <div className="space-y-6">
      {GROUPS.map((g) => {
        const items = bookings.filter((b) => b.resource?.type === g.type);
        return (
          <section key={g.type}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {t(g.key)} <span className="ml-1 text-xs">({items.length})</span>
            </h3>
            {items.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                {t("admin.noneInGroup")}
              </p>
            ) : (
              <BookingTable bookings={items} detailHrefBase={detailHrefBase} />
            )}
          </section>
        );
      })}
    </div>
  );
}