import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceSchema, type ResourceValues } from "@/schemas/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Resource } from "@/types";
import { useT } from "@/i18n/LanguageProvider";
import { RESOURCE_PALETTE } from "@/lib/colors";
import { cn } from "@/lib/utils";

export function ResourceForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  loading,
}: {
  defaultValues?: Partial<Resource>;
  onSubmit: (v: ResourceValues) => void;
  submitLabel?: string;
  loading?: boolean;
}) {
  const form = useForm<ResourceValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: (defaultValues?.type as "room" | "car" | "bike") ?? "room",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      photoUrl: defaultValues?.photoUrl ?? "",
      isAvailable: defaultValues?.isAvailable ?? true,
      color: defaultValues?.color ?? "",
      location: defaultValues && defaultValues.type === "room" ? defaultValues.location : "",
      capacity: defaultValues && defaultValues.type === "room" ? defaultValues.capacity : 1,
      equipment: defaultValues && defaultValues.type === "room" ? defaultValues.equipment : [],
      licensePlate: defaultValues && (defaultValues.type === "car" || defaultValues.type === "bike") ? defaultValues.licensePlate : "",
      fuelType: defaultValues && (defaultValues.type === "car" || defaultValues.type === "bike") ? defaultValues.fuelType : "gasoline",
      engineCc: defaultValues && defaultValues.type === "bike" ? defaultValues.engineCc : undefined,
    },
  });
  const type = form.watch("type");
  const color = form.watch("color");
  const t = useT();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => form.setValue("type", v as "room" | "car" | "bike")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="room">{t("resource.type.room")}</SelectItem>
              <SelectItem value="car">{t("resource.type.car")}</SelectItem>
              <SelectItem value="bike">{t("resource.type.bike")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input {...form.register("name")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={3} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Photo URL</Label>
        <Input {...form.register("photoUrl")} placeholder="https://..." />
      </div>
      {type === "room" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input {...form.register("location")} />
          </div>
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input type="number" min={1} {...form.register("capacity")} />
          </div>
        </div>
      ) : type === "car" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>License plate</Label>
            <Input {...form.register("licensePlate")} />
          </div>
          <div className="space-y-2">
            <Label>Fuel</Label>
            <Select value={form.watch("fuelType")} onValueChange={(v) => form.setValue("fuelType", v as "gasoline" | "diesel" | "electric" | "hybrid")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>License plate</Label>
            <Input {...form.register("licensePlate")} />
          </div>
          <div className="space-y-2">
            <Label>Engine (cc)</Label>
            <Input type="number" min={50} {...form.register("engineCc")} />
          </div>
          <div className="space-y-2">
            <Label>Fuel</Label>
            <Select value={form.watch("fuelType")} onValueChange={(v) => form.setValue("fuelType", v as "gasoline" | "electric")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Switch checked={form.watch("isAvailable")} onCheckedChange={(v) => form.setValue("isAvailable", v)} />
        <Label>Available for booking</Label>
      </div>
      <div className="space-y-2">
        <Label>Calendar color</Label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => form.setValue("color", "")}
            className={cn(
              "h-7 rounded-md border px-2 text-xs",
              !color ? "border-foreground" : "border-border text-muted-foreground",
            )}
          >
            Auto
          </button>
          {RESOURCE_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => form.setValue("color", c)}
              className={cn(
                "size-7 rounded-md border-2",
                color === c ? "border-foreground" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
          <Input
            type="color"
            value={color || "#2563eb"}
            onChange={(e) => form.setValue("color", e.target.value)}
            className="h-7 w-12 p-1"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}