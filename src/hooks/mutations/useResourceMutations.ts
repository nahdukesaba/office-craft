import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "@/services/api/resources.api";
import { qk } from "@/lib/queryKeys";
import type { CreateResourceInput } from "@/types";

export const useCreateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResourceInput) => resourcesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resources.all }),
  });
};

export const useUpdateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateResourceInput> }) => resourcesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resources.all }),
  });
};

export const useDeleteResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourcesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resources.all }),
  });
};