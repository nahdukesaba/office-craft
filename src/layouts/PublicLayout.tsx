import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Resource Hub · Public booking calendar
      </footer>
    </div>
  );
}