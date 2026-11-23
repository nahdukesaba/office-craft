const SSO_RETURN_KEY = "silapet.ssoReturnTo";

/** Accepts only same-site paths, so a crafted ?redirect= cannot leave the app. */
export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const safe = value.startsWith("/") && !value.startsWith("//") && !/[\\#\p{Cc}]/u.test(value);
  return safe ? value : undefined;
}

export function rememberSsoReturn(path?: string): void {
  try {
    if (path) sessionStorage.setItem(SSO_RETURN_KEY, path);
    else sessionStorage.removeItem(SSO_RETURN_KEY);
  } catch {
    // Blocked storage only loses the deep link; sign-in still lands on the default page.
  }
}

export function takeSsoReturn(): string | undefined {
  try {
    const path = safeReturnPath(sessionStorage.getItem(SSO_RETURN_KEY));
    sessionStorage.removeItem(SSO_RETURN_KEY);
    return path;
  } catch {
    return undefined;
  }
}
