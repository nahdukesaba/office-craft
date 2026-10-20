import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/api/users.api";

export const useApproveUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useRejectUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};
