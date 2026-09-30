"use client";

import {
  Folder as FolderIcon,
  Ellipsis,
  Palette,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { Folder } from "@/lib/types";

/**
 * A folder surfaced as a card, used on the Home page to give folders a
 * presence alongside boards. Shown only when the current filter is "all" — a
 * favourites or shared view is about boards, not containers.
 */
export function FolderCard({ folder }: { folder: Folder }) {
  const openFolderModal = useDashboardStore((state) => state.openFolderModal);
  const colors = folderColorClasses(folder.color);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between gap-6 rounded-xl border border-border bg-card p-5 shadow-sm",
        "transition-shadow duration-200 hover:shadow-lg",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/folders/${folder.id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn("size-3 shrink-0 rounded-full", colors.dot)}
            aria-hidden="true"
          />
          <span className="truncate text-lg font-semibold tracking-tight">
            {folder.name}
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${folder.name}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <Ellipsis className="size-[18px]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => openFolderModal(folder.id, "color")}>
              <Palette />
              Change colour
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openFolderModal(folder.id, "rename")}>
              <Pencil />
              Rename
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
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FolderIcon className="size-4" />
        <span>
          {folder.boardCount === 1
            ? "1 board"
            : `${folder.boardCount} boards`}
        </span>
      </div>
    </div>
  );
}
