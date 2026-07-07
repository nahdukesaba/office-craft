import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import type { LoginInput, RegisterInput } from "@/types";

export const useSignIn = () => {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.signIn(input),
    onSuccess: (s) => setSession(s),
  });
};

/**
 * Register does NOT auto-login. The backend returns just the created user;
 * an admin must approve the account before it can sign in.
 */
export const useSignUp = () =>
  useMutation({
    mutationFn: (input: RegisterInput) => authApi.signUp(input),
  });