import type { UserStatus } from "@/types";

export type UserStatusAction = "approve" | "reject";

const actionsByStatus: Record<UserStatus, readonly UserStatusAction[]> = {
  pending: ["approve", "reject"],
  approved: ["reject"],
  rejected: ["approve"],
  disabled: [],
};

export function getUserStatusActions(status: UserStatus): readonly UserStatusAction[] {
  return actionsByStatus[status];
}
