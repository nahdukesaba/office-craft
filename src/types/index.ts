export type Role = "user" | "admin";
export type ResourceType = "room" | "car" | "bike";
export type BookingStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled";
export type ProofKind = "before" | "after";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
}

export interface ResourceBase {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  photoUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Room extends ResourceBase {
  type: "room";
  location: string;
  capacity: number;
  equipment: string[];
}

export interface Car extends ResourceBase {
  type: "car";
  licensePlate: string;
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
}

export interface Bike extends ResourceBase {
  type: "bike";
  licensePlate: string;
  engineCc?: number;
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
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  status: BookingStatus;
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
}

export interface CreateBookingInput {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateResourceInput {
  name: string;
  description: string;
  type: ResourceType;
  photoUrl?: string;
  isAvailable: boolean;
  // room
  location?: string;
  capacity?: number;
  equipment?: string[];
  // car / bike
  licensePlate?: string;
  fuelType?: Car["fuelType"] | Bike["fuelType"];
  engineCc?: number;
}

export interface AuthSession {
  token: string;
  user: AppUser;
}