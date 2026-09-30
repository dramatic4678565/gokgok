"use client";

import { Clock3, RotateCcw, Trash } from "lucide-react";
import { useState } from "react";

import { BoardThumbnail } from "@/components/dashboard/BoardThumbnail";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SkeletonList } from "@/components/dashboard/SkeletonGrid";
import { Button } from "@/components/ui/button";
import { useBoardCollection } from "@/lib/dashboard/queries";
import { relativeTime } from "@/lib/dashboard/format";
import {
  useDeleteBoardForever,
  useEmptyTrash,
  useRestoreBoard,
} from "@/lib/hooks/useBoards";
import { TRASH_RETENTION_DAYS } from "@/lib/types";

/** Whole days of retention left before a trashed board is purged. */
function daysLeft(updatedAt: string, now: number): number {
  const elapsed = Math.floor((now - new Date(updatedAt).getTime()) / 86_400_000);
  return Math.max(0, TRASH_RETENTION_DAYS - elapsed);
}

export default function TrashPage() {
  // `?deleted=true` is the only way to reach soft-deleted boards.
  const { boards, isLoading } = useBoardCollection({ params: { deleted: true } });

  const restore = useRestoreBoard();
  const destroy = useDeleteBoardForever();
  const empty = useEmptyTrash();

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const target = boards.find((board) => board.id === pendingDelete) ?? null;
  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : boards.length === 0
                ? "Nothing here"
                : `${boards.length} ${
                    boards.length === 1 ? "board" : "boards"
                  } · deleted after ${TRASH_RETENTION_DAYS} days`}
          </p>
        </div>

        {boards.length > 0 ? (
          <Button variant="destructive" onClick={() => setConfirmEmpty(true)}>
            <Trash className="size-4" />
            Empty trash
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : boards.length === 0 ? (
        <EmptyState
          icon={<Trash />}
          title="Trash is empty"
          description={`Boards you delete land here, where you can restore them for ${TRASH_RETENTION_DAYS} days.`}
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex flex-wrap items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <BoardThumbnail
                id={board.id}
                
                thumbnail={board.thumbnail}
                muted
                className="size-10 shrink-0 rounded-md"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{board.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  Deleted {relativeTime(board.updatedAt)}
                </p>
              </div>

              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                Auto-delete in {daysLeft(board.updatedAt, now)} days
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate({ id: board.id })}
                >
                  <RotateCcw className="size-4" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setPendingDelete(board.id)}
                >
                  Delete forever
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        subject={target ? `“${target.title}”` : "this board"}
        variant="permanent"
        isPending={destroy.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            destroy.mutate(
              { id: pendingDelete },
              { onSuccess: () => setPendingDelete(null) },
            );
          }
        }}
      />

      <DeleteConfirmModal
        open={confirmEmpty}
        onOpenChange={(next) => !next && setConfirmEmpty(false)}
        subject={`all ${boards.length} ${
          boards.length === 1 ? "board" : "boards"
        } in Trash`}
        variant="permanent"
        isPending={empty.isPending}
        onConfirm={() =>
          empty.mutate(undefined, { onSuccess: () => setConfirmEmpty(false) })
        }
      />
    </div>
  );
}
