export const qk = {
  auth: { me: ["auth", "me"] as const },
  resources: {
    all: ["resources"] as const,
    list: (filters?: unknown) => ["resources", "list", filters ?? {}] as const,
    detail: (id: string) => ["resources", "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (filters?: unknown) => ["bookings", "list", filters ?? {}] as const,
    mine: (filters?: unknown) => ["bookings", "mine", filters ?? {}] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },
  proofs: {
    list: (bookingId: string) => ["proofs", "list", bookingId] as const,
  },
  public: {
    bookings: (filters?: unknown) => ["public", "bookings", filters ?? {}] as const,
    resourceBookings: (resourceId: string) => ["public", "bookings", "resource", resourceId] as const,
  },
  stats: { overview: ["stats", "overview"] as const },
};