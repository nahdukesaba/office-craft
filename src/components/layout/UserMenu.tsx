import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export function UserMenu() {
  const { user, role, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const t = useT();
  if (!user) return null;
  const initials = user.fullName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
        <Avatar className="size-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium">{user.fullName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <span className="mt-1 text-xs uppercase text-muted-foreground">{role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await qc.cancelQueries();
            qc.clear();
            signOut();
            navigate({ to: "/", replace: true });
          }}
        >
          <LogOut className="mr-2 size-4" /> {t("action.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}