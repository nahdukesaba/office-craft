export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  constructor(opts: { status: number; message: string; code?: string; fieldErrors?: Record<string, string> }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
  }
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e && typeof e === "object" && "isAxiosError" in e) {
    const ax = e as { response?: { status?: number; data?: { message?: string; code?: string; fieldErrors?: Record<string, string> } }; message: string };
    return new ApiError({
      status: ax.response?.status ?? 500,
      message: ax.response?.data?.message ?? ax.message ?? "Request failed",
      code: ax.response?.data?.code,
      fieldErrors: ax.response?.data?.fieldErrors,
    });
  }
  return new ApiError({ status: 500, message: e instanceof Error ? e.message : "Unknown error" });
}