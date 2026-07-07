import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { MainLayout } from "@/layouts/MainLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (user.status === "pending") throw redirect({ to: "/auth/pending" });
    if (user.status === "rejected") throw redirect({ to: "/auth/rejected" });
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
});