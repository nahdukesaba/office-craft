import { useQuery, queryOptions } from "@tanstack/react-query";
import { resourcesApi } from "@/services/api/resources.api";
import { qk } from "@/lib/queryKeys";
import type { ResourceFilters } from "@/types";

export const resourcesQueryOptions = (filters: ResourceFilters = {}) =>
  queryOptions({ queryKey: qk.resources.list(filters), queryFn: () => resourcesApi.list(filters) });

export const resourceQueryOptions = (id: string) =>
  queryOptions({ queryKey: qk.resources.detail(id), queryFn: () => resourcesApi.get(id) });

export const useResources = (filters: ResourceFilters = {}) => useQuery(resourcesQueryOptions(filters));
export const useResource = (id: string) => useQuery(resourceQueryOptions(id));