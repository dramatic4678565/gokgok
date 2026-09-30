"use client";

import {
  ArrowRight,
  Clock3,
  Folder,
  FolderPlus,
  House,
  LayoutGrid,
  Plus,
  Search,
  Star,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBoards } from "@/lib/hooks/useBoards";
import { useFolders } from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
};

/**
 * Cmd/Ctrl+K palette: boards, folders, pages and quick actions in one list.
 *
 * The board list is deliberately not filtered server-side — the palette is a
 * local navigation aid, and issuing a request per keystroke would make it feel
 * slower than the topbar search it sits next to.
 */
export function CommandPalette() {
  const router = useRouter();
  const open = useDashboardStore((state) => state.commandPaletteOpen);
  const setOpen = useDashboardStore((state) => state.setCommandPaletteOpen);
  const setCreateBoardOpen = useDashboardStore((state) => state.setCreateBoardOpen);
  const setCreateFolderOpen = useDashboardStore((state) => state.setCreateFolderOpen);
  const setSearch = useDashboardStore((state) => state.setSearch);
  const setActiveFilter = useDashboardStore((state) => state.setActiveFilter);

  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Same query key the board pages use, so the palette never issues a second
  // request for a list that is already cached.
  const { data: boards = [] } = useBoards({});
  const { data: folders = [] } = useFolders();

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
    }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const needle = query.trim().toLowerCase();

    const navigation: Command[] = [
      { id: "nav-home", label: "Go to Home", icon: House, run: () => router.push("/") },
      {
        id: "nav-favorites",
        label: "Go to Favorites",
        icon: Star,
        run: () => router.push("/favorites"),
      },
      {
        id: "nav-recent",
        label: "Go to Recent",
        icon: Clock3,
        run: () => router.push("/recent"),
      },
      { id: "nav-trash", label: "Go to Trash", icon: Trash, run: () => router.push("/trash") },
    ];

    const actions: Command[] = [
      {
        id: "action-new-board",
        label: "New board",
        hint: "N",
        icon: Plus,
        run: () => setCreateBoardOpen(true),
      },
      {
        id: "action-new-folder",
        label: "New folder",
        hint: "F",
        icon: FolderPlus,
        run: () => setCreateFolderOpen(true),
      },
    ];

    const folderCommands: Command[] = folders.map((folder) => ({
      id: `folder-${folder.id}`,
      label: folder.name,
      hint: `${folder.boardCount} ${folder.boardCount === 1 ? "board" : "boards"}`,
      icon: Folder,
      run: () => router.push(`/folders/${folder.id}`),
    }));

    const boardCommands: Command[] = boards.map((board) => ({
      id: `board-${board.id}`,
      label: board.title,
      hint: board.folder?.name,
      icon: LayoutGrid,
      run: () => router.push(`/board/${board.id}`),
    }));

    const all = [...actions, ...navigation, ...folderCommands, ...boardCommands];

    if (!needle) {
      return all;
    }

    return all.filter(
      (command) =>
        command.label.toLowerCase().includes(needle) ||
        command.hint?.toLowerCase().includes(needle),
    );
  }, [
    boards,
    folders,
    query,
    router,
    setCreateBoardOpen,
    setCreateFolderOpen,
  ]);

  // Keep the highlight inside the list as it shrinks under filtering.
  useEffect(() => {
    setHighlighted((current) => Math.min(current, Math.max(0, commands.length - 1)));
  }, [commands.length]);

  const closeThen = (run: () => void) => () => {
    setOpen(false);
    run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % Math.max(1, commands.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted(
        (index) => (index - 1 + commands.length) % Math.max(1, commands.length),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = commands[highlighted];
      if (command) {
        closeThen(command.run)();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>
            Search boards and folders, or run an action.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus -- the palette's
            // whole purpose is to be typed into the moment it opens.
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search boards, folders or actions…"
            aria-label="Search boards, folders or actions"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div
          ref={listRef}
          role="listbox"
          aria-label="Results"
          className="max-h-80 overflow-y-auto p-1.5"
        >
          {commands.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          ) : (
            commands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={closeThen(command.run)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === highlighted ? "bg-accent text-accent-foreground" : "",
                )}
              >
                <command.icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{command.label}</span>
                {command.hint ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {command.hint}
                  </span>
                ) : null}
                {index === highlighted ? (
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-muted px-1">↑</kbd>{" "}
            <kbd className="rounded border border-border bg-muted px-1">↓</kbd> to
            navigate
          </span>
          <span className="flex items-center gap-1">
            Searching filters the topbar too
            <button
              type="button"
              className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={closeThen(() => {
                setSearch(query);
                setActiveFilter("all");
                router.push("/");
              })}
            >
              Apply
            </button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
