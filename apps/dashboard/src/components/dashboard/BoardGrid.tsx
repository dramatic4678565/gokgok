"use client";

import { BoardCard } from "@/components/dashboard/BoardCard";
import { BoardListRow } from "@/components/dashboard/BoardListRow";
import {
  BoardGridSkeleton,
  SkeletonGrid,
  SkeletonList,
} from "@/components/dashboard/SkeletonGrid";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { Board, ViewMode } from "@/lib/types";

const GRID_CLASSES =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

type BoardGridProps = {
  boards: Board[];
  isLoading?: boolean;
  /** Rendered when `boards` is empty and loading has finished. */
  emptyState?: React.ReactNode;
  className?: string;
};

/**
 * Renders boards in the view mode chosen in the topbar. Loading and empty are
 * handled here so Home, Favorites and the folder pages all get the same
 * skeleton, the same breakpoints and the same transition between grid and list.
 */
export function BoardGrid({
  boards,
  isLoading = false,
  emptyState,
  className,
}: BoardGridProps) {
  const viewMode = useDashboardStore((state) => state.viewMode);

  if (isLoading) {
    return viewMode === "grid" ? (
      <>
        <BoardGridSkeleton />
        <SkeletonGrid />
      </>
    ) : (
      <>
        <BoardGridSkeleton />
        <SkeletonList />
      </>
    );
  }

  if (boards.length === 0) {
    return <>{emptyState}</>;
  }

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "divide-y divide-border overflow-hidden rounded-xl border border-border bg-card",
          className,
        )}
      >
        {boards.map((board) => (
          <BoardListRow key={board.id} board={board} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(GRID_CLASSES, className)}>
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}

/** Exported for pages that need the column classes outside the grid. */
export { GRID_CLASSES };
export type { ViewMode };
