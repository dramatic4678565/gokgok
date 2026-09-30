"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchActivity } from "@/lib/api/activity";

import type { ActivityType } from "@/lib/types";

export const ACTIVITY_KEYS = {
  all: ["activity"] as const,
  list: (type: ActivityType | "all") => ["activity", "list", type] as const,
};

/**
 * `GET /api/activity?page=&type=`, paginated 20 at a time.
 *
 * Keyed on the type filter alone — `page` is a cursor, not a parameter — so
 * switching filters resets the feed instead of interleaving two of them.
 */
export function useActivity(type: ActivityType | "all" = "all") {
  return useInfiniteQuery({
    queryKey: ACTIVITY_KEYS.list(type),
    queryFn: ({ pageParam, signal }) =>
      fetchActivity({ page: pageParam, type }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
  });
}
