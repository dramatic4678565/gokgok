import { apiFetch, apiUrl } from "./client";

import type { Board, BoardQuery, BoardTemplateId, Folder } from "@/lib/types";

/**
 * Board endpoints. Each function maps one-to-one onto a route handler in
 * `src/app/api/boards/**`; the shapes are the contract, not an implementation
 * detail of the mock.
 */

export function fetchBoards(params: BoardQuery = {}, signal?: AbortSignal): Promise<Board[]> {
  return apiFetch<Board[]>(
    apiUrl("/api/boards", {
      ...(params.folder ? { folder: params.folder } : {}),
      ...(params.favorite !== undefined ? { favorite: params.favorite } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      ...(params.deleted !== undefined ? { deleted: params.deleted } : {}),
    }),
    { signal },
  );
}

export function createBoard(input: {
  title?: string;
  folderId?: string | null;
  template?: BoardTemplateId;
}): Promise<Board> {
  return apiFetch<Board>("/api/boards", { method: "POST", body: input });
}

export function updateBoard(
  id: string,
  patch: { title?: string; isFavorite?: boolean; folderId?: string | null },
): Promise<Board> {
  return apiFetch<Board>(`/api/boards/${id}`, { method: "PATCH", body: patch });
}

export function deleteBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/api/boards/${id}`, { method: "DELETE" });
}

export function restoreBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/api/boards/${id}/restore`, { method: "POST" });
}

export function deleteBoardForever(id: string): Promise<void> {
  return apiFetch<void>(`/api/boards/${id}/permanent`, { method: "DELETE" });
}

export function duplicateBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/api/boards/${id}/duplicate`, { method: "POST" });
}

export function touchBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/api/boards/${id}/open`, { method: "POST" });
}

export function emptyTrash(): Promise<{ deleted: number }> {
  return apiFetch<{ deleted: number }>("/api/trash", { method: "DELETE" });
}

export type { Board, Folder };
