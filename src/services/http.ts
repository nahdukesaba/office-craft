import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { syncAuthStoreFromStorage, useAuthStore } from "@/stores/authStore";
import { ApiError, toApiError } from "@/lib/errors";
import type { AuthSession } from "@/types";

export const http = axios.create({
  baseURL: env.apiBaseUrl,
});

// Refresh uses a separate client so a failed refresh cannot recursively enter
// the regular 401 interceptor.
export const sessionHttp = axios.create({
  baseURL: env.apiBaseUrl,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

const unauthenticatedAuthPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/sso/exchange",
];

const nonRefreshableAuthPaths = [...unauthenticatedAuthPaths, "/auth/logout"];

const nonRefreshable401Codes = new Set([
  "AUTH_ERROR",
  "INVALID_CREDENTIALS",
  "INVALID_PASSWORD",
  "INVALID_RECOVERY_TOKEN",
  "INVALID_REFRESH_TOKEN",
  "ACCOUNT_PENDING_APPROVAL",
  "ACCOUNT_REJECTED",
  "ACCOUNT_DISABLED",
  "ACCOUNT_UNAVAILABLE",
  "APPLICATION_ACCESS_UNAVAILABLE",
]);

const revokedAccessCodes = new Set([
  "APPLICATION_ACCESS_UNAVAILABLE",
  "ACCOUNT_UNAVAILABLE",
  "ACCOUNT_DISABLED",
  "ACCOUNT_REJECTED",
  "ACCOUNT_PENDING_APPROVAL",
]);

function extractResponseCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return "";
  }
  const response = (
    error as {
      response?: {
        data?: {
          error?: unknown;
          code?: unknown;
        };
      };
    }
  ).response;

  const rawCode = response?.data?.error ?? response?.data?.code;
  return typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";
}

function getBearerTokenFromConfig(config?: InternalAxiosRequestConfig): string | null {
  if (!config?.headers) return null;
  const headers = config.headers as Record<string, unknown> & {
    get?: (name: string) => unknown;
  };
  const raw =
    (typeof headers.get === "function" ? headers.get("Authorization") : undefined) ??
    headers.Authorization ??
    headers.authorization;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  return trimmed.slice(7).trim() || null;
}

function setBearerTokenOnConfig(config: InternalAxiosRequestConfig, token: string): void {
  config.headers = config.headers ?? ({} as InternalAxiosRequestConfig["headers"]);
  const headers = config.headers as Record<string, unknown> & {
    set?: (name: string, value: string) => void;
  };
  if (typeof headers.set === "function") {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.Authorization = `Bearer ${token}`;
}

function shouldAttemptRefresh(error: unknown, config: RetriableRequestConfig): boolean {
  if (config._authRetry) return false;

  const url = config.url ?? "";
  if (nonRefreshableAuthPaths.some((path) => url.includes(path))) {
    return false;
  }

  const code = extractResponseCode(error);
  if (code && nonRefreshable401Codes.has(code)) {
    return false;
  }

  return true;
}

async function rehydrateFromBrowserStorageIfPresent(): Promise<void> {
  syncAuthStoreFromStorage();
}

async function performSingleTabRefresh(sentToken?: string | null): Promise<string | null> {
  await rehydrateFromBrowserStorageIfPresent();

  const store = useAuthStore.getState();
  if (sentToken && store.token && store.token !== sentToken) {
    return store.token;
  }

  const initialRefreshToken = store.refreshToken;
  const initialAccessToken = store.token;

  if (!initialRefreshToken) {
    if (store.token || store.user) {
      store.invalidateSession("INVALID_REFRESH_TOKEN");
    }
    return null;
  }

  try {
    const { data } = await sessionHttp.post<AuthSession>("/auth/refresh", {
      refreshToken: initialRefreshToken,
    });

    const current = useAuthStore.getState();

    // Do not restore a session that was replaced or signed out
    // while the refresh request was in flight.
    if (
      !current.refreshToken ||
      current.refreshToken !== initialRefreshToken ||
      current.token !== initialAccessToken
    ) {
      return null;
    }

    if (!data || typeof data.token !== "string" || !data.token.trim() || !data.user) {
      throw new ApiError({
        status: 503,
        code: "AUTH_UNAVAILABLE",
        message: "Authentication service returned an invalid refresh response.",
      });
    }

    current.setSession(data);
    return data.token;
  } catch (error) {
    const response =
      axios.isAxiosError(error) || (error && typeof error === "object" && "response" in error)
        ? (error as { response?: { status?: number; data?: unknown } }).response
        : undefined;

    const status = response?.status;
    const code = extractResponseCode(error);

    // Any 401 from /auth/refresh confirms the refresh token itself was rejected.
    const invalidRefreshToken = status === 401;

    const revokedAccess = status === 403 && revokedAccessCodes.has(code);

    const current = useAuthStore.getState();

    // Network errors and temporary SSO failures (e.g. 500/502/503/504/429)
    // must not erase the user's saved session.
    if (current.refreshToken === initialRefreshToken && (invalidRefreshToken || revokedAccess)) {
      current.invalidateSession(
        revokedAccess && revokedAccessCodes.has(code)
          ? (code as Parameters<typeof current.invalidateSession>[0])
          : "INVALID_REFRESH_TOKEN",
      );
      return null;
    }

    // Keep the persisted credential candidate for temporary network/5xx/503
    // failures, but surface the real refresh failure instead of the original
    // protected-request 401.
    throw toApiError(error);
  }
}

async function refreshAccessToken(sentToken?: string | null): Promise<string | null> {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return navigator.locks.request("silapet-auth-refresh", () =>
      performSingleTabRefresh(sentToken),
    );
  }
  return performSingleTabRefresh(sentToken);
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    const url = config.url ?? "";
    const isUnauthenticatedAuthRoute = unauthenticatedAuthPaths.some((path) => url.includes(path));

    if (!isUnauthenticatedAuthRoute) {
      setBearerTokenOnConfig(config, token);
    }
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status =
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status;

    const originalRequest =
      error && typeof error === "object" && "config" in error
        ? (error as { config?: RetriableRequestConfig }).config
        : undefined;

    if (status === 403 && originalRequest) {
      const url = originalRequest.url ?? "";
      const isPublicAuth = unauthenticatedAuthPaths.some((path) => url.includes(path));
      const code = extractResponseCode(error);

      if (!isPublicAuth && revokedAccessCodes.has(code)) {
        const current = useAuthStore.getState();
        const sentToken = getBearerTokenFromConfig(originalRequest);
        if (current.token && (!sentToken || current.token === sentToken)) {
          current.invalidateSession(code as Parameters<typeof current.invalidateSession>[0]);
        }
      } else if (!isPublicAuth && code === "FORBIDDEN") {
        const current = useAuthStore.getState();
        const sentToken = getBearerTokenFromConfig(originalRequest);
        if (current.token && (!sentToken || current.token === sentToken)) {
          // A role downgrade commonly first appears as a forbidden admin API
          // response. Revalidate /me so route guards and navigation stop using
          // the previously cached business role.
          current.setBootstrapState("idle");
        }
      }
    }

    if (status === 401 && originalRequest && shouldAttemptRefresh(error, originalRequest)) {
      originalRequest._authRetry = true;

      const sentToken = getBearerTokenFromConfig(originalRequest);
      await rehydrateFromBrowserStorageIfPresent();
      const currentToken = useAuthStore.getState().token;

      // If another request already rotated the access token while this request
      // was in flight, retry immediately with the new token instead of firing
      // a redundant second refresh rotation.
      if (!refreshPromise && sentToken && currentToken && sentToken !== currentToken) {
        setBearerTokenOnConfig(originalRequest, currentToken);
        return http(originalRequest);
      }

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(sentToken).finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        setBearerTokenOnConfig(originalRequest, newToken);
        return http(originalRequest);
      }
    }

    if (status === 401 && originalRequest?._authRetry) {
      const current = useAuthStore.getState();
      const sentToken = getBearerTokenFromConfig(originalRequest);
      if (current.token && (!sentToken || current.token === sentToken)) {
        current.invalidateSession("INVALID_TOKEN");
      }
    }

    return Promise.reject(toApiError(error));
  },
);
