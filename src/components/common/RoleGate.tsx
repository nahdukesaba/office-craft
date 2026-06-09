import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export function RoleGate({ role, children }: { role: Role | Role[]; children: ReactNode }) {
  const { role: current } = useAuth();
  const allowed = Array.isArray(role) ? role : [role];
  if (!current || !allowed.includes(current)) return null;
  return <>{children}</>;
}