import assert from "node:assert/strict";
import test from "node:test";

import { fetchAllPages, visiblePages } from "./pagination.ts";

test("fetchAllPages returns every row across pages in order", async () => {
  const pages = [[{ id: "a" }, { id: "b" }], [{ id: "c" }, { id: "d" }], [{ id: "e" }]];
  const asked: number[] = [];
  const rows = await fetchAllPages(async (page) => {
    asked.push(page);
    return { items: pages[page - 1], totalPages: pages.length };
  });
  assert.deepEqual(asked, [1, 2, 3]);
  assert.deepEqual(
    rows.map((r) => r.id),
    ["a", "b", "c", "d", "e"],
  );
});

test("fetchAllPages keeps a row once when it shifts between pages", async () => {
  const pages = [
    [{ id: "a" }, { id: "b" }],
    [{ id: "b" }, { id: "c" }],
  ];
  const rows = await fetchAllPages(async (page) => ({ items: pages[page - 1], totalPages: 2 }));
  assert.deepEqual(
    rows.map((r) => r.id),
    ["a", "b", "c"],
  );
});

test("fetchAllPages stops on an empty result", async () => {
  let calls = 0;
  const rows = await fetchAllPages<{ id: string }>(async () => {
    calls++;
    return { items: [], totalPages: 5 };
  });
  assert.equal(calls, 1);
  assert.deepEqual(rows, []);
});

test("short lists show every page", () => {
  assert.deepEqual(visiblePages(1, 1), [1]);
  assert.deepEqual(visiblePages(3, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test("long lists collapse only the side away from the current page", () => {
  assert.deepEqual(visiblePages(1, 10), [1, 2, 3, 4, 5, "ellipsis-end", 10]);
  assert.deepEqual(visiblePages(4, 10), [1, 2, 3, 4, 5, "ellipsis-end", 10]);
  assert.deepEqual(visiblePages(7, 10), [1, "ellipsis-start", 6, 7, 8, 9, 10]);
  assert.deepEqual(visiblePages(10, 10), [1, "ellipsis-start", 6, 7, 8, 9, 10]);
});

test("middle pages collapse both sides and keep the current page", () => {
  assert.deepEqual(visiblePages(5, 10), [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 10]);
  assert.deepEqual(visiblePages(6, 10), [1, "ellipsis-start", 5, 6, 7, "ellipsis-end", 10]);
});

test("every page from 1 to N is reachable and appears once", () => {
  for (let total = 1; total <= 40; total++) {
    for (let page = 1; page <= total; page++) {
      const numbers = visiblePages(page, total).filter((x) => typeof x === "number");
      assert.ok(numbers.includes(page));
      assert.ok(numbers.includes(1) && numbers.includes(total));
      assert.equal(new Set(numbers).size, numbers.length);
    }
  }
});
