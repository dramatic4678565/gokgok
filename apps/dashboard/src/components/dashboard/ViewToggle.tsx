"use client";

import { LayoutGrid, Rows3 } from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { ViewMode } from "@/lib/types";

const OPTIONS: ReadonlyArray<{ value: ViewMode; label: string; icon: typeof Rows3 }> = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: Rows3 },
];

/** Segmented grid/list switch. The choice is persisted by the store. */
export function ViewToggle({ className }: { className?: string }) {
  const viewMode = useDashboardStore((state) => state.viewMode);
  const setViewMode = useDashboardStore((state) => state.setViewMode);

  return (
    <div
      role="group"
      aria-label="Board layout"
      className={cn(
        "inline-flex h-10 items-center rounded-md border border-input bg-background p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = viewMode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setViewMode(option.value)}
            aria-label={option.label}
            aria-pressed={isActive}
            className={cn(
              "grid size-9 place-items-center rounded-[5px] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              isActive
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <option.icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
