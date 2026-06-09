import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingValues } from "@/schemas/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking } from "@/hooks/mutations/useBookingMutations";
import { toast } from "sonner";

export function BookingForm({ resourceId, onCreated }: { resourceId: string; onCreated?: () => void }) {
  const { user } = useAuth();
  const create = useCreateBooking();
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      resourceId,
      date: new Date().toISOString().slice(0, 10),
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  async function onSubmit(values: BookingValues) {
    if (!user) return;
    try {
      await create.mutateAsync({ ...values, userId: user.id });
      toast.success("Booking submitted");
      form.reset({ ...values });
      onCreated?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create booking";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...form.register("date")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Start</Label>
          <Input type="time" step={1800} {...form.register("startTime")} />
        </div>
        <div className="space-y-2">
          <Label>End</Label>
          <Input type="time" step={1800} {...form.register("endTime")} />
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