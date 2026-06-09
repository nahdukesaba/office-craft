export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false",
};