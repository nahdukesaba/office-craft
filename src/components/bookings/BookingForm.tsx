import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingValues } from "@/schemas/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking } from "@/hooks/mutations/useBookingMutations";
import { useResources } from "@/hooks/queries/useResources";
import { CircularTimePicker } from "./CircularTimePicker";
import { toast } from "sonner";
import { addDays, formatISO } from "date-fns";
import { addHoursHHmm } from "@/lib/format";
import { useEffect, useRef } from "react";

export function BookingForm({
  resourceId,
  onCreated,
}: {
  resourceId?: string;
  onCreated?: () => void;
}) {
  const { user } = useAuth();
  const create = useCreateBooking();
  const showResourcePicker = !resourceId;
  const { data: resources } = useResources(showResourcePicker ? {} : { type: "all" });
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema) as never,
    defaultValues: {
      resourceId: resourceId ?? "",
      date: new Date().toISOString().slice(0, 10),
      startTime: "09:00",
      endTime: "10:00",
      numberOfDays: 1,
    },
  });
  const startTime = form.watch("startTime");
  const prevStartRef = useRef(startTime);
  useEffect(() => {
    if (prevStartRef.current !== startTime) {
      prevStartRef.current = startTime;
      form.setValue("endTime", addHoursHHmm(startTime, 1), { shouldValidate: true });
    }
  }, [startTime, form]);

  async function onSubmit(values: BookingValues) {
    if (!user) return;
    if (!values.resourceId) {
      form.setError("resourceId", { message: "Pick a resource" });
      return;
    }
    const endDate = formatISO(addDays(new Date(values.date), Math.max(1, values.numberOfDays) - 1), { representation: "date" });
    try {
      await create.mutateAsync({
        resourceId: values.resourceId,
        date: values.date,
        endDate,
        startTime: values.startTime,
        endTime: values.endTime,
        userId: user.id,
      });
      toast.success("Booking submitted");
      form.reset({ ...values });
      onCreated?.();
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string; conflictWith?: { userFullName?: string; startTime?: string; endTime?: string; date?: string } };
      if (err?.status === 409) {
        const w = err.conflictWith;
        const detail = w
          ? ` — already approved for ${w.userFullName ?? "another user"} on ${w.date ?? ""} ${w.startTime ?? ""}–${w.endTime ?? ""}`
          : "";
        toast.error(`Booking conflict: this slot is already taken${detail}. Try a different time or date.`);
      } else {
        toast.error(err?.message ?? "Failed to create booking");
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {showResourcePicker && (
        <div className="space-y-2">
          <Label>Resource</Label>
          <Controller
            control={form.control}
            name="resourceId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Pick a resource" /></SelectTrigger>
                <SelectContent>
                  {(resources ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.resourceId && (
            <p className="text-xs text-destructive">{form.formState.errors.resourceId.message}</p>
          )}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start date</Label>
          <Input type="date" {...form.register("date")} />
        </div>
        <div className="space-y-2">
          <Label>Number of days</Label>
          <Input type="number" min={1} max={30} {...form.register("numberOfDays", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Start time</Label>
          <Controller
            control={form.control}
            name="startTime"
            render={({ field }) => <CircularTimePicker value={field.value} onChange={field.onChange} />}
          />
        </div>
        <div className="space-y-2">
          <Label>End time</Label>
          <Controller
            control={form.control}
            name="endTime"
            render={({ field }) => <CircularTimePicker value={field.value} onChange={field.onChange} />}
          />
          {form.formState.errors.endTime && (
            <p className="text-xs text-destructive">{form.formState.errors.endTime.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" disabled={create.isPending} className="w-full">
        {create.isPending ? "Submitting..." : "Request booking"}
      </Button>
    </form>
  );
}