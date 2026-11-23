import assert from "node:assert/strict";
import test from "node:test";
import { safeReturnPath } from "./returnPath.ts";

test("keeps in-app booking links", () => {
  assert.equal(safeReturnPath("/my-bookings/abc"), "/my-bookings/abc");
  assert.equal(safeReturnPath("/admin/bookings/abc?page=2"), "/admin/bookings/abc?page=2");
});

test("rejects anything that could leave the app", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/a#b",
    "abc",
    "",
    null,
    42,
  ]) {
    assert.equal(safeReturnPath(value), undefined, String(value));
  }
});
