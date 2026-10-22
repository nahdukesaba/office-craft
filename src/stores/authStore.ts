import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  token: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  expiresAt: number | null;
  role: Role | null;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      tokenType: null,
      expiresIn: null,
      expiresAt: null,
      role: null,
      status: "idle",
      hydrated: false,
      bootstrapStatus: "idle",
      bootstrapError: null,
      authIssue: null,

      setSession: (session) =>
        set({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
          tokenType: session.tokenType,
          expiresIn: session.expiresIn,
          expiresAt: session.expiresAt,
          role: session.user.role,
          status: "authenticated",
          bootstrapStatus: "ready",
          bootstrapError: null,
          authIssue: null,
        }),

      setAuthoritativeUser: (user) =>
        set({
          user,
          role: user.role,
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
          token: null,
          refreshToken: null,
          tokenType: null,
          expiresIn: null,
          expiresAt: null,
          role: null,
          status: "unauthenticated",
          bootstrapStatus: "ready",
          bootstrapError: null,
          authIssue,
        }),

      updateUser: (patch) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = {
            ...state.user,
            ...patch,
          };
          return {
            user: updatedUser,
            role: updatedUser.role ?? state.role,
          };
        }),

      signOut: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenType: null,
          expiresIn: null,
          expiresAt: null,
          role: null,
          status: "unauthenticated",
          bootstrapStatus: "ready",
          bootstrapError: null,
          authIssue: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        expiresIn: state.expiresIn,
        expiresAt: state.expiresAt,
        role: state.role,
        status: state.status,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsAdmin = (state: AuthState) =>
  state.bootstrapStatus === "ready" && state.role === "admin";
export const selectIsAuthed = (state: AuthState) =>
  state.bootstrapStatus === "ready" &&
  !!state.token &&
  !!state.user &&
  state.user.status === "approved";
export const selectIsPending = (state: AuthState) => state.user?.status === "pending";
export const selectIsRejected = (state: AuthState) => state.user?.status === "rejected";

export function syncAuthStoreFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage?.getItem("auth-storage");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: Partial<AuthState> };
    const stored = parsed?.state;
    if (!stored || typeof stored !== "object") return;

    const current = useAuthStore.getState();
    if (
      stored.token !== current.token ||
      stored.refreshToken !== current.refreshToken ||
      stored.status !== current.status
    ) {
      useAuthStore.setState({
        user: stored.user ?? null,
        token: stored.token ?? null,
        refreshToken: stored.refreshToken ?? null,
        tokenType: stored.tokenType ?? null,
        expiresIn: stored.expiresIn ?? null,
        expiresAt: stored.expiresAt ?? null,
        role: stored.role ?? null,
        status: stored.status ?? "idle",
        bootstrapStatus: stored.token ? "idle" : "ready",
        bootstrapError: null,
        authIssue: null,
      });
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (event) => {
    if (event.key === "auth-storage" || event.key === null) {
      syncAuthStoreFromStorage();
    }
  });
}
