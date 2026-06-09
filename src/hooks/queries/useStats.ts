import { useQuery, queryOptions } from "@tanstack/react-query";
import { statsApi } from "@/services/api/public.api";
import { qk } from "@/lib/queryKeys";

export const statsQueryOptions = queryOptions({ queryKey: qk.stats.overview, queryFn: () => statsApi.overview() });
export const useStats = () => useQuery(statsQueryOptions);