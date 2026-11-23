import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceSchema, type ResourceValues } from "@/schemas/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Resource } from "@/types";
import { useT } from "@/i18n/LanguageProvider";
import { RESOURCE_PALETTE } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { resourcesApi } from "@/services/api/resources.api";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

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
      type: defaultValues?.type ?? "room",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      photoUrl: defaultValues?.photoUrl ?? "",
      isAvailable: defaultValues?.isAvailable ?? true,
      color: defaultValues?.color ?? "",
      location:
        defaultValues && (defaultValues.type === "room" || defaultValues.type === "equipment")
          ? defaultValues.location
          : "",
      capacity: defaultValues?.capacity ?? 1,
      licensePlate:
        defaultValues && (defaultValues.type === "car" || defaultValues.type === "bike")
          ? defaultValues.licensePlate
          : "",
      fuelType:
        defaultValues && (defaultValues.type === "car" || defaultValues.type === "bike")
          ? defaultValues.fuelType
          : "gasoline",
    },
  });
  const type = form.watch("type");
  const color = form.watch("color");
  const photoUrl = form.watch("photoUrl");
  const t = useT();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const uid = useId();
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(file: File) {
    if (!file || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      toast.error("Image must be between 1 byte and 10 MiB");
      return;
    }
    if (file.type && !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await resourcesApi.uploadPhoto(file);
      form.setValue("photoUrl", publicUrl, { shouldDirty: true });
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit((v) =>
        onSubmit(
          v.type === "equipment"
            ? { ...v, capacity: undefined, licensePlate: undefined, fuelType: undefined }
            : v,
        ),
      )}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${uid}-type`}>Type</Label>
          <Select
            value={type}
            onValueChange={(v) => form.setValue("type", v as ResourceValues["type"])}
          >
            <SelectTrigger id={`${uid}-type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room">{t("resource.type.room")}</SelectItem>
              <SelectItem value="car">{t("resource.type.car")}</SelectItem>
              <SelectItem value="bike">{t("resource.type.bike")}</SelectItem>
              <SelectItem value="equipment">{t("resource.type.equipment")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${uid}-name`}>Name</Label>
          <Input id={`${uid}-name`} {...form.register("name")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${uid}-description`}>Description</Label>
        <Textarea id={`${uid}-description`} rows={3} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${uid}-photo`}>Photo</Label>
        <div className="flex items-start gap-3">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="size-20 shrink-0 rounded-md border border-border object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="size-20 shrink-0 rounded-md border border-dashed border-border" />
          )}
          <div className="flex-1 space-y-2">
            <Input
              id={`${uid}-photo`}
              {...form.register("photoUrl")}
              placeholder="https://... or upload a file"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handlePhotoUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Upload className="mr-1 size-4" />
              )}
              {uploading ? "Uploading..." : "Upload photo"}
            </Button>
          </div>
        </div>
      </div>
      {type === "room" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-location`}>Location</Label>
            <Input id={`${uid}-location`} {...form.register("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-capacity`}>Capacity</Label>
            <Input id={`${uid}-capacity`} type="number" min={1} {...form.register("capacity")} />
          </div>
        </div>
      ) : type === "car" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-plate`}>License plate</Label>
            <Input id={`${uid}-plate`} {...form.register("licensePlate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-fuel`}>Fuel</Label>
            <Select
              value={form.watch("fuelType")}
              onValueChange={(v) =>
                form.setValue("fuelType", v as "gasoline" | "diesel" | "electric" | "hybrid")
              }
            >
              <SelectTrigger id={`${uid}-fuel`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-capacity`}>Capacity</Label>
            <Input id={`${uid}-capacity`} type="number" min={1} {...form.register("capacity")} />
          </div>
        </div>
      ) : type === "equipment" ? (
        <div className="space-y-2">
          <Label htmlFor={`${uid}-location`}>Location</Label>
          <Input id={`${uid}-location`} {...form.register("location")} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${uid}-plate`}>License plate</Label>
            <Input id={`${uid}-plate`} {...form.register("licensePlate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-fuel`}>Fuel</Label>
            <Select
              value={form.watch("fuelType")}
              onValueChange={(v) => form.setValue("fuelType", v as "gasoline" | "electric")}
            >
              <SelectTrigger id={`${uid}-fuel`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-capacity`}>Capacity</Label>
            <Input id={`${uid}-capacity`} type="number" min={1} {...form.register("capacity")} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Switch
          id={`${uid}-available`}
          checked={form.watch("isAvailable")}
          onCheckedChange={(v) => form.setValue("isAvailable", v)}
        />
        <Label htmlFor={`${uid}-available`}>Available for booking</Label>
      </div>
      <div className="space-y-2">
        <Label>Calendar color</Label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={!color}
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
              aria-pressed={color === c}
              onClick={() => form.setValue("color", c)}
              className={cn(
                "size-7 rounded-md border-2",
                color === c ? "border-foreground" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
