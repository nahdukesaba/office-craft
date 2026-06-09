import { env } from "@/lib/env";
import { mockDb } from "@/services/mocks/db";
import { http } from "@/services/http";
import type { AppUser, AuthSession, LoginInput, RegisterInput } from "@/types";

export const authApi = {
  async signIn(input: LoginInput): Promise<AuthSession> {
    if (env.useMocks) return mockDb.signIn(input.email, input.password);
    const { data } = await http.post<AuthSession>("/auth/login", input);
    return data;
  },
  async signUp(input: RegisterInput): Promise<AuthSession> {
    if (env.useMocks) return mockDb.signUp(input);
    const { data } = await http.post<AuthSession>("/auth/register", input);
    return data;
  },
  async me(token: string | null): Promise<AppUser | null> {
    if (env.useMocks) return mockDb.me(token);
    const { data } = await http.get<AppUser>("/auth/me");
    return data;
  },
};