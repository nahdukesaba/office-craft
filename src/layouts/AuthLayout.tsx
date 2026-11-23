import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { HeaderControls } from "@/components/common/HeaderControls";
import { BrandMark } from "@/components/layout/BrandMark";
import { useT } from "@/i18n/LanguageProvider";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
    const t = useT();
    return (
        <main className="relative flex min-h-screen items-center justify-center bg-muted px-4 py-10">
            <div className="absolute right-4 top-4"><HeaderControls /></div>
            <div className="w-full max-w-md">
                <Link
                    to="/"
                    className="mb-4 inline-flex min-h-6 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 size-4" />
                    {t("action.goHome")}
                </Link>
                <div className="mb-6 flex justify-center">
                    <Link to="/">
                        <BrandMark size="lg" />
                    </Link>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="font-display text-xl font-semibold">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
            </div>
        </main>
    );
}