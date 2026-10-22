export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
  constructor(opts: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
    fieldErrors?: Record<string, string>;
  }) {
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

/**
 * Maps documented backend error codes to friendly messages.
 * Falls back to the server-provided message, then to a generic string.
 */
const FRIENDLY: Record<string, string> = {
  VALIDATION_ERROR: "Some fields are invalid. Please review and try again.",
  BOOKING_CONFLICT: "This time slot overlaps with another booking.",
  PAST_BOOKING: "Bookings cannot be made or edited in the past.",
  NOT_START_DAY: "This booking can only be started on its scheduled day.",
  PHOTO_REQUIRED: "Please upload the required proof photo first.",
  PROOF_NOT_ALLOWED: "Proof upload is not allowed in the current booking status or date window.",
  IMAGE_REQUIRED: "Please select an image file to upload.",
  INVALID_IMAGE: "Please upload a valid JPEG, PNG, WebP, or GIF image.",
  INVALID_IMAGE_SIZE: "Image size must be between 1 byte and 10 MiB.",
  STORAGE_UNAVAILABLE: "Image storage service is temporarily unavailable. Please try again.",
  AUTH_UNAVAILABLE: "Authentication service is temporarily unavailable. Please try again.",
  AUTH_ERROR: "The email or password is incorrect.",
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  INVALID_PASSWORD: "The current password is incorrect.",
  INVALID_TOKEN: "Your session is invalid. Please sign in again.",
  TOKEN_EXPIRED: "Your session has expired. Please sign in again.",
  INVALID_REFRESH_TOKEN: "Your session has expired. Please sign in again.",
  APPLICATION_ACCESS_EXISTS: "This account already has access to SILAPET. Please sign in.",
  APPLICATION_ACCESS_BLOCKED:
    "This account cannot request SILAPET access. Please contact an administrator.",
  NOTIFY_NOT_ALLOWED: "Notifications are not allowed for this booking state.",
  ACCOUNT_PENDING_APPROVAL: "Your account is awaiting admin approval.",
  ACCOUNT_REJECTED: "Your account has been declined.",
  ACCOUNT_DISABLED: "Your SILAPET access has been disabled.",
  ACCOUNT_UNAVAILABLE: "Your account is not available for SILAPET.",
  APPLICATION_ACCESS_UNAVAILABLE: "Your account does not have active access to SILAPET.",
  RESOURCE_UNAVAILABLE: "This resource is currently unavailable.",
  FORBIDDEN: "You do not have permission to perform this action.",
  UNAUTHORIZED: "Please sign in again to continue.",
  NOT_FOUND: "The requested item was not found.",
};

export function friendlyError(e: unknown, fallback = "Something went wrong"): string {
  const err = toApiError(e);
  if (err.code && FRIENDLY[err.code]) return FRIENDLY[err.code];
  return err.message || fallback;
}
