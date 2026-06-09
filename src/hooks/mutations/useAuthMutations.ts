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

export const useSignUp = () => {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.signUp(input),
    onSuccess: (s) => setSession(s),
  });
};