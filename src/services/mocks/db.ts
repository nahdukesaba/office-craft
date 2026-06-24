import type { AppUser, Booking, BookingFilters, CreateBookingInput, CreateResourceInput, Paginated, Proof, ProofKind, Resource, ResourceFilters } from "@/types";
import { seedBookings, seedProofs, seedResources, seedUsers } from "./fixtures";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();

let users: AppUser[] = [...seedUsers];
let resources: Resource[] = [...seedResources];
let bookings: Booking[] = [...seedBookings];
let proofs: Proof[] = [...seedProofs];

function hydrateBooking(b: Booking): Booking {
  return {
    ...b,
    resource: resources.find((r) => r.id === b.resourceId),
    user: users
      .filter((u) => u.id === b.userId)
      .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }))[0],
  };
}

export const mockDb = {
  // auth
  async signIn(email: string, _password: string) {
    await delay();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw { status: 401, message: "Invalid credentials" };
    return { token: `mock-token.${user.id}`, user };
  },
  async signUp(input: { email: string; password: string; fullName: string }) {
    await delay();
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw { status: 409, message: "Email already exists" };
    }
    const user: AppUser = { id: uid("u"), email: input.email, fullName: input.fullName, role: "user" };
    users.push(user);
    return { token: `mock-token.${user.id}`, user };
  },
  async me(token: string | null) {
    await delay(50);
    if (!token) return null;
    const id = token.split(".")[1];
    return users.find((u) => u.id === id) ?? null;
  },

  // resources
  async listResources(filters: ResourceFilters = {}): Promise<Resource[]> {
    await delay();
    return resources.filter((r) => {
      if (filters.type && filters.type !== "all" && r.type !== filters.type) return false;
      if (filters.availability === "available" && !r.isAvailable) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },
  async getResource(id: string) {
    await delay();
    const r = resources.find((x) => x.id === id);
    if (!r) throw { status: 404, message: "Resource not found" };
    return r;
  },
  async createResource(input: CreateResourceInput): Promise<Resource> {
    await delay();
    const base = { id: uid("r"), createdAt: nowIso(), name: input.name, description: input.description, photoUrl: input.photoUrl, isAvailable: input.isAvailable };
    let r: Resource;
    if (input.type === "room") {
      r = { ...base, type: "room", location: input.location ?? "", capacity: input.capacity ?? 1, equipment: input.equipment ?? [] };
    } else if (input.type === "bike") {
      r = { ...base, type: "bike", licensePlate: input.licensePlate ?? "", fuelType: (input.fuelType as "gasoline" | "electric") ?? "gasoline", engineCc: input.engineCc };
    } else {
      r = { ...base, type: "car", licensePlate: input.licensePlate ?? "", fuelType: (input.fuelType as "gasoline" | "diesel" | "electric" | "hybrid") ?? "gasoline" };
    }
    resources.push(r);
    return r;
  },
  async updateResource(id: string, input: Partial<CreateResourceInput>): Promise<Resource> {
    await delay();
    const idx = resources.findIndex((r) => r.id === id);
    if (idx === -1) throw { status: 404, message: "Resource not found" };
    resources[idx] = { ...resources[idx], ...input } as Resource;
    return resources[idx];
  },
  async deleteResource(id: string) {
    await delay();
    resources = resources.filter((r) => r.id !== id);
  },

  // bookings
  async listBookings(filters: BookingFilters & { userId?: string } = {}): Promise<Paginated<Booking>> {
    await delay();
    let items = bookings.slice();
    if (filters.userId) items = items.filter((b) => b.userId === filters.userId);
    if (filters.status && filters.status !== "all") items = items.filter((b) => b.status === filters.status);
    if (filters.resourceId) items = items.filter((b) => b.resourceId === filters.resourceId);
    if (filters.from) items = items.filter((b) => b.date >= filters.from!);
    if (filters.to) items = items.filter((b) => b.date <= filters.to!);
    items = items.map(hydrateBooking).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return { items, page: 1, pageSize: items.length, total: items.length };
  },
  async getBooking(id: string): Promise<Booking> {
    await delay();
    const b = bookings.find((x) => x.id === id);
    if (!b) throw { status: 404, message: "Booking not found" };
    return hydrateBooking(b);
  },
  async createBooking(input: CreateBookingInput & { userId: string }): Promise<Booking> {
    await delay();
    const conflict = bookings.some((b) =>
      b.resourceId === input.resourceId &&
      b.date === input.date &&
      b.status !== "cancelled" && b.status !== "rejected" &&
      !(input.endTime <= b.startTime || input.startTime >= b.endTime)
    );
    if (conflict) throw { status: 409, message: "Time slot conflicts with another booking" };
    const b: Booking = {
      id: uid("b"), resourceId: input.resourceId, userId: input.userId,
      date: input.date, startTime: input.startTime, endTime: input.endTime,
      status: "pending", createdAt: nowIso(), updatedAt: nowIso(),
    };
    bookings.push(b);
    return hydrateBooking(b);
  },
  async updateBookingStatus(id: string, status: Booking["status"], adminNotes?: string): Promise<Booking> {
    await delay();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw { status: 404, message: "Booking not found" };
    bookings[idx] = { ...bookings[idx], status, adminNotes, updatedAt: nowIso() };
    return hydrateBooking(bookings[idx]);
  },
  async cancelBooking(id: string) {
    return mockDb.updateBookingStatus(id, "cancelled");
  },

  // proofs
  async listProofs(bookingId: string): Promise<Proof[]> {
    await delay();
    return proofs.filter((p) => p.bookingId === bookingId);
  },
  async uploadProof(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    await delay(400);
    const url = URL.createObjectURL(file);
    const p: Proof = { id: uid("p"), bookingId, kind, url, uploadedAt: nowIso() };
    proofs.push(p);
    return p;
  },

  // public
  async publicBookings(filters: BookingFilters = {}): Promise<Booking[]> {
    const { items } = await mockDb.listBookings(filters);
    return items.filter(
      (b) => b.status === "approved" || b.status === "completed" || b.status === "pending",
    );
  },

  // stats
  async stats() {
    await delay();
    return {
      totalResources: resources.length,
      totalBookings: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  },
};

export type Stats = Awaited<ReturnType<typeof mockDb.stats>>;