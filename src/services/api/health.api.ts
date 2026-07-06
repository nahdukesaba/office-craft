import { http } from "@/services/http";

/** Backend connectivity smoke test — GET /health returns { status: "ok" }. */
export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await http.get<{ status: string }>("/health");
    return data?.status === "ok";
  } catch {
    return false;
  }
}