"use client";

import { LayoutGrid, Plus } from "lucide-react";

import { BoardGrid } from "@/components/dashboard/BoardGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FilterChips } from "@/components/dashboard/FilterChips";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { useBoardCollection } from "@/lib/dashboard/queries";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";

/**
 * Home — every board, with folders surfaced above the grid so they are
 * reachable without hunting in the sidebar.
 */
export default function HomePage() {
  const { boards, isLoading } = useBoardCollection({ filter: "all" });
  const { data: folders = [] } = useFolders();

  const setCreateBoardOpen = useDashboardStore((state) => state.setCreateBoardOpen);
  const search = useDashboardStore((state) => state.search);

  const showFolders = !search.trim() && folders.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">All boards</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${boards.length} ${boards.length === 1 ? "board" : "boards"}`}
          </p>
        </div>

        <FilterChips />
      </div>

      {showFolders ? (
        <section aria-label="Folders" className="space-y-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      ) : null}

      <BoardGrid
        boards={boards}
        isLoading={isLoading}
        emptyState={
          search.trim() ? (
            <EmptyState
              icon={<LayoutGrid />}
              title={`No boards match “${search.trim()}”`}
              description="Try a different search, or clear it to see everything."
            />
          ) : (
            <EmptyState
              icon={<LayoutGrid />}
              title="Create your first board"
              description="Boards are where your team's diagrams, flows and sketches live."
              action={
                <button
                  type="button"
                  onClick={() => setCreateBoardOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Plus className="size-4" />
                  New board
                </button>
              }
            />
          )
        }
      />
    </div>
  );
}
