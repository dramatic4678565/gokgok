"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
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

type BoardCardProps = {
  board: Board;
  /** Announced by screen readers in place of the title. */
  headingLevel?: "h2" | "h3";
};

export function BoardCard({ board }: BoardCardProps) {
  const rename = useRenameBoard({ success: null });
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: boardDragId(board.id),
    // The overlay in `DashboardShell` reads this back, so the board's title
    // travels with the gesture.
    data: { boardId: board.id, title: board.title, folderId: board.folderId },
  });

  const folder = folderColorClasses(board.folder?.color);

  return (
    <BoardContextMenu boardId={board.id} title={board.title}>
      <motion.article
        ref={setNodeRef}
        layout="position"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "group relative rounded-xl border border-border bg-card shadow-sm",
          "transition-shadow duration-200 hover:shadow-lg",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          isDragging && "opacity-40",
        )}
        {...attributes}
        {...listeners}
      >
        <Link
          href={`/board/${board.id}`}
          className="flex flex-col rounded-xl focus-visible:outline-none"
        >
          <BoardThumbnail
            id={board.id}
            
            thumbnail={board.thumbnail}
            className="rounded-t-[11px]"
          >
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <StarButton
                boardId={board.id}
                title={board.title}
                isFavorite={board.isFavorite}
              />
              <BoardMenuTrigger boardId={board.id} title={board.title} />
            </div>
          </BoardThumbnail>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <InlineTitle
              value={board.title}
              aria-label={`Title of ${board.title}`}
              as="h3"
              className="text-lg font-semibold leading-tight tracking-tight"
              inputClassName="text-lg font-semibold leading-tight tracking-tight"
              onSave={(title) => rename.mutate({ id: board.id, title })}
            />

            <div className="mt-auto flex items-center justify-between gap-2">
              {board.folder ? (
                <span
                  className={cn(
                    "inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-xs font-medium",
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
                <span />
              )}

              <time
                dateTime={board.updatedAt}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {relativeTime(board.updatedAt)}
              </time>
            </div>
          </div>
        </Link>
      </motion.article>
    </BoardContextMenu>
  );
}
