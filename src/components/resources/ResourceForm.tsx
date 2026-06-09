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
      type: (defaultValues?.type as "room" | "car") ?? "room",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      photoUrl: defaultValues?.photoUrl ?? "",
      isAvailable: defaultValues?.isAvailable ?? true,
      location: defaultValues && defaultValues.type === "room" ? defaultValues.location : "",
      capacity: defaultValues && defaultValues.type === "room" ? defaultValues.capacity : 1,
      equipment: defaultValues && defaultValues.type === "room" ? defaultValues.equipment : [],
      licensePlate: defaultValues && defaultValues.type === "car" ? defaultValues.licensePlate : "",
      fuelType: defaultValues && defaultValues.type === "car" ? defaultValues.fuelType : "gasoline",
    },
  });
  const type = form.watch("type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => form.setValue("type", v as "room" | "car")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="room">Room</SelectItem>
              <SelectItem value="car">Car</SelectItem>
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
      ) : (
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
      )}
      <div className="flex items-center gap-3">
        <Switch checked={form.watch("isAvailable")} onCheckedChange={(v) => form.setValue("isAvailable", v)} />
        <Label>Available for booking</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}