"use client";

import { useEffect, useState } from "react";

import { FolderColorPicker } from "@/components/dashboard/FolderColorPicker";
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
import { useCreateFolder } from "@/lib/hooks/useFolders";
import { useDashboardStore } from "@/lib/store/dashboardStore";

import type { FolderColor } from "@/lib/types";

export function CreateFolderModal() {
  const open = useDashboardStore((state) => state.createFolderOpen);
  const setOpen = useDashboardStore((state) => state.setCreateFolderOpen);
  const createFolder = useCreateFolder();

  const [name, setName] = useState("");
  const [color, setColor] = useState<FolderColor>("indigo");

  useEffect(() => {
    if (open) {
      setName("");
      setColor("indigo");
    }
  }, [open]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && !createFolder.isPending;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) {
      return;
    }

    createFolder.mutate(
      { name: trimmed, color },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            Group related boards together. You can rename or recolour it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={name}
              maxLength={80}
              placeholder="e.g. Product"
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Colour</Label>
            <FolderColorPicker value={color} onChange={setColor} layout="grid" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {createFolder.isPending ? "Creating…" : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
