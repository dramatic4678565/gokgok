"use client";

import {
  Copy,
  Download,
  ExternalLink,
  Ellipsis,
  FolderInput,
  Pencil,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadBoardScene } from "@/lib/dashboard/download";
import { useDuplicateBoard } from "@/lib/hooks/useBoards";
import { useDashboardStore } from "@/lib/store/dashboardStore";

import type { LucideIcon } from "lucide-react";

type BoardAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  /** Draws a separator above this item. */
  separated?: boolean;
  run: () => void;
  disabled?: boolean;
};

/**
 * The board's action list, defined once and rendered into both the hover menu
 * and the right-click menu so the two can never drift apart.
 *
 * Radix closes a menu after `onSelect`, so no explicit teardown is needed here.
 */
function useBoardActions({
  boardId,
  title,
}: {
  boardId: string;
  title: string;
}): BoardAction[] {
  const router = useRouter();
  const openBoardModal = useDashboardStore((state) => state.openBoardModal);
  const duplicate = useDuplicateBoard();

  return [
    {
      id: "open",
      label: "Open",
      icon: ExternalLink,
      run: () => router.push(`/board/${boardId}`),
    },
    {
      id: "rename",
      label: "Rename",
      icon: Pencil,
      separated: true,
      run: () => openBoardModal(boardId, "rename"),
    },
    {
      id: "duplicate",
      label: "Duplicate",
      icon: Copy,
      disabled: duplicate.isPending,
      run: () => duplicate.mutate(boardId),
    },
    {
      id: "move",
      label: "Move to folder",
      icon: FolderInput,
      run: () => openBoardModal(boardId, "move"),
    },
    {
      id: "download",
      label: "Download",
      icon: Download,
      run: () => void downloadBoardScene(boardId, title),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash,
      destructive: true,
      separated: true,
      run: () => openBoardModal(boardId, "delete"),
    },
  ];
}

/** The hover "…" button in a card's top-right corner. */
export function BoardMenuTrigger({
  boardId,
  title,
}: {
  boardId: string;
  title: string;
}) {
  const actions = useBoardActions({ boardId, title });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${title}`}
          className="grid size-8 place-items-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 data-[state=open]:opacity-100"
          // The whole card is a link; the menu must not navigate.
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Ellipsis className="size-[18px]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.separated ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              destructive={action.destructive}
              disabled={action.disabled}
              onSelect={action.run}
            >
              <action.icon />
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Right-click menu for a board, replacing the browser's own menu. */
export function BoardContextMenu({
  boardId,
  title,
  children,
}: {
  boardId: string;
  title: string;
  children: React.ReactNode;
}) {
  const actions = useBoardActions({ boardId, title });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.separated ? <ContextMenuSeparator /> : null}
            <ContextMenuItem
              destructive={action.destructive}
              disabled={action.disabled}
              onSelect={action.run}
            >
              <action.icon />
              {action.label}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
