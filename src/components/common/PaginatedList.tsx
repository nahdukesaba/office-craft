import { useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { useT } from "@/i18n/LanguageProvider";
import { visiblePages } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { Paginated } from "@/types";

export function PaginatedList({
  page,
  data,
  busy = false,
  onPageChange,
  children,
}: {
  page: number;
  data?: Paginated<unknown>;
  busy?: boolean;
  onPageChange: (page: number) => void;
  children: ReactNode;
}) {
  const t = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const totalPages = data?.totalPages ?? 1;
  const lastPage = Math.max(totalPages, 1);
  const outOfRange = Boolean(data) && !busy && page > lastPage;

  // Approving or cancelling the last row of the last page can remove that page.
  useEffect(() => {
    if (outOfRange) onPageChange(lastPage);
  }, [outOfRange, lastPage, onPageChange]);

  function go(next: number) {
    onPageChange(next);
    rootRef.current?.scrollIntoView({ block: "start" });
    // The clicked button can become disabled, so keep keyboard focus on the list.
    rootRef.current?.focus({ preventScroll: true });
  }

  const pageSize = data?.pageSize ?? 0;
  const total = data?.total ?? 0;

  return (
    <div ref={rootRef} tabIndex={-1} aria-busy={busy} className="scroll-mt-20 space-y-3 outline-none">
      <div className={cn("transition-opacity duration-150", busy && "opacity-60")}>
        {outOfRange ? null : children}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
            {t("pagination.showing")} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
            {t("pagination.of")} {total}
          </p>
          <Pagination aria-label={t("pagination.label")} className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("pagination.previous")}
                  disabled={page <= 1}
                  onClick={() => go(page - 1)}
                >
                  <ChevronLeft />
                </Button>
              </PaginationItem>
              <PaginationItem className="px-2 text-sm tabular-nums sm:hidden">
                {page} / {lastPage}
              </PaginationItem>
              {visiblePages(page, totalPages).map((item) => (
                <PaginationItem key={item} className="hidden sm:block">
                  {typeof item === "number" ? (
                    <Button
                      variant={item === page ? "outline" : "ghost"}
                      size="icon"
                      className="tabular-nums"
                      aria-label={`${t("pagination.page")} ${item}`}
                      aria-current={item === page ? "page" : undefined}
                      onClick={() => item !== page && go(item)}
                    >
                      {item}
                    </Button>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("pagination.next")}
                  disabled={page >= lastPage}
                  onClick={() => go(page + 1)}
                >
                  <ChevronRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
