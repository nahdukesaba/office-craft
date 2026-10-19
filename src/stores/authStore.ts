import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, AuthSession, Role } from "@/types";

interface AuthState {
  user: AppUser | null;
  token: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  expiresAt: number | null;
  role: Role | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setSession: (session: AuthSession) => void;
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
        }),
    }),
    { name: "auth-storage" },
  ),
);

export const selectIsAdmin = (state: AuthState) => state.role === "admin";
export const selectIsAuthed = (state: AuthState) => !!state.token && !!state.user;
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
