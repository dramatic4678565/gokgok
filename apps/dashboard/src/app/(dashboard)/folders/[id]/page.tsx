"use client";

import { useDroppable } from "@dnd-kit/core";
import { Ellipsis, LayoutGrid, Palette, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { BoardGrid } from "@/components/dashboard/BoardGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { InlineTitle } from "@/components/dashboard/InlineTitle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { folderDropId, parseBoardDragId } from "@/lib/dashboard/dnd";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { useBoardCollection } from "@/lib/dashboard/queries";
import { useFolders, useRenameFolder } from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

/**
 * Folder detail. The header doubles as a drop target, so a board dragged
 * anywhere onto it is moved into this folder — the same `DndContext` from the
 * shell handles the drop.
 */
export default function FolderPage() {
  const params = useParams<{ id: string }>();
  const folderId = params.id;

  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const { boards, isLoading } = useBoardCollection({ params: { folder: folderId } });

  const renameFolder = useRenameFolder({ success: null });
  const openFolderModal = useDashboardStore((state) => state.openFolderModal);

  const folder = folders.find((row) => row.id === folderId) ?? null;
  const colors = folderColorClasses(folder?.color);

  const { setNodeRef, isOver, active } = useDroppable({
    id: folderDropId(folderId),
    data: { folderId },
  });

  const draggingBoardId = active ? parseBoardDragId(String(active.id)) : null;

  if (foldersLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!folder) {
    return (
      <EmptyState
        icon={<LayoutGrid />}
        title="Folder not found"
        description="It may have been deleted."
        action={
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to Home
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{folder.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors",
          isOver && cn("bg-primary/5 ring-2", colors.ring),
        )}
      >
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5">
            <span
              className={cn("size-3 shrink-0 rounded-full", colors.dot)}
              aria-hidden="true"
            />
            <InlineTitle
              as="h1"
              value={folder.name}
              aria-label={`Title of ${folder.name}`}
              className="text-2xl font-semibold tracking-tight"
              inputClassName="text-2xl font-semibold tracking-tight"
              onSave={(name) => renameFolder.mutate({ id: folder.id, name })}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {boards.length} {boards.length === 1 ? "board" : "boards"}
            {isOver && draggingBoardId ? " — release to move here" : null}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${folder.name}`}
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Ellipsis className="size-[18px]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
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
      </div>

      <BoardGrid
        boards={boards}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={<LayoutGrid />}
            title="This folder is empty"
            description="Drag a board onto the header above, or create one and move it here."
          />
        }
      />
    </div>
  );
}
