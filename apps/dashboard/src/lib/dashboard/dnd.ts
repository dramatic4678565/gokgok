/**
 * Drag-and-drop id scheme shared by the board cards (draggables) and the
 * folder targets (droppables) in the sidebar and on a folder's own page.
 *
 * A single `DndContext` wraps the whole dashboard shell, so these two helpers
 * are the contract between producers and consumers.
 */
export const BOARD_DRAG_PREFIX = "board:";
export const FOLDER_DROP_PREFIX = "folder:";

export function boardDragId(boardId: string) {
  return `${BOARD_DRAG_PREFIX}${boardId}`;
}

export function folderDropId(folderId: string) {
  return `${FOLDER_DROP_PREFIX}${folderId}`;
}

export function parseBoardDragId(id: string | undefined): string | null {
  return id?.startsWith(BOARD_DRAG_PREFIX) ? id.slice(BOARD_DRAG_PREFIX.length) : null;
}

export function parseFolderDropId(id: string | undefined): string | null {
  return id?.startsWith(FOLDER_DROP_PREFIX) ? id.slice(FOLDER_DROP_PREFIX.length) : null;
}
