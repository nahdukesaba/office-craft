import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { useAuthStore, type AuthIssue } from "@/stores/authStore";
import { ApiError, toApiError } from "@/lib/errors";
import type { AuthSession } from "@/types";

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

// A separate cookie-aware client prevents recursive refresh interception.
export const sessionHttp = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

const unauthenticatedAuthPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/sso/exchange",
];
const nonRefreshableAuthPaths = [...unauthenticatedAuthPaths, "/auth/logout"];
const revokedAccessCodes = new Set([
  "APPLICATION_ACCESS_UNAVAILABLE",
  "ACCOUNT_UNAVAILABLE",
  "ACCOUNT_DISABLED",
  "ACCOUNT_REJECTED",
  "ACCOUNT_PENDING_APPROVAL",
]);

function extractResponseCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("response" in error)) return "";
  const response = (error as { response?: { data?: { error?: unknown; code?: unknown } } })
    .response;
  const rawCode = response?.data?.error ?? response?.data?.code;
  return typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";
}

function shouldAttemptRefresh(config: RetriableRequestConfig): boolean {
  if (config._authRetry) return false;
  const url = config.url ?? "";
  return !nonRefreshableAuthPaths.some((path) => url.includes(path));
}

async function performCookieRefresh(): Promise<boolean> {
  try {
    const { data } = await sessionHttp.post<AuthSession>("/auth/refresh");
    if (!data?.user) {
      throw new ApiError({
        status: 503,
        code: "AUTH_UNAVAILABLE",
        message: "Authentication service returned an invalid refresh response.",
      });
    }
    useAuthStore.getState().setSession(data);
    return true;
  } catch (error) {
    const response =
      axios.isAxiosError(error) || (error && typeof error === "object" && "response" in error)
        ? (error as { response?: { status?: number } }).response
        : undefined;
    if (response?.status === 401 || response?.status === 403) {
      useAuthStore.getState().invalidateSession("INVALID_REFRESH_TOKEN");
      return false;
    }
    throw toApiError(error);
  }
}

async function refreshSession(): Promise<boolean> {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return navigator.locks.request("silapet-auth-refresh", performCookieRefresh);
  }
  return performCookieRefresh();
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status =
      error && typeof error === "object" && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    const originalRequest =
      error && typeof error === "object" && "config" in error
        ? (error as { config?: RetriableRequestConfig }).config
        : undefined;

    if (status === 403 && originalRequest) {
      const url = originalRequest.url ?? "";
      const isPublicAuth = unauthenticatedAuthPaths.some((path) => url.includes(path));
      const code = extractResponseCode(error);
      if (!isPublicAuth && revokedAccessCodes.has(code)) {
        useAuthStore.getState().invalidateSession(code as AuthIssue);
      } else if (!isPublicAuth && code === "FORBIDDEN") {
        useAuthStore.getState().setBootstrapState("idle");
      }
    }

    if (status === 401 && originalRequest && shouldAttemptRefresh(originalRequest)) {
      originalRequest._authRetry = true;
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      if (await refreshPromise) return http(originalRequest);
    }

    if (status === 401 && originalRequest?._authRetry) {
      useAuthStore.getState().invalidateSession("INVALID_TOKEN");
    }
    return Promise.reject(toApiError(error));
  },
);
