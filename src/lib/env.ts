export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    "https://ephsilalahi.tailf32e23.ts.net/api",
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false",
  /**
   * When true, proof photos must be captured live from the device camera and
   * cannot be picked from the gallery. Defaults to true.
   * Set VITE_PROOF_CAMERA_ONLY="false" in your env to allow gallery uploads.
   */
  proofCameraOnly: (import.meta.env.VITE_PROOF_CAMERA_ONLY ?? "true") !== "false",
};