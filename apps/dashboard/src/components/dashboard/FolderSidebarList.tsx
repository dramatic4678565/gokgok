"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  Ellipsis,
  Palette,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { folderDropId } from "@/lib/dashboard/dnd";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { Folder } from "@/lib/types";

type FolderRowProps = {
  folder: Folder;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
};

/**
 * A folder in the sidebar, and a drop target for board cards.
 *
 * `useDroppable` supplies the ring highlight while a board is dragged over it;
 * the drop itself is handled once, by the shell's `DndContext`.
 */
function FolderRow({ folder, isActive, collapsed, onNavigate }: FolderRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openFolderModal = useDashboardStore((state) => state.openFolderModal);

  const { setNodeRef, isOver } = useDroppable({
    id: folderDropId(folder.id),
    data: { folderId: folder.id },
  });

  const colors = folderColorClasses(folder.color);

  const row = (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-sidebar",
        collapsed ? "justify-center px-0" : "px-2.5",
        isOver
          ? cn("bg-sidebar-accent ring-2", colors.ring)
          : isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />

      <span
        className={cn("size-2.5 shrink-0 rounded-full", colors.dot)}
        aria-hidden="true"
      />

      {!collapsed ? (
        <>
          <Link
            href={`/folders/${folder.id}`}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            title={folder.name}
            className="min-w-0 flex-1 truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {folder.name}
          </Link>

          <span
            className="shrink-0 rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground"
            aria-label={`${folder.boardCount} boards`}
          >
            {folder.boardCount}
          </span>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Actions for ${folder.name}`}
                className="absolute right-1.5 grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <Ellipsis className="size-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={() => openFolderModal(folder.id, "rename")}>
                <Pencil />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openFolderModal(folder.id, "color")}>
                <Palette />
                Change colour
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() => openFolderModal(folder.id, "delete")}
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </div>
  );

  if (!collapsed) {
    return row;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">
        {folder.name} · {folder.boardCount} {folder.boardCount === 1 ? "board" : "boards"}
      </TooltipContent>
    </Tooltip>
  );
}

type FolderSidebarListProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

export function FolderSidebarList({ collapsed, onNavigate }: FolderSidebarListProps) {
  const { data: folders = [], isLoading } = useFolders();
  const selectedBoardId = useDashboardStore((state) => state.selectedBoardId);
  const pathname = usePathname();

  const activeFolderId = pathname.startsWith("/folders/")
    ? pathname.slice("/folders/".length)
    : null;

  if (!isLoading && folders.length === 0) {
    return (
      <p className="px-2.5 py-1 text-xs text-muted-foreground">
        {collapsed ? "—" : "No folders yet"}
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {folders.map((folder) => (
        <li key={folder.id}>
          <FolderRow
            folder={folder}
            collapsed={collapsed}
            // A folder row also lights up while one of its boards has a dialog
            // open, so the two never read as unrelated contexts.
            isActive={activeFolderId === folder.id || selectedBoardId === folder.id}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}
