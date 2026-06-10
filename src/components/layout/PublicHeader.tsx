import { Link } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "./UserMenu";

export function PublicHeader() {
  const { isAuthed } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Boxes className="size-5" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Resource Hub</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to="/resources">Resources</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Create account</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}