export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Loads every page in order. Rows that shift between pages mid-load are kept once. */
export async function fetchAllPages<T extends { id: string }>(
  fetchPage: (page: number) => Promise<{ items: T[]; totalPages?: number }>,
): Promise<T[]> {
  const byId = new Map<string, T>();
  for (let page = 1; ; page++) {
    const { items, totalPages = 1 } = await fetchPage(page);
    items.forEach((item) => byId.set(item.id, item));
    if (page >= totalPages || items.length === 0) return [...byId.values()];
  }
}

/** Page buttons to show: always first and last, the current neighborhood, and at most 7 slots. */
export function visiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const [start, end] =
    page <= 4
      ? [2, 5]
      : page >= totalPages - 3
        ? [totalPages - 4, totalPages - 1]
        : [page - 1, page + 1];
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return [
    1,
    ...(start > 2 ? (["ellipsis-start"] as const) : []),
    ...middle,
    ...(end < totalPages - 1 ? (["ellipsis-end"] as const) : []),
    totalPages,
  ];
}
