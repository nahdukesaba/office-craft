import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "./UserMenu";
import { HeaderControls } from "@/components/common/HeaderControls";
import { BrandMark } from "@/components/layout/BrandMark";
import { useT } from "@/i18n/LanguageProvider";

export function PublicHeader() {
  const { isAuthed } = useAuth();
  const t = useT();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex min-h-14 flex-wrap items-center gap-x-2 gap-y-2 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
          <Link to="/" className="min-w-0 flex-1">
            <BrandMark />
          </Link>

          <HeaderControls className="shrink-0 gap-1 sm:gap-2" />

          <nav
            className={
              isAuthed
                ? "flex w-full items-center gap-2 sm:w-auto sm:shrink-0"
                : "hidden items-center gap-2 sm:flex sm:w-auto sm:shrink-0"
            }
          >
            {isAuthed ? (
              <>
                <Button asChild size="sm" variant="ghost" className="flex-1 sm:flex-none">
                  <Link to="/dashboard">{t("nav.dashboard")}</Link>
                </Button>

                <Button asChild size="sm" variant="ghost" className="flex-1 sm:flex-none">
                  <Link to="/resources">{t("nav.resources")}</Link>
                </Button>

                <UserMenu />
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="flex-1 sm:flex-none">
                  <Link to="/login">{t("action.signIn")}</Link>
                </Button>

                <Button asChild size="sm" className="flex-1 sm:flex-none">
                  <Link to="/register">{t("action.createAccount")}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
