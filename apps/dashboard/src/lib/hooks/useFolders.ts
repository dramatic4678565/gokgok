"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createFolder, deleteFolder, fetchFolders, updateFolder } from "@/lib/api/folders";
import { errorMessage } from "@/lib/api/client";
import { UNCATEGORIZED_LABEL } from "@/lib/types";

import type { Folder, FolderColor } from "@/lib/types";

export const FOLDER_KEYS = {
  all: ["folders"] as const,
};

type ToastOptions = { success?: string | null };

/** `GET /api/folders` */
export function useFolders() {
  return useQuery({
    queryKey: FOLDER_KEYS.all,
    queryFn: ({ signal }) => fetchFolders(signal),
    staleTime: 30_000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { name: string; color?: FolderColor }) => createFolder(input),

    // The sidebar shows the new folder before the request lands, which is what
    // makes the "+" next to the Folders header feel instant.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.all });
      const previous = queryClient.getQueryData<Folder[]>(FOLDER_KEYS.all);

      const optimistic: Folder = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: input.name.trim() || "New folder",
        color: input.color ?? "indigo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        boardCount: 0,
      };

      queryClient.setQueryData<Folder[]>(FOLDER_KEYS.all, (old) =>
        old ? [...old, optimistic] : old,
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FOLDER_KEYS.all, context.previous);
      }
      toast.error(errorMessage(error, "Could not create the folder"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.all });
    },

    onSuccess: (folder) => toast.success(`“${folder.name}” created`),
  });
}

export function useRenameFolder(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateFolder(id, { name }),

    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.all });
      const previous = queryClient.getQueryData<Folder[]>(FOLDER_KEYS.all);

      queryClient.setQueryData<Folder[]>(FOLDER_KEYS.all, (old) =>
        old?.map((folder) => (folder.id === id ? { ...folder, name } : folder)),
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FOLDER_KEYS.all, context.previous);
      }
      toast.error(errorMessage(error, "Could not rename the folder"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },

    onSuccess: () => {
      const message = options?.success === undefined ? "Folder renamed" : options.success;
      if (message) {
        toast.success(message);
      }
    },
  });
}

export function useUpdateFolderColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, color }: { id: string; color: FolderColor }) =>
      updateFolder(id, { color }),

    onMutate: async ({ id, color }) => {
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.all });
      const previous = queryClient.getQueryData<Folder[]>(FOLDER_KEYS.all);

      queryClient.setQueryData<Folder[]>(FOLDER_KEYS.all, (old) =>
        old?.map((folder) => (folder.id === id ? { ...folder, color } : folder)),
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FOLDER_KEYS.all, context.previous);
      }
      toast.error(errorMessage(error, "Could not change the folder colour"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },

    onSuccess: () => toast.success("Folder colour updated"),
  });
}

/**
 * Deleting a folder does not delete its boards — they fall back to
 * Uncategorized. The server answers 204, so the caller passes the board count
 * it already had on screen; that is what makes the toast able to say
 * "5 boards moved to Uncategorized" rather than something vaguer.
 */
export function useDeleteFolder(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; movedBoards?: number }) =>
      deleteFolder(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.all });
      const previous = queryClient.getQueryData<Folder[]>(FOLDER_KEYS.all);

      queryClient.setQueryData<Folder[]>(FOLDER_KEYS.all, (old) =>
        old?.filter((folder) => folder.id !== id),
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FOLDER_KEYS.all, context.previous);
      }
      toast.error(errorMessage(error, "Could not delete the folder"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.all });
      // Boards changed folder, so every board list and the sidebar counts are stale.
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },

    onSuccess: (_data, variables) => {
      const defaultMessage =
        variables.movedBoards === undefined
          ? `Folder deleted. Boards moved to ${UNCATEGORIZED_LABEL}.`
          : variables.movedBoards === 0
            ? "Folder deleted."
            : `Folder deleted. ${variables.movedBoards} ${
                variables.movedBoards === 1 ? "board" : "boards"
              } moved to ${UNCATEGORIZED_LABEL}.`;

      const message = options?.success === undefined ? defaultMessage : options.success;
      if (message) {
        toast.success(message);
      }
    },
  });
}
