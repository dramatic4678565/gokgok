"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createBoard,
  deleteBoard,
  deleteBoardForever,
  duplicateBoard,
  emptyTrash,
  fetchBoards,
  restoreBoard,
  touchBoard,
  updateBoard,
} from "@/lib/api/boards";
import { errorMessage } from "@/lib/api/client";

import type { Board, BoardQuery } from "@/lib/types";

export const BOARD_KEYS = {
  all: ["boards"] as const,
  list: (params: BoardQuery) => ["boards", "list", params] as const,
};

/** `GET /api/boards?folder=&favorite=&search=&sort=` */
export function useBoards(params: BoardQuery = {}) {
  return useQuery({
    queryKey: BOARD_KEYS.list(params),
    queryFn: ({ signal }) => fetchBoards(params, signal),
    staleTime: 30_000,
  });
}

type ToastOptions = {
  /** Pass `null` to suppress the success toast and write your own. */
  success?: string | null;
  failure?: string;
};

const reportSuccess = (options: ToastOptions | undefined, fallback: string) => {
  const message = options?.success === undefined ? fallback : options?.success;
  if (message) {
    toast.success(message);
  }
};

const reportFailure = (error: unknown, fallback: string) => {
  toast.error(errorMessage(error, fallback));
};

/**
 * Applies `updater` to every cached board list at once.
 *
 * The naive `setQueryData(["boards"], …)` only fixes the unfiltered list, so a
 * favourite toggled on the Home page would not update the sidebar badge or an
 * open folder page. Matching on the `["boards"]` prefix covers all of them.
 * Returning `null` from `updater` removes the board from the list.
 */
function updateBoardCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (board: Board) => Board | null,
) {
  queryClient.setQueriesData<Board[]>({ queryKey: BOARD_KEYS.all }, (old) =>
    Array.isArray(old)
      ? old.map(updater).filter((board): board is Board => board !== null)
      : old,
  );
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard,
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`“${board.title}” created`);
    },
    onError: (error) => reportFailure(error, "Could not create the board"),
  });
}

export function useToggleFavorite(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      updateBoard(id, { isFavorite }),

    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });

      updateBoardCaches(queryClient, (board) =>
        board.id === id ? { ...board, isFavorite } : board,
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not update the board");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
    },

    onSuccess: (_data, variables) => {
      reportSuccess(
        options,
        variables.isFavorite ? "Added to favorites" : "Removed from favorites",
      );
    },
  });
}

export function useRenameBoard(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateBoard(id, { title }),

    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });

      updateBoardCaches(queryClient, (board) =>
        board.id === id ? { ...board, title } : board,
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not rename the board");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },

    onSuccess: () => reportSuccess(options, "Board renamed"),
  });
}

export function useMoveToFolder(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId: string | null }) =>
      updateBoard(id, { folderId }),

    onMutate: async ({ id, folderId }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });

      updateBoardCaches(queryClient, (board) =>
        board.id === id
          ? { ...board, folderId, folder: undefined }
          : board,
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not move the board");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },

    onSuccess: (_data, variables) => {
      reportSuccess(options, variables.folderId ? "Board moved" : "Moved to Uncategorized");
    },
  });
}

export function useDuplicateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateBoard,
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`Duplicated as “${board.title}”`);
    },
    onError: (error) => reportFailure(error, "Could not duplicate the board"),
  });
}

export function useDeleteBoard(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteBoard(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });

      // Hide it everywhere at once; the server response arrives immediately
      // after and `onSettled` reconciles.
      updateBoardCaches(queryClient, (board) =>
        board.id === id ? { ...board, isDeleted: true, isFavorite: false } : board,
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not delete the board");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },

    onSuccess: () => reportSuccess(options, "Moved to Trash"),
  });
}

export function useRestoreBoard(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => restoreBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      reportSuccess(options, "Board restored");
    },
    onError: (error) => reportFailure(error, "Could not restore the board"),
  });
}

export function useDeleteBoardForever(options?: ToastOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteBoardForever(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });

      updateBoardCaches(queryClient, (board) => (board.id === id ? null : board));

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not delete the board");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },

    onSuccess: () => reportSuccess(options, "Board deleted forever"),
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: emptyTrash,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: BOARD_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: BOARD_KEYS.all });
      queryClient.setQueriesData<Board[]>({ queryKey: BOARD_KEYS.all }, (old) =>
        Array.isArray(old) ? old.filter(() => false) : old,
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      reportFailure(error, "Could not empty the trash");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onSuccess: (result) => {
      toast.success(
        result.deleted === 1
          ? "1 board deleted forever"
          : `${result.deleted} boards deleted forever`,
      );
    },
  });
}

/** Records `lastOpenedAt`. Fire-and-forget; failures are not worth a toast. */
export function useTouchBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: touchBoard,
    onSuccess: (board) => {
      updateBoardCaches(queryClient, (cached) =>
        cached.id === board.id
          ? { ...cached, lastOpenedAt: board.lastOpenedAt }
          : cached,
      );
    },
  });
}
