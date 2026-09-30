"use client";

import { useEffect, useState } from "react";

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

type RenameModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  /** "board" or "folder" — drives the copy. */
  subject: "board" | "folder";
  onSave: (name: string) => void;
  isPending?: boolean;
};

/**
 * Enter saves, Escape reverts, blur saves. Empty input is rejected rather than
 * silently renaming to nothing.
 */
export function RenameModal({
  open,
  onOpenChange,
  currentName,
  subject,
  onSave,
  isPending = false,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);

  // Re-seed each time the dialog opens so a cancelled edit does not persist.
  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== currentName && !isPending;

  const save = () => {
    if (!canSave) {
      return;
    }
    onSave(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Rename {subject}</DialogTitle>
          <DialogDescription>
            Choose a new name. Press Enter to save.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <Label htmlFor="rename-input" className="sr-only">
            {subject} name
          </Label>
          <Input
            id="rename-input"
            value={name}
            autoFocus
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                save();
              } else if (event.key === "Escape") {
                // Let the dialog handle it, but drop the draft first.
                setName(currentName);
              }
            }}
          />
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
