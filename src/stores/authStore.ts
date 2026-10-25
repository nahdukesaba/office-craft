import { create } from "zustand";
import type { AppUser, AuthSession, Role } from "@/types";

export type AuthBootstrapStatus = "idle" | "loading" | "ready" | "error";
export type AuthIssue =
  | "ACCOUNT_PENDING_APPROVAL"
  | "ACCOUNT_REJECTED"
  | "ACCOUNT_DISABLED"
  | "ACCOUNT_UNAVAILABLE"
  | "APPLICATION_ACCESS_UNAVAILABLE"
  | "INVALID_REFRESH_TOKEN"
  | "INVALID_TOKEN"
  | null;

export interface AuthState {
  user: AppUser | null;
  role: Role | null;
  authenticated: boolean;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  hydrated: boolean;
  bootstrapStatus: AuthBootstrapStatus;
  bootstrapError: string | null;
  authIssue: AuthIssue;
  setSession: (session: AuthSession) => void;
  setAuthoritativeUser: (user: AppUser) => void;
  setHydrated: (hydrated: boolean) => void;
  setBootstrapState: (status: AuthBootstrapStatus, error?: string | null) => void;
  invalidateSession: (issue: AuthIssue) => void;
  updateUser: (patch: Partial<AppUser>) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  authenticated: false,
  status: "idle",
  hydrated: true,
  bootstrapStatus: "idle",
  bootstrapError: null,
  authIssue: null,

  setSession: (session) =>
    set({
      user: session.user,
      role: session.user.role,
      authenticated: true,
      status: "authenticated",
      bootstrapStatus: "ready",
      bootstrapError: null,
      authIssue: null,
    }),

  setAuthoritativeUser: (user) =>
    set({
      user,
      role: user.role,
      authenticated: true,
      status: "authenticated",
      bootstrapStatus: "ready",
      bootstrapError: null,
      authIssue: null,
    }),

  setHydrated: (hydrated) => set({ hydrated }),
  setBootstrapState: (bootstrapStatus, bootstrapError = null) =>
    set({ bootstrapStatus, bootstrapError }),

  invalidateSession: (authIssue) =>
    set({
      user: null,
      role: null,
      authenticated: false,
      status: "unauthenticated",
      bootstrapStatus: "ready",
      bootstrapError: null,
      authIssue,
    }),

  updateUser: (patch) =>
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...patch };
      return { user: updatedUser, role: updatedUser.role ?? state.role };
    }),

  signOut: () =>
    set({
      user: null,
      role: null,
      authenticated: false,
      status: "unauthenticated",
      bootstrapStatus: "ready",
      bootstrapError: null,
      authIssue: null,
    }),
}));

export const selectIsAdmin = (state: AuthState) =>
  state.bootstrapStatus === "ready" && state.authenticated && state.role === "admin";
export const selectIsAuthed = (state: AuthState) =>
  state.bootstrapStatus === "ready" &&
  state.authenticated &&
  !!state.user &&
  state.user.status === "approved";
export const selectIsPending = (state: AuthState) => state.user?.status === "pending";
export const selectIsRejected = (state: AuthState) => state.user?.status === "rejected";
