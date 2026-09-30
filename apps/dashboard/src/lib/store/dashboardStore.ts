"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ActiveFilter, SortBy, ViewMode } from "@/lib/types";

/** Which per-board dialog the shell should be showing. */
export type BoardAction = "rename" | "delete" | "move" | "duplicate" | "download";

/** Which per-folder dialog the shell should be showing. */
export type FolderAction = "rename" | "color" | "delete";

/** Both dialogs act on an existing record, so both require an id. */
export type BoardModal = { action: BoardAction; boardId: string } | null;
export type FolderModal = { action: FolderAction; folderId: string } | null;

type DashboardState = {
  // --- persisted preferences -------------------------------------------------
  sidebarCollapsed: boolean;
  viewMode: ViewMode;
  sortBy: SortBy;

  // --- session-scoped UI state ----------------------------------------------
  activeFilter: ActiveFilter;
  search: string;
  selectedBoardId: string | null;
  boardModal: BoardModal;
  folderModal: FolderModal;
  createBoardOpen: boolean;
  createFolderOpen: boolean;
  commandPaletteOpen: boolean;
  mobileSidebarOpen: boolean;

  // --- actions ---------------------------------------------------------------
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setActiveFilter: (filter: ActiveFilter) => void;
  setSearch: (search: string) => void;

  openBoardModal: (boardId: string, action: BoardAction) => void;
  closeBoardModal: () => void;
  openFolderModal: (folderId: string, action: FolderAction) => void;
  closeFolderModal: () => void;
  setCreateBoardOpen: (open: boolean) => void;
  setCreateFolderOpen: (open: boolean) => void;

  setCommandPaletteOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      viewMode: "grid",
      sortBy: "modified",
      activeFilter: "all",
      search: "",
      selectedBoardId: null,
      boardModal: null,
      folderModal: null,
      createBoardOpen: false,
      createFolderOpen: false,
      commandPaletteOpen: false,
      mobileSidebarOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setActiveFilter: (activeFilter) => set({ activeFilter }),
      setSearch: (search) => set({ search }),

      openBoardModal: (boardId, action) =>
        set({ boardModal: { action, boardId }, selectedBoardId: boardId }),
      closeBoardModal: () => set({ boardModal: null, selectedBoardId: null }),

      openFolderModal: (folderId, action) =>
        set({ folderModal: { action, folderId } }),
      closeFolderModal: () => set({ folderModal: null }),

      setCreateBoardOpen: (createBoardOpen) => set({ createBoardOpen }),
      setCreateFolderOpen: (createFolderOpen) => set({ createFolderOpen }),

      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
    }),
    {
      name: "mosaic-dashboard",
      // Only the three documented preferences survive a reload; transient UI
      // state (open dialogs, filters, search text) always starts clean.
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
    },
  ),
);
