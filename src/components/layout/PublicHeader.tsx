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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-2">
          <HeaderControls />
          {isAuthed ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/dashboard">{t("nav.dashboard")}</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/resources">{t("nav.resources")}</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">{t("action.signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">{t("action.createAccount")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}