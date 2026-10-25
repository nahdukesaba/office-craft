import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { logoutDestination } from "./logout.ts";

test("Browser SSO logout enters the Central logout flow", () => {
  assert.equal(
    logoutDestination({ centralLogoutRequired: true }, "http://localhost:8080/api"),
    "http://localhost:8080/api/auth/sso/logout",
  );
  assert.equal(
    logoutDestination({ centralLogoutRequired: true }, "http://localhost:8080/api", "/bookings/123?page=2"),
    "http://localhost:8080/api/auth/sso/logout?cancel_return=%2Fbookings%2F123%3Fpage%3D2",
  );
  assert.equal(
    logoutDestination({ centralLogoutRequired: true }, "http://localhost:8080/api", "https://evil.example"),
    "http://localhost:8080/api/auth/sso/logout",
  );
});

test("direct logout returns to login without entering Central logout", () => {
  assert.equal(
    logoutDestination({ centralLogoutRequired: false }, "http://localhost:8080/api"),
    "/login",
  );
  assert.equal(
    logoutDestination({ centralLogoutRequired: false }, "http://localhost:8080/api", "/bookings/123"),
    "/login",
  );
});

test("failed application logout uses the safe local login destination", () => {
  assert.equal(logoutDestination(null, "http://localhost:8080/api"), "/login");
});

test("user menu keeps one logout action and does not infer login source in the browser", async () => {
  const source = await readFile(
    new URL("../../components/layout/UserMenu.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(source.match(/t\("action\.signOut"\)/g)?.length, 1);
  assert.doesNotMatch(source, /document\.referrer|localStorage/);
  assert.ok(source.indexOf("authApi.logout()") < source.indexOf("signOut()"));
  assert.match(source, /if \(centralLogoutRequired\)\s*\{\s*const currentPath[\s\S]*?window\.location\.assign\(logoutDestination\(result, env\.apiBaseUrl, currentPath\)\);\s*return;/);
  assert.doesNotMatch(source, /finally\s*\{/);
  assert.ok(source.indexOf("return;", source.indexOf("if (centralLogoutRequired)")) < source.indexOf("signOut()"));
});

test("Central return revalidates the preserved cookie and restores the app-owned role route", async () => {
  const login = await readFile(new URL("../../routes/login.tsx", import.meta.url), "utf8");
  const bootstrap = await readFile(new URL("../../services/auth-bootstrap.ts", import.meta.url), "utf8");
  assert.match(login, /useAuthBootstrap\(\)/);
  assert.match(login, /bootstrapStatus !== "ready"/);
  assert.match(login, /user\.role === "admin" \? "\/admin" : "\/dashboard"/);
  assert.match(bootstrap, /authApi\s*\.me\(\)/);
  assert.match(bootstrap, /current\.invalidateSession\("INVALID_TOKEN"\)/);
});
