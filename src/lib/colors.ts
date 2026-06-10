const RESOURCE_PALETTE = [
  "#2563eb", // blue
  "#9333ea", // violet
  "#0d9488", // teal
  "#ea580c", // orange
  "#db2777", // pink
  "#65a30d", // lime
  "#0891b2", // cyan
  "#b45309", // amber
];

const cache = new Map<string, string>();

export function colorForResource(id: string): string {
  const hit = cache.get(id);
  if (hit) return hit;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const c = RESOURCE_PALETTE[h % RESOURCE_PALETTE.length];
  cache.set(id, c);
  return c;
}