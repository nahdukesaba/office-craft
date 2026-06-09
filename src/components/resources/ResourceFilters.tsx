import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResourceStore } from "@/stores/resourceStore";

export function ResourceFilters() {
  const { filters, setFilter } = useResourceStore();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="Search resources..."
        value={filters.search ?? ""}
        onChange={(e) => setFilter("search", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={filters.type ?? "all"} onValueChange={(v) => setFilter("type", v as "all" | "room" | "car")}>
        <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="room">Rooms</SelectItem>
          <SelectItem value="car">Cars</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.availability ?? "all"} onValueChange={(v) => setFilter("availability", v as "all" | "available")}>
        <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any availability</SelectItem>
          <SelectItem value="available">Available only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}