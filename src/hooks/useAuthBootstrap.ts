import { useCallback, useEffect } from "react";
import { ensureAuthBootstrap } from "@/services/auth-bootstrap";
import { useAuthStore } from "@/stores/authStore";

export function useAuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const status = useAuthStore((state) => state.bootstrapStatus);
  const error = useAuthStore((state) => state.bootstrapError);

  useEffect(() => {
    if (hydrated && status === "idle") {
      void ensureAuthBootstrap().catch(() => undefined);
    }
  }, [hydrated, status]);

  const retry = useCallback(() => ensureAuthBootstrap(true), []);

  return {
    hydrated,
    status,
    error,
    isLoading: !hydrated || status === "idle" || status === "loading",
    retry,
  };
}
