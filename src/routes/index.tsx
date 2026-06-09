import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resource Hub" },
      { name: "description", content: "Book rooms and cars, manage approvals, and track usage." },
    ],
  }),
  beforeLoad: () => {
    const { token } = useAuthStore.getState();
    throw redirect({ to: token ? "/dashboard" : "/login" });
  },
  component: () => null,
});
