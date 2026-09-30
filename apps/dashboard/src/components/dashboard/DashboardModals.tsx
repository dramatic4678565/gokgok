"use client";

import { useEffect, useState } from "react";

import { CreateBoardModal } from "@/components/dashboard/CreateBoardModal";
import { CreateFolderModal } from "@/components/dashboard/CreateFolderModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { FolderColorPicker } from "@/components/dashboard/FolderColorPicker";
import { MoveToFolderModal } from "@/components/dashboard/MoveToFolderModal";
import { RenameModal } from "@/components/dashboard/RenameModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBoards,
  useDeleteBoard,
  useMoveToFolder,
  useRenameBoard,
} from "@/lib/hooks/useBoards";
import {
  useDeleteFolder,
  useFolders,
  useRenameFolder,
  useUpdateFolderColor,
} from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";

import type { FolderColor } from "@/lib/types";

/**
 * Renders whichever dashboard dialog the store says is open.
 *
 * Keeping the dialogs mounted here — rather than mounting one per caller —
 * means the boards and folders lists are read once, the dialogs stay in sync
 * with the store, and any component can open one with a single action call.
 */
export function DashboardModals() {
  const boardModal = useDashboardStore((state) => state.boardModal);
  const closeBoardModal = useDashboardStore((state) => state.closeBoardModal);
  const folderModal = useDashboardStore((state) => state.folderModal);
  const closeFolderModal = useDashboardStore((state) => state.closeFolderModal);

  // Shares the cache with whichever page is showing, so no extra request.
  const { data: boards = [] } = useBoards({});
  const { data: folders = [] } = useFolders();

  const board = boards.find((row) => row.id === boardModal?.boardId) ?? null;
  const folder = folders.find((row) => row.id === folderModal?.folderId) ?? null;

  const renameBoard = useRenameBoard();
  const moveBoard = useMoveToFolder();
  const deleteBoard = useDeleteBoard();

  const renameFolder = useRenameFolder();
  const recolorFolder = useUpdateFolderColor();
  const removeFolder = useDeleteFolder();

  // The colour dialog keeps a local draft so Cancel really cancels.
  const [colorDraft, setColorDraft] = useState<FolderColor | null>(null);

  const colorOpen = folderModal?.action === "color" && folder !== null;
  const effectiveColor = colorDraft ?? folder?.color ?? "indigo";
  const colorIsDirty = colorDraft !== null && colorDraft !== folder?.color;

  useEffect(() => {
    if (!colorOpen) {
      setColorDraft(null);
    }
  }, [colorOpen]);

  const closeColor = () => {
    setColorDraft(null);
    closeFolderModal();
  };

  return (
    <>
      <CreateBoardModal />
      <CreateFolderModal />

      <RenameModal
        open={boardModal?.action === "rename" && board !== null}
        onOpenChange={(next) => {
          if (!next) {
            closeBoardModal();
          }
        }}
        currentName={board?.title ?? ""}
        subject="board"
        isPending={renameBoard.isPending}
        onSave={(title) => {
          if (board) {
            renameBoard.mutate({ id: board.id, title });
          }
        }}
      />

      <RenameModal
        open={folderModal?.action === "rename" && folder !== null}
        onOpenChange={(next) => {
          if (!next) {
            closeFolderModal();
          }
        }}
        currentName={folder?.name ?? ""}
        subject="folder"
        isPending={renameFolder.isPending}
        onSave={(name) => {
          if (folder) {
            renameFolder.mutate({ id: folder.id, name });
          }
        }}
      />

      <MoveToFolderModal
        open={boardModal?.action === "move" && board !== null}
        onOpenChange={(next) => {
          if (!next) {
            closeBoardModal();
          }
        }}
        boardTitle={board?.title ?? ""}
        currentFolderId={board?.folderId ?? null}
        isPending={moveBoard.isPending}
        onMove={(folderId) => {
          if (board) {
            moveBoard.mutate({ id: board.id, folderId });
          }
        }}
      />

      {/* Board delete — soft, so the copy promises a recoverable Trash. */}
      <DeleteConfirmModal
        open={boardModal?.action === "delete" && board !== null}
        onOpenChange={(next) => {
          if (!next) {
            closeBoardModal();
          }
        }}
        subject={board ? `“${board.title}”` : "this board"}
        variant="trash"
        isPending={deleteBoard.isPending}
        onConfirm={() => {
          if (board) {
            deleteBoard.mutate(
              { id: board.id },
              { onSuccess: () => closeBoardModal() },
            );
          }
        }}
      />

      {/* Folder delete — states the consequence, and counts the boards first so
          the toast can name them. */}
      <DeleteConfirmModal
        open={folderModal?.action === "delete" && folder !== null}
        onOpenChange={(next) => {
          if (!next) {
            closeFolderModal();
          }
        }}
        subject={folder ? `“${folder.name}”` : "this folder"}
        variant="permanent"
        isPending={removeFolder.isPending}
        onConfirm={() => {
          if (folder) {
            removeFolder.mutate(
              // The sidebar badge already knows the count; the server answers
              // 204, so pass it along for the toast.
              { id: folder.id, movedBoards: folder.boardCount },
              { onSuccess: () => closeFolderModal() },
            );
          }
        }}
      />

      <Dialog open={colorOpen} onOpenChange={(next) => !next && closeColor()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Folder colour</DialogTitle>
            <DialogDescription>
              {folder ? `Choose a colour for “${folder.name}”.` : null}
            </DialogDescription>
          </DialogHeader>

          <FolderColorPicker
            value={effectiveColor}
            onChange={setColorDraft}
            layout="grid"
            className="justify-items-center"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={closeColor}>
              Cancel
            </Button>
            <Button
              disabled={!colorIsDirty || recolorFolder.isPending}
              onClick={() => {
                if (folder && colorIsDirty) {
                  recolorFolder.mutate(
                    { id: folder.id, color: effectiveColor },
                    { onSuccess: closeColor },
                  );
                }
              }}
            >
              {recolorFolder.isPending ? "Saving…" : "Save colour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
