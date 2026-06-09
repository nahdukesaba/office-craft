import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: () => {
    const { role } = useAuthStore.getState();
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});