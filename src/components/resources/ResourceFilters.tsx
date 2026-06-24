import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResourceStore } from "@/stores/resourceStore";
import { useT } from "@/i18n/LanguageProvider";

export function ResourceFilters() {
  const { filters, setFilter } = useResourceStore();
  const t = useT();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder={t("resource.search")}
        value={filters.search ?? ""}
        onChange={(e) => setFilter("search", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={filters.type ?? "all"} onValueChange={(v) => setFilter("type", v as "all" | "room" | "car" | "bike")}>
        <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("resource.types.all")}</SelectItem>
          <SelectItem value="room">{t("resource.types.rooms")}</SelectItem>
          <SelectItem value="car">{t("resource.types.cars")}</SelectItem>
          <SelectItem value="bike">{t("resource.types.bikes")}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.availability ?? "all"} onValueChange={(v) => setFilter("availability", v as "all" | "available")}>
        <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("resource.availability.any")}</SelectItem>
          <SelectItem value="available">{t("resource.availability.available")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}