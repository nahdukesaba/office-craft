import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicLayout } from "@/layouts/PublicLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { CalendarView } from "@/components/calendar/CalendarView";
import { usePublicBookings } from "@/hooks/queries/useBookings";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booking Calendar · SILAPET" },
      {
        name: "description",
        content:
          "Browse the public booking calendar for rooms and cars. Sign in to request a booking or upload proofs.",
      },
      { property: "og:title", content: "Booking Calendar · SILAPET" },
      { property: "og:description", content: "See who has booked which resource and when." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { isAuthed } = useAuth();
  const now = new Date();
  const [ym, setYm] = useState<{ year: number; month: number }>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const { data, isLoading } = usePublicBookings({ year: ym.year, month: ym.month });
  const t = useT();
  const Layout = isAuthed ? MainLayout : PublicLayout;
  const handleMonthChange = useCallback((year: number, month: number) => {
    setYm((current) =>
      current.year === year && current.month === month ? current : { year, month },
    );
  }, []);

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("home.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAuthed ? t("home.descAuth") : t("home.descAnon")}
          </p>
        </div>
        {!isAuthed && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/login">{t("action.signIn")}</Link>
            </Button>
            <Button asChild>
              <Link to="/register">{t("action.createAccount")}</Link>
            </Button>
          </div>
        )}
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <CalendarView bookings={data ?? []} onMonthChange={handleMonthChange} />
      )}
    </Layout>
  );
}
