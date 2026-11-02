import assert from "node:assert/strict";
import test from "node:test";

import { getUserStatusActions } from "./userStatusTransitions.ts";

test("pending users can be approved or rejected", () => {
  assert.deepEqual(getUserStatusActions("pending"), ["approve", "reject"]);
});

test("approved users can be rejected", () => {
  assert.deepEqual(getUserStatusActions("approved"), ["reject"]);
});

test("rejected users can be approved again", () => {
  assert.deepEqual(getUserStatusActions("rejected"), ["approve"]);
});

test("disabled users have no moderation action", () => {
  assert.deepEqual(getUserStatusActions("disabled"), []);
});
