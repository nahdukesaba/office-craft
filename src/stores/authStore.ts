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
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  ...patch,
                },
              }
            : state,
        ),

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
