import type { ReactNode } from "react";
import { HeaderControls } from "@/components/common/HeaderControls";
import { BrandMark } from "@/components/layout/BrandMark";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="absolute right-4 top-4"><HeaderControls /></div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandMark size="lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}