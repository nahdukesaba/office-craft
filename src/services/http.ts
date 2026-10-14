import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/lib/errors";
import type { AuthSession } from "@/types";

export const http = axios.create({
  baseURL: env.apiBaseUrl,
});

// Refresh uses a separate client so a failed refresh cannot recursively enter
// the regular 401 interceptor.
const sessionHttp = axios.create({
  baseURL: env.apiBaseUrl,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

const publicAuthPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/request-access",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const nonRefreshable401Codes = new Set([
  "INVALID_CREDENTIALS",
  "INVALID_PASSWORD",
  "INVALID_RECOVERY_TOKEN",
  "ACCOUNT_PENDING_APPROVAL",
  "ACCOUNT_REJECTED",
]);

function shouldAttemptRefresh(error: unknown, config: RetriableRequestConfig): boolean {
  if (config._authRetry) return false;

  const url = config.url ?? "";
  if (publicAuthPaths.some((path) => url.includes(path))) {
    return false;
  }

  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: string;
            code?: string;
          };
        };
      }
    ).response;

    const code = response?.data?.error ?? response?.data?.code;

    if (code && nonRefreshable401Codes.has(code)) {
      return false;
    }
  }

  return true;
}

async function refreshAccessToken(): Promise<string | null> {
  const store = useAuthStore.getState();
  const refreshToken = store.refreshToken;

  if (!refreshToken) {
    store.signOut();
    return null;
  }

  try {
    const { data } = await sessionHttp.post<AuthSession>("/auth/refresh", {
      refreshToken,
    });

    useAuthStore.getState().setSession(data);

    return data.token;
  } catch {
    useAuthStore.getState().signOut();
    return null;
  }
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};

    const headers = config.headers as Record<string, string>;
    const url = config.url ?? "";
    const isRecoveryReset = url.includes("/auth/reset-password");

    if (!isRecoveryReset) {
      headers.Authorization = `Bearer ${token}`;
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

    if (status === 401 && originalRequest && shouldAttemptRefresh(error, originalRequest)) {
      originalRequest._authRetry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        // The request interceptor will overwrite Authorization with the newly
        // stored access token when this request is retried.
        return http(originalRequest);
      }
    }

    return Promise.reject(toApiError(error));
  },
);
