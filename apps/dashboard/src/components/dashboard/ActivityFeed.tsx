"use client";

import { Activity, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groupByDate } from "@/lib/dashboard/format";
import { useActivity } from "@/lib/hooks/useActivity";

import type { ActivityType } from "@/lib/types";

const FILTERS: ReadonlyArray<{ value: ActivityType | "all"; label: string }> = [
  { value: "all", label: "All actions" },
  { value: "created", label: "Created" },
  { value: "renamed", label: "Renamed" },
  { value: "deleted", label: "Deleted" },
  { value: "favorited", label: "Favorited" },
  { value: "moved", label: "Moved" },
];

export function ActivityFeed() {
  const [type, setType] = useState<ActivityType | "all">("all");
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useActivity(type);

  const entries = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const groups = useMemo(
    () => groupByDate(entries, (entry) => entry.createdAt),
    [entries],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading activity…
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Activity />}
        title="Could not load activity"
        description="Something went wrong fetching your history. Try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Activity</h2>

        <Select value={type} onValueChange={(value) => setType(value as ActivityType | "all")}>
          <SelectTrigger className="w-44" aria-label="Filter activity by action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<Activity />}
          title="No activity yet"
          description={
            type === "all"
              ? "Create, open or rename a board and it will show up here."
              : "Nothing matches this filter yet."
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.group}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.group}
              </h3>
              <ul>
                {group.items.map((entry) => (
                  <ActivityItem key={entry.id} activity={entry} />
                ))}
              </ul>
            </section>
          ))}

          {hasNextPage ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              That&apos;s everything.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
