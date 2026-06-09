import { env } from "@/lib/env";
import { mockDb } from "@/services/mocks/db";
import { http } from "@/services/http";
import type { CreateResourceInput, Resource, ResourceFilters } from "@/types";

export const resourcesApi = {
  async list(filters: ResourceFilters = {}): Promise<Resource[]> {
    if (env.useMocks) return mockDb.listResources(filters);
    const { data } = await http.get<Resource[]>("/resources", { params: filters });
    return data;
  },
  async get(id: string): Promise<Resource> {
    if (env.useMocks) return mockDb.getResource(id);
    const { data } = await http.get<Resource>(`/resources/${id}`);
    return data;
  },
  async create(input: CreateResourceInput): Promise<Resource> {
    if (env.useMocks) return mockDb.createResource(input);
    const { data } = await http.post<Resource>("/resources", input);
    return data;
  },
  async update(id: string, input: Partial<CreateResourceInput>): Promise<Resource> {
    if (env.useMocks) return mockDb.updateResource(id, input);
    const { data } = await http.put<Resource>(`/resources/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    if (env.useMocks) return mockDb.deleteResource(id);
    await http.delete(`/resources/${id}`);
  },
};