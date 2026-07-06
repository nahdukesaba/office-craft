export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
  constructor(opts: { status: number; message: string; code?: string; details?: unknown; fieldErrors?: Record<string, string> }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.fieldErrors = opts.fieldErrors;
  }
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e && typeof e === "object" && "isAxiosError" in e) {
    const ax = e as unknown as {
      response?: {
        status?: number;
        data?: {
          message?: string;
          code?: string;
          error?: string;
          details?: unknown;
          fieldErrors?: Record<string, string>;
        };
      };
      message?: string;
    };
    const data = ax.response?.data;
    return new ApiError({
      status: ax.response?.status ?? 500,
      message: data?.message ?? ax.message ?? "Request failed",
      // Backend uses `error` as the stable machine-readable code.
      code: data?.error ?? data?.code,
      details: data?.details,
      fieldErrors: data?.fieldErrors,
    });
  }
  return new ApiError({ status: 500, message: e instanceof Error ? e.message : "Unknown error" });
}

export function isApiCode(e: unknown, code: string): e is ApiError {
  return e instanceof ApiError && e.code === code;
}