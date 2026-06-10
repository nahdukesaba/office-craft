import { LayoutDashboard, Boxes, CalendarDays, ClipboardList, Shield, Car as CarIcon } from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["user", "admin"] },
  { label: "Resources", to: "/resources", icon: Boxes, roles: ["user", "admin"] },
  { label: "My Bookings", to: "/my-bookings", icon: ClipboardList, roles: ["user", "admin"] },
  { label: "Calendar", to: "/", icon: CalendarDays, roles: ["user", "admin"] },
  { label: "Admin", to: "/admin", icon: Shield, roles: ["admin"] },
  { label: "Manage Resources", to: "/admin/resources", icon: CarIcon, roles: ["admin"] },
  { label: "Review Bookings", to: "/admin/bookings", icon: ClipboardList, roles: ["admin"] },
];