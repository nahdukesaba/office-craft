import { http } from "@/services/http";
import type { AppUser, AuthSession, ChangePasswordInput, LoginInput, RegisterInput } from "@/types";

/** Auth is always live against the backend (per Chunk 2 plan). */
export const authApi = {
  async signIn(input: LoginInput): Promise<AuthSession> {
    const { data } = await http.post<AuthSession>("/auth/login", input);
    return data;
  },
  /** Register returns just the created user (no token); admin must approve. */
  async signUp(input: RegisterInput): Promise<{ user: AppUser }> {
    const { data } = await http.post<{ user: AppUser }>("/auth/register", input);
    return data;
  },
  async me(_token: string | null): Promise<AppUser | null> {
    const { data } = await http.get<AppUser>("/auth/me");
    return data;
  },
  async changePassword(input: ChangePasswordInput): Promise<void> {
    await http.put("/auth/password", input);
  },
  /**
   * ASSUMPTION: no self-service profile-update endpoint existed in this
   * codebase yet, so this follows the existing /auth/password convention
   * (PUT under /auth for actions on the caller's own account). Confirm
   * this route exists on the backend, or update it to match.
   */
  async updatePhone(input: { phone: string }): Promise<void> {
    await http.put("/auth/phone", input);
  },
};
