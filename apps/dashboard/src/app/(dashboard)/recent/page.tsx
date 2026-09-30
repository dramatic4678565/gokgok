"use client";

import { Clock3 } from "lucide-react";
import Link from "next/link";

import { BoardContextMenu } from "@/components/dashboard/BoardMenu";
import { BoardThumbnail } from "@/components/dashboard/BoardThumbnail";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SkeletonList } from "@/components/dashboard/SkeletonGrid";
import { StarButton } from "@/components/dashboard/StarButton";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { groupByDate, timeOfDay } from "@/lib/dashboard/format";
import { useBoardCollection } from "@/lib/dashboard/queries";
import { cn } from "@/lib/utils";

/**
 * Recent — compact rows rather than full cards, grouped into Today, Yesterday,
 * This Week and Earlier. Boards that have never been opened are not "recent",
 * so they are excluded rather than dumped into the oldest bucket.
 */
export default function RecentPage() {
  const { boards, isLoading } = useBoardCollection({ params: { sort: "opened" } });

  const opened = boards.filter((board) => board.lastOpenedAt !== null);
  const groups = groupByDate(opened, (board) => board.lastOpenedAt);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Recent</h1>
        <SkeletonList count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Recent</h1>
        <p className="text-sm text-muted-foreground">
          {opened.length === 0
            ? "Boards you open will show up here"
            : `${opened.length} recently opened`}
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Clock3 />}
          title="Nothing opened recently"
          description="Boards you open appear here, newest first."
        />
      ) : (
        groups.map((group) => (
          <section key={group.group}>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.group}
            </h2>

            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {group.items.map((board) => {
                const colors = folderColorClasses(board.folder?.color);

                return (
                  <BoardContextMenu
                    key={board.id}
                    boardId={board.id}
                    title={board.title}
                  >
                    <div className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/50">
                      <Link
                        href={`/board/${board.id}`}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <BoardThumbnail
                          id={board.id}
                          
                          thumbnail={board.thumbnail}
                          className="size-10 shrink-0 rounded-md"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {board.title}
                        </span>
                        {board.folder ? (
                          <span
                            className={cn(
                              "hidden w-40 shrink-0 items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
                              colors.pill,
                            )}
                          >
                            <span
                              className={cn("size-1.5 shrink-0 rounded-full", colors.dot)}
                              aria-hidden="true"
                            />
                            <span className="truncate">{board.folder.name}</span>
                          </span>
                        ) : (
                          <span className="hidden w-40 shrink-0 sm:block" />
                        )}
                        <time
                          dateTime={board.lastOpenedAt ?? undefined}
                          className="hidden w-32 shrink-0 text-right text-xs text-muted-foreground md:block"
                        >
                          {timeOfDay(board.lastOpenedAt ?? "")}
                        </time>
                      </Link>

                      <StarButton
                        boardId={board.id}
                        title={board.title}
                        isFavorite={board.isFavorite}
                        className="opacity-100"
                      />
                    </div>
                  </BoardContextMenu>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
