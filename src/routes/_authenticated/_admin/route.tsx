import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ensureAuthBootstrap } from "@/services/auth-bootstrap";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async () => {
    await ensureAuthBootstrap();
    const { role, bootstrapStatus } = useAuthStore.getState();
    if (bootstrapStatus !== "ready") throw new Error("Authentication bootstrap incomplete");
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const role = useAuthStore((state) => state.role);
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus);
  const navigate = useNavigate();

  useEffect(() => {
    if (bootstrapStatus === "ready" && role !== "admin") {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [bootstrapStatus, navigate, role]);

  if (bootstrapStatus !== "ready" || role !== "admin") return null;
  return <Outlet />;
}
