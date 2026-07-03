import { LayoutDashboard, Boxes, CalendarDays, ClipboardList, Shield, Car as CarIcon } from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  labelKey: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["user", "admin"] },
  { labelKey: "nav.resources", to: "/resources", icon: Boxes, roles: ["user", "admin"] },
  { labelKey: "nav.myBookings", to: "/my-bookings", icon: ClipboardList, roles: ["user", "admin"] },
  { labelKey: "nav.calendar", to: "/", icon: CalendarDays, roles: ["user", "admin"] },
  { labelKey: "nav.admin", to: "/admin", icon: Shield, roles: ["admin"] },
  { labelKey: "nav.manageResources", to: "/admin/resources", icon: CarIcon, roles: ["admin"] },
  { labelKey: "nav.reviewBookings", to: "/admin/bookings", icon: ClipboardList, roles: ["admin"] },
];