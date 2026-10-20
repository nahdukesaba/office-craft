import { http } from "@/services/http";
import type { CreateResourceInput, Resource, ResourceFilters } from "@/types";

/** Backend Data API. `Resource` mirrors the resources endpoint response. */
export const resourcesApi = {
  async list(filters: ResourceFilters = {}): Promise<Resource[]> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.availability && filters.availability !== "all") params.availability = filters.availability;
    const { data } = await http.get<Resource[] | { data: Resource[] }>("/resources", { params });
    return Array.isArray(data) ? data : data.data;
  },
  async get(id: string): Promise<Resource> {
    const { data } = await http.get<Resource | { data: Resource }>(`/resources/${id}`);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async create(input: CreateResourceInput): Promise<Resource> {
    const { data } = await http.post<Resource | { data: Resource }>("/resources", input);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async update(id: string, input: Partial<CreateResourceInput>): Promise<Resource> {
    const { data } = await http.put<Resource | { data: Resource }>(`/resources/${id}`, input);
    return (data as { data?: Resource }).data ?? (data as Resource);
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/resources/${id}`);
  },
  async uploadPhoto(file: File): Promise<string> {
    if (!file || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      throw new Error("Image must be between 1 byte and 10 MiB");
    }
    if (file.type && !file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await http.post<{ photoUrl?: string; data?: { photoUrl?: string } }>(
      "/resources/photos/upload",
      formData,
    );
    const photoUrl = data.photoUrl ?? data.data?.photoUrl;
    if (!photoUrl) {
      throw new Error("Upload did not return a photo URL");
    }
    return photoUrl;
  },
};
