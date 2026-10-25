import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (relativePath: string) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), "utf8");

test("auth store contains presentation state only", async () => {
  const store = await source("stores/authStore.ts");

  assert.doesNotMatch(store, /persist\s*\(/);
  assert.doesNotMatch(store, /localStorage/);
  assert.doesNotMatch(store, /refreshToken/);
  assert.doesNotMatch(store, /\btoken\s*:/);
});

test("shared HTTP clients use cookies without browser bearer headers", async () => {
  const client = await source("services/http.ts");

  assert.match(client, /withCredentials:\s*true/g);
  assert.match(client, /sessionHttp\.post<AuthSession>\("\/auth\/refresh"\)/);
  assert.doesNotMatch(client, /Authorization|Bearer|refreshToken/);
});

test("browser bootstrap and SSO callback accept only public user data", async () => {
  const [bootstrap, callback, types] = await Promise.all([
    source("services/auth-bootstrap.ts"),
    source("routes/auth.sso.callback.tsx"),
    source("types/index.ts"),
  ]);

  assert.match(bootstrap, /authApi\s*\.me\(\)/);
  assert.doesNotMatch(callback, /accessToken|refreshToken|\bsid\b/);
  assert.doesNotMatch(types, /refreshToken|accessToken|\bsid\??:/);
});
