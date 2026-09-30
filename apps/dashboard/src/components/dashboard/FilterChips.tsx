"use client";

import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { ActiveFilter } from "@/lib/types";

const FILTERS: ReadonlyArray<{ value: ActiveFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "favorites", label: "Favorites" },
  { value: "recent", label: "Recent" },
  { value: "shared", label: "Shared" },
];

export function FilterChips({ className }: { className?: string }) {
  const activeFilter = useDashboardStore((state) => state.activeFilter);
  const setActiveFilter = useDashboardStore((state) => state.setActiveFilter);

  return (
    <div
      role="group"
      aria-label="Filter boards"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
