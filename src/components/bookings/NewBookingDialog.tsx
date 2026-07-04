import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { BookingForm } from "./BookingForm";
import { useT } from "@/i18n/LanguageProvider";

export function NewBookingDialog({ resourceId, label }: { resourceId?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          {label ?? t("booking.new")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("booking.new")}</DialogTitle>
        </DialogHeader>
        <BookingForm resourceId={resourceId} onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}