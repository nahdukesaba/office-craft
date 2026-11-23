import { http } from "@/services/http";
import type { BookingRules } from "@/types";

export const settingsApi = {
  async bookingRules(): Promise<BookingRules> {
    const { data } = await http.get<BookingRules>("/settings/booking-rules");
    return data;
  },
  async updateBookingRules(rules: BookingRules): Promise<BookingRules> {
    const { data } = await http.put<BookingRules>("/settings/booking-rules", rules);
    return data;
  },
};
