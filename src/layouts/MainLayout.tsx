import { useEffect, useRef, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { HeaderControls } from "@/components/common/HeaderControls";
import { SkipLink } from "@/components/common/SkipLink";

export function MainLayout({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const shownPath = useRef(pathname);

  // Opacity only, so the page change stays legible under reduced motion too.
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    mainRef.current?.animate({ opacity: [0.35, 1] }, { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  }, [pathname]);

  return (
    <SidebarProvider>
      <SkipLink />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <HeaderControls />
              <UserMenu />
            </div>
          </header>
          <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 p-4 outline-none sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}