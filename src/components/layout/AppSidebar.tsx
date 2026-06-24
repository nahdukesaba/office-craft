import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/config/nav";
import { useAuth } from "@/hooks/useAuth";
import { HeaderControls } from "@/components/common/HeaderControls";
import { useT } from "@/i18n/LanguageProvider";

export function AppSidebar() {
  const { role } = useAuth();
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV_ITEMS.filter((i) => role && i.roles.includes(role));
  const userItems = items.filter((i) => !i.to.startsWith("/admin"));
  const adminItems = items.filter((i) => i.to.startsWith("/admin"));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-start gap-2 px-3 py-3">
        <Boxes className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{t("app.name")}</span>
          <span className="truncate text-[10px] text-muted-foreground">{t("app.fullName")}</span>
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to || pathname.startsWith(item.to + "/")}>
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.admin")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={pathname === item.to}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="px-3 py-3">
        <HeaderControls />
      </SidebarFooter>
    </Sidebar>
  );
}