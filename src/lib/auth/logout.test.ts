import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { logoutDestination } from "./logout.ts";

test("Browser SSO logout enters the Central logout flow", () => {
  assert.equal(
    logoutDestination({ centralLogoutRequired: true }, "http://localhost:8080/api"),
    "http://localhost:8080/api/auth/sso/logout",
  );
});

test("direct logout returns to login without entering Central logout", () => {
  assert.equal(
    logoutDestination({ centralLogoutRequired: false }, "http://localhost:8080/api"),
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
  assert.doesNotMatch(source, /document\.referrer|localStorage|location\.search/);
  assert.ok(source.indexOf("authApi.logout()") < source.indexOf("signOut()"));
  assert.ok(source.indexOf("signOut()") < source.indexOf("logoutDestination("));
});
