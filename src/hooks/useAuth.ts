import { useAuthStore, selectIsAdmin, selectIsAuthed } from "@/stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAdmin = useAuthStore(selectIsAdmin);
  const isAuthed = useAuthStore(selectIsAuthed);
  const signOut = useAuthStore((s) => s.signOut);
  return { user, role, isAdmin, isAuthed, signOut };
}