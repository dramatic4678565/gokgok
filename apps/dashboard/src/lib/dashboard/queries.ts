"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, startOfDay } from "date-fns";

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useBoards } from "@/lib/hooks/useBoards";
import { useDashboardStore } from "@/lib/store/dashboardStore";

import type { ActiveFilter, Board, BoardQuery, SortBy } from "@/lib/types";

/** "Recent" means opened in the last seven days. */
const RECENT_WINDOW_DAYS = 7;

type Options = {
  /** Extra server-side constraints, e.g. `{ folder: id }` on a folder page. */
  params?: BoardQuery;
  /** `"none"` ignores the filter chips entirely — used by Trash, Recent, etc. */
  filter?: ActiveFilter | "none";
  /** Overrides the persisted sort. */
  sort?: SortBy;
  /** Pins the sort instead of reading it from the store. */
  lockSort?: boolean;
};

export type BoardCollection = {
  boards: Board[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

/**
 * The single place the dashboard turns UI state into a boards request, so the
 * Home, Favorites and folder pages cannot drift apart in how they search, sort
 * or filter.
 */
export function useBoardCollection({
  params,
  filter = "none",
  sort,
  lockSort = false,
}: Options = {}): BoardCollection {
  const storedSort = useDashboardStore((state) => state.sortBy);
  const search = useDashboardStore((state) => state.search);

  const debouncedSearch = useDebouncedValue(search, 300);
  const effectiveSort = lockSort ? (sort ?? "modified") : (sort ?? storedSort);
  const effectiveFilter = filter === "none" ? "all" : filter;

  const query = useBoards({
    sort: effectiveSort,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    // Favourites is a server-side filter because it is in the boards contract.
    ...(effectiveFilter === "favorites" ? { favorite: true } : {}),
    ...params,
  });

  const boards = useMemo(() => {
    const rows = query.data ?? [];

    // `recent` and `shared` have no server-side counterpart, so they are applied
    // here. Doing it in one place keeps the chips and the query in agreement.
    if (effectiveFilter === "recent") {
      const cutoff = startOfDay(new Date());
      cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);

      return rows.filter((board) => {
        if (!board.lastOpenedAt) {
          return false;
        }
        return (
          differenceInCalendarDays(new Date(), new Date(board.lastOpenedAt)) <=
          RECENT_WINDOW_DAYS
        );
      });
    }

    if (effectiveFilter === "shared") {
      return rows.filter((board) => board.isShared);
    }

    return rows;
  }, [query.data, effectiveFilter]);

  return {
    boards,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}
