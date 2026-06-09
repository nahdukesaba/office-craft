import axios from "axios";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { toApiError } from "@/lib/errors";

export const http = axios.create({ baseURL: env.apiBaseUrl });

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const apiErr = toApiError(error);
    if (apiErr.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(apiErr);
  },
);