import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/lib/errors";
import type { AppUser } from "@/types";

let bootstrapPromise: Promise<AppUser | null> | null = null;

/**
 * Rebuilds browser UI state exclusively from the backend HttpOnly session.
 * Concurrent callers share
 * one request so React strict mode and nested route guards cannot cause storms.
 */
export async function ensureAuthBootstrap(force = false): Promise<AppUser | null> {
  const initial = useAuthStore.getState();
  if (!force && initial.bootstrapStatus === "ready") {
    return initial.user;
  }

  if (bootstrapPromise) return bootstrapPromise;

  initial.setBootstrapState("loading");

  bootstrapPromise = authApi
    .me()
    .then((user) => {
      const current = useAuthStore.getState();
      current.setAuthoritativeUser(user);
      return user;
    })
    .catch((error: unknown) => {
      const current = useAuthStore.getState();

      const apiError = toApiError(error);
      if (apiError.status === 401 || apiError.status === 403) {
        current.invalidateSession("INVALID_TOKEN");
        current.setBootstrapState("ready");
        return null;
      }
      current.setBootstrapState("error", apiError.message);
      throw apiError;
    })
    .finally(() => {
      bootstrapPromise = null;
    });

  return bootstrapPromise;
}
