import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/lib/errors";
import type { AppUser } from "@/types";

let bootstrapPromise: Promise<AppUser | null> | null = null;

async function waitForHydration(): Promise<void> {
  if (typeof window === "undefined" || useAuthStore.persist.hasHydrated()) {
    if (!useAuthStore.getState().hydrated) {
      useAuthStore.getState().setHydrated(true);
    }
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

/**
 * Validates a persisted credential candidate and replaces cached business
 * identity with the authoritative /auth/me response. Concurrent callers share
 * one request so React strict mode and nested route guards cannot cause storms.
 */
export async function ensureAuthBootstrap(force = false): Promise<AppUser | null> {
  await waitForHydration();

  const initial = useAuthStore.getState();
  if (!initial.token) {
    initial.setBootstrapState("ready");
    return null;
  }

  if (!force && initial.bootstrapStatus === "ready") {
    return initial.user;
  }

  if (bootstrapPromise) return bootstrapPromise;

  initial.setBootstrapState("loading");
  const candidateToken = initial.token;

  bootstrapPromise = authApi
    .me()
    .then((user) => {
      const current = useAuthStore.getState();
      if (!current.token) return null;

      // A successful refresh may have rotated the token while /me was in
      // flight. Its response still represents this authenticated session.
      current.setAuthoritativeUser(user);
      return user;
    })
    .catch((error: unknown) => {
      const current = useAuthStore.getState();

      // Invalid/revoked sessions are cleared by the HTTP interceptor. They are
      // an unauthenticated result, not a temporary bootstrap outage.
      if (!current.token) {
        current.setBootstrapState("ready");
        return null;
      }

      // Ignore a failure from an obsolete candidate replaced in another tab.
      if (current.token !== candidateToken && current.bootstrapStatus === "ready") {
        return current.user;
      }

      const apiError = toApiError(error);
      current.setBootstrapState("error", apiError.message);
      throw apiError;
    })
    .finally(() => {
      bootstrapPromise = null;
    });

  return bootstrapPromise;
}
