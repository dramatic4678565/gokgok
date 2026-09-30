"use client";

import { Star } from "lucide-react";

import { BoardGrid } from "@/components/dashboard/BoardGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useBoardCollection } from "@/lib/dashboard/queries";

/**
 * Favorites — the same grid as Home, filtered server-side via `?favorite=true`.
 *
 * No filter chips here: this page *is* the favorites filter, so offering the
 * chip row would render controls that cannot change the result. Recent and
 * Shared have their own routes, and search still applies from the topbar.
 */
export default function FavoritesPage() {
  const { boards, isLoading } = useBoardCollection({ filter: "favorites" });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${boards.length} ${boards.length === 1 ? "board" : "boards"}`}
        </p>
      </div>

      <BoardGrid
        boards={boards}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<Star />}
            title="No favorites yet"
            description="Star a board to pin it here."
          />
        }
      />
    </div>
  );
}
