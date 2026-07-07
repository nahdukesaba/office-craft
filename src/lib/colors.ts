import type { Resource } from "@/types";

export const RESOURCE_PALETTE = [
  "#86700A", // gold   — brand hue (Khaki family)
  "#4C8141", // green
  "#007D71", // cyan
  "#007EA2", // teal   — brand hue (Midnight Green family)
  "#5F6BB1", // indigo
  "#8E5B99", // magenta
  "#A65469", // red
  "#A45C31", // orange
];

const cache = new Map<string, string>();

export function colorForResource(idOrResource: string | Resource, resource?: Resource): string {
  const id = typeof idOrResource === "string" ? idOrResource : idOrResource.id;
  const r = typeof idOrResource === "string" ? resource : idOrResource;
  if (r?.color) return r.color;
  const hit = cache.get(id);
  if (hit) return hit;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const c = RESOURCE_PALETTE[h % RESOURCE_PALETTE.length];
  cache.set(id, c);
  return c;
}