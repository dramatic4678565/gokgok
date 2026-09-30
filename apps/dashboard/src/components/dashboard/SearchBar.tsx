"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { registerSearchInput } from "@/lib/dashboard/search-focus";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

/**
 * Board title search. The value is immediate (so typing feels responsive) and
 * the 300ms debounce lives in `useBoardCollection`, which is what actually
 * issues the `?search=` request.
 */
export function SearchBar({ className }: { className?: string }) {
  const search = useDashboardStore((state) => state.search);
  const setSearch = useDashboardStore((state) => state.setSearch);

  const localRef = useRef<HTMLInputElement>(null);

  // Registers this input as the target of the `/` shortcut.
  useEffect(() => registerSearchInput(localRef.current), []);

  const hasQuery = search.length > 0;

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        ref={localRef}
        id="dashboard-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search boards"
        aria-label="Search boards by title"
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background pl-9 pr-16 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // `type="search"` draws a native clear button in WebKit; ours is enough.
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />

      {hasQuery ? (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
          /
        </kbd>
      )}
    </div>
  );
}
