export type Role = "user" | "admin";
export type ResourceType = "room" | "car" | "bike";
export type BookingStatus =
  | "pending"
  | "approved"
  | "in_use"
  | "finished"
  | "needs_revision"
  | "closed"
  | "rejected"
  | "completed"
  | "cancelled";
export type ProofKind = "before" | "after";

export type UserStatus = "pending" | "approved" | "rejected";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  /** Optional — backend registration flow. Undefined in legacy/mock users. */
  phone?: string | null;
  /** Optional — backend approval status. Undefined in legacy/mock users. */
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceBase {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  location: string;
  photoUrl?: string;
  isAvailable: boolean;
  color?: string;
  capacity?: number;
  licensePlate?: string;
  fuelType?: "gasoline" | "diesel" | "electric" | "hybrid";
  createdAt: string;
  updatedAt: string;
}

export interface Room extends ResourceBase {
  type: "room";
  capacity: number;
}

export interface Car extends ResourceBase {
  type: "car";
  capacity: number;
  licensePlate: string;
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
}

export interface Bike extends ResourceBase {
  type: "bike";
  capacity: number;
  licensePlate: string;
  fuelType: "gasoline" | "electric";
}

export type Resource = Room | Car | Bike;

export interface BookingUserRef {
  id: string;
  fullName: string;
  email: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  resource?: Resource;
  userId: string;
  user?: BookingUserRef;
  date: string; // YYYY-MM-DD (Asia/Jakarta)
  endDate?: string; // YYYY-MM-DD, inclusive; defaults to `date` (single-day)
  startTime: string; // HH:mm (Asia/Jakarta)
  endTime: string;
  /** ISO 8601 (present when sourced from the backend). */
  startTimeISO?: string;
  endTimeISO?: string;
  status: BookingStatus;
  purpose?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proof {
  id: string;
  bookingId: string;
  kind: ProofKind;
  url: string;
  uploadedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface ResourceFilters {
  search?: string;
  type?: ResourceType | "all";
  availability?: "all" | "available";
}

export interface BookingFilters {
  status?: BookingStatus | "all";
  resourceId?: string;
  from?: string;
  to?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface CreateBookingInput {
  resourceId: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  purpose?: string;
}

export interface CreateResourceInput {
  name: string;
  description: string;
  type: ResourceType;
  photoUrl?: string;
  isAvailable: boolean;
  color?: string;
  // room
  location?: string;
  capacity?: number;
  // car / bike
  licensePlate?: string;
  fuelType?: Car["fuelType"] | Bike["fuelType"];
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
  user: AppUser;
}

/* ---------------------------------------------------------------------------
 * Backend-shaped types (Office-Craft API).
 * These sit alongside the legacy mock-shaped types until later integration
 * chunks migrate call sites over. Field names/shapes mirror the API doc.
 * ------------------------------------------------------------------------- */

export interface ApiBooking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  date: string; // YYYY-MM-DD (Asia/Jakarta)
  endDate: string; // YYYY-MM-DD (Asia/Jakarta)
  status: Exclude<BookingStatus, "completed">;
  purpose: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends ApiBooking {
  resource?: Resource;
  user?: AppUser;
}

export interface PaginatedBookings {
  data: BookingWithDetails[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PublicBooking {
  id: string;
  resourceId: string;
  userId?: string;
  startTime: string;
  endTime: string;
  date?: string;
  endDate?: string;
  status: "pending" | "approved" | "in_use" | "finished";
  purpose?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  resource?: Resource;
  user?: BookingUserRef | AppUser;
}

export interface ApproveBookingResponse {
  booking: BookingWithDetails;
  autoRejectedIds: string[];
}

export interface NotifyResult {
  booking: ApiBooking;
  emailSent: boolean;
  emailError?: string;
  whatsAppSent: boolean;
  whatsAppError?: string;
}

export type TimelineEntry =
  | {
      type: "status_change";
      timestamp: string;
      actorId?: string;
      actor?: AppUser;
      eventType:
        | "created"
        | "approved"
        | "auto_rejected"
        | "rejected"
        | "started"
        | "finished"
        | "cancelled"
        | "revoked";
      fromStatus?: string;
      toStatus: string;
      notes?: string;
    }
  | {
      type: "proof_uploaded";
      timestamp: string;
      actorId?: string;
      actor?: AppUser;
      proofId: string;
      proofKind: ProofKind;
      proofPath: string;
    };

export interface BookingInsights {
  from: string;
  to: string;
  totalBookings: number;
  byStatus: Record<string, number>;
  byResourceType: Record<string, number>;
  byResource: { resourceId: string; resourceName: string; count: number }[];
  byDay: { date: string; count: number }[];
  averageDurationMinutes: number;
  topUsers: { userId: string; fullName: string; count: number }[];
  autoRejectedCount: number;
}
