"use client";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { folderColorClasses } from "@/lib/dashboard/folder-colors";
import { useFolders } from "@/lib/hooks/useFolders";
import { UNCATEGORIZED_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const UNCATEGORIZED = "__uncategorized__";

type MoveToFolderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardTitle: string;
  currentFolderId: string | null;
  onMove: (folderId: string | null) => void;
  isPending?: boolean;
};

export function MoveToFolderModal({
  open,
  onOpenChange,
  boardTitle,
  currentFolderId,
  onMove,
  isPending = false,
}: MoveToFolderModalProps) {
  const { data: folders = [] } = useFolders();
  const [selection, setSelection] = useState<string>(
    currentFolderId ?? UNCATEGORIZED,
  );

  useEffect(() => {
    if (open) {
      setSelection(currentFolderId ?? UNCATEGORIZED);
    }
  }, [open, currentFolderId]);

  const selectedFolderId =
    selection === UNCATEGORIZED ? null : (selection as string);

  const confirm = () => {
    if (selectedFolderId === currentFolderId) {
      onOpenChange(false);
      return;
    }
    onMove(selectedFolderId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>
            Choose where “{boardTitle}” should live.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selection}
          onValueChange={setSelection}
          className="max-h-72 gap-1 overflow-y-auto pr-1"
        >
          <label
            htmlFor="folder-none"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
              "hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5",
            )}
          >
            <RadioGroupItem id="folder-none" value={UNCATEGORIZED} />
            <span className="flex-1">{UNCATEGORIZED_LABEL}</span>
          </label>

          {folders.map((folder) => {
            const colors = folderColorClasses(folder.color);
            return (
              <Label
                key={folder.id}
                htmlFor={`folder-${folder.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                )}
              >
                <RadioGroupItem id={`folder-${folder.id}`} value={folder.id} />
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", colors.dot)}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {folder.boardCount}
                </span>
              </Label>
            );
          })}
        </RadioGroup>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={isPending}>
            Move board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
