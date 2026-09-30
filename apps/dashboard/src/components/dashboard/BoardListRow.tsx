"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";

import { BoardMenuTrigger, BoardContextMenu } from "@/components/dashboard/BoardMenu";
import { BoardThumbnail } from "@/components/dashboard/BoardThumbnail";
import { InlineTitle } from "@/components/dashboard/InlineTitle";
import { StarButton } from "@/components/dashboard/StarButton";
import { boardDragId } from "@/lib/dashboard/dnd";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { relativeTime } from "@/lib/dashboard/format";
import { useRenameBoard } from "@/lib/hooks/useBoards";
import { cn } from "@/lib/utils";

import type { Board } from "@/lib/types";

/**
 * Compact row for list view. Deliberately denser than `BoardCard` — the
 * thumbnail is a small fixed square rather than a 16:9 panel, so a screen of
 * rows still shows a useful number of titles.
 */
export function BoardListRow({ board }: { board: Board }) {
  const rename = useRenameBoard({ success: null });
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: boardDragId(board.id),
    // The overlay in `DashboardShell` reads this back.
    data: { boardId: board.id, title: board.title, folderId: board.folderId },
  });

  const folder = folderColorClasses(board.folder?.color);

  return (
    <BoardContextMenu boardId={board.id} title={board.title}>
      <div
        ref={setNodeRef}
        className={cn(
          "group flex items-center gap-3 border-b border-border px-3 py-2 transition-colors last:border-b-0 hover:bg-muted/50",
          isDragging && "opacity-40",
        )}
        {...attributes}
        {...listeners}
      >
        <Link
          href={`/board/${board.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BoardThumbnail
            id={board.id}
            
            thumbnail={board.thumbnail}
            className="size-10 shrink-0 rounded-md"
          />

          <InlineTitle
            value={board.title}
            aria-label={`Title of ${board.title}`}
            as="span"
            className="min-w-0 flex-1 truncate text-sm font-medium"
            inputClassName="text-sm font-medium"
            onSave={(title) => rename.mutate({ id: board.id, title })}
          />

          {board.folder ? (
            <span
              className={cn(
                "hidden w-40 shrink-0 items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex",
                folder.pill,
              )}
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", folder.dot)}
                aria-hidden="true"
              />
              <span className="truncate">{board.folder.name}</span>
            </span>
          ) : (
            <span className="hidden w-40 shrink-0 sm:block" />
          )}

          <time
            dateTime={board.updatedAt}
            className="hidden w-32 shrink-0 text-right text-xs text-muted-foreground md:block"
          >
            {relativeTime(board.updatedAt)}
          </time>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <StarButton
            boardId={board.id}
            title={board.title}
            isFavorite={board.isFavorite}
            className="opacity-100"
          />
          <BoardMenuTrigger boardId={board.id} title={board.title} />
        </div>
      </div>
    </BoardContextMenu>
  );
}
