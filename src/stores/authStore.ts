import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, Role } from "@/types";

interface AuthState {
  user: AppUser | null;
  token: string | null;
  role: Role | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setSession: (s: { user: AppUser; token: string }) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      status: "idle",
      setSession: ({ user, token }) =>
        set({ user, token, role: user.role, status: "authenticated" }),
      signOut: () => set({ user: null, token: null, role: null, status: "unauthenticated" }),
    }),
    { name: "auth-storage" },
  ),
);

export const selectIsAdmin = (s: AuthState) => s.role === "admin";
export const selectIsAuthed = (s: AuthState) => !!s.token && !!s.user;