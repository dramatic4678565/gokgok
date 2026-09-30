import { apiFetch } from "./client";

import type { Folder, FolderColor } from "@/lib/types";

export function fetchFolders(signal?: AbortSignal): Promise<Folder[]> {
  return apiFetch<Folder[]>("/api/folders", { signal });
}

export function createFolder(input: {
  name: string;
  color?: FolderColor;
}): Promise<Folder> {
  return apiFetch<Folder>("/api/folders", { method: "POST", body: input });
}

export function updateFolder(
  id: string,
  patch: { name?: string; color?: FolderColor },
): Promise<Folder> {
  return apiFetch<Folder>(`/api/folders/${id}`, { method: "PATCH", body: patch });
}

export function deleteFolder(id: string): Promise<void> {
  return apiFetch<void>(`/api/folders/${id}`, { method: "DELETE" });
}
