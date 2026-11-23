import { useT } from "@/i18n/LanguageProvider";
import { BookingTable } from "@/components/bookings/BookingTable";
import type { Booking, ResourceType } from "@/types";

const GROUPS: { type: ResourceType; key: string }[] = [
  { type: "car", key: "admin.groupCar" },
  { type: "room", key: "admin.groupRoom" },
  { type: "bike", key: "admin.groupBike" },
  { type: "equipment", key: "admin.groupEquipment" },
];

export function GroupedBookingTable({
  bookings,
  detailHrefBase,
  partial = false,
}: {
  bookings: Booking[];
  detailHrefBase?: "/my-bookings" | "/admin/bookings";
  /** True when this is one page of a longer list, so per-group counts and "none" notes would mislead. */
  partial?: boolean;
}) {
  const t = useT();
  // Bookings whose resource was deleted have no type but still count toward the total.
  const other = bookings.filter((b) => !GROUPS.some((g) => g.type === b.resource?.type));
  return (
    <div className="space-y-6">
      {GROUPS.map((g) => {
        const items = bookings.filter((b) => b.resource?.type === g.type);
        if (partial && items.length === 0) return null;
        return (
          <section key={g.type}>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {t(g.key)} {!partial && <span className="ml-1 text-xs">({items.length})</span>}
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
      {other.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            {t("admin.groupOther")}
          </h3>
          <BookingTable bookings={other} detailHrefBase={detailHrefBase} />
        </section>
      )}
    </div>
  );
}
