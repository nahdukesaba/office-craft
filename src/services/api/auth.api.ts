import { http, sessionHttp } from "@/services/http";
import type {
  AppUser,
  AuthSession,
  BrowserSSOExchangeInput,
  BrowserSSOExchangeResponse,
  ChangePasswordInput,
  LoginInput,
  LogoutResponse,
  RegisterInput,
} from "@/types";

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
  async me(): Promise<AppUser> {
    const { data } = await http.get<AppUser>("/auth/me");
    return data;
  },
  async refresh(): Promise<AuthSession> {
    const { data } = await sessionHttp.post<AuthSession>("/auth/refresh");
    return data;
  },
  async exchangeBrowserSSO(input: BrowserSSOExchangeInput): Promise<BrowserSSOExchangeResponse> {
    const { data } = await sessionHttp.post<BrowserSSOExchangeResponse>(
      "/auth/sso/exchange",
      input,
    );
    return data;
  },
  async forgotPassword(email: string): Promise<void> {
    await http.post("/auth/forgot-password", { email });
  },
  async resetPassword(tokenHash: string, password: string): Promise<void> {
    await http.post("/auth/reset-password", {
      tokenHash,
      password,
    });
  },
  async logout(): Promise<LogoutResponse> {
    const { data } = await http.post<LogoutResponse>("/auth/logout");
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
