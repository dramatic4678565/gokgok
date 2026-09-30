"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { useFolders } from "@/lib/hooks/useFolders";
import { useCreateBoard } from "@/lib/hooks/useBoards";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { BOARD_TEMPLATES, UNCATEGORIZED_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

import type { BoardTemplateId } from "@/lib/types";

const NO_FOLDER = "__none__";

const TEMPLATE_PREVIEWS: Record<BoardTemplateId, string> = {
  blank: "A single empty canvas",
  flowchart: "Start, decision and outcome boxes",
  wireframe: "A browser window with content blocks",
  mindmap: "One central idea with three branches",
};

export function CreateBoardModal() {
  const router = useRouter();
  const open = useDashboardStore((state) => state.createBoardOpen);
  const setOpen = useDashboardStore((state) => state.setCreateBoardOpen);

  const { data: folders = [] } = useFolders();
  const createBoard = useCreateBoard();

  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string>(NO_FOLDER);
  const [template, setTemplate] = useState<BoardTemplateId>("blank");

  useEffect(() => {
    if (open) {
      setTitle("");
      setFolderId(NO_FOLDER);
      setTemplate("blank");
    }
  }, [open]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createBoard.mutate(
      {
        title: title.trim() || "Untitled Board",
        folderId: folderId === NO_FOLDER ? null : folderId,
        template,
      },
      {
        // Straight into the editor — creating a board you then have to go and
        // find is the wrong default.
        onSuccess: (board) => {
          setOpen(false);
          router.push(`/board/${board.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New board</DialogTitle>
          <DialogDescription>
            Give it a name, pick a folder, and choose a starting point.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="board-title">Board name</Label>
            <Input
              id="board-title"
              value={title}
              maxLength={120}
              placeholder="Untitled Board"
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="board-folder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_FOLDER}>{UNCATEGORIZED_LABEL}</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          folderColorClasses(folder.color).dot,
                        )}
                        aria-hidden="true"
                      />
                      {folder.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Start from</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BOARD_TEMPLATES.map((option) => {
                const isSelected = template === option.id;

                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm transition-colors",
                      "hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                      isSelected && "border-primary bg-primary/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setTemplate(option.id)}
                      className="sr-only"
                    />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {TEMPLATE_PREVIEWS[option.id]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating…" : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
