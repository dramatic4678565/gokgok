"use client";

import { TriangleAlert } from "lucide-react";
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

type DeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. `“Q3 product roadmap”`. */
  subject: string;
  /** `"trash"` soft-deletes, `"permanent"` is irreversible. */
  variant: "trash" | "permanent";
  onConfirm: () => void;
  isPending?: boolean;
};

/**
 * Destructive confirmation.
 *
 * `variant="permanent"` requires a second click: the first arms the button and
 * relabels it, which is the cheapest guard that still stops a stray Enter from
 * deleting a board forever.
 */
export function DeleteConfirmModal({
  open,
  onOpenChange,
  subject,
  variant,
  onConfirm,
  isPending = false,
}: DeleteConfirmModalProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (open) {
      setArmed(false);
    }
  }, [open]);

  const isPermanent = variant === "permanent";
  const needsArming = isPermanent && !armed;

  const confirmLabel = isPermanent
    ? armed
      ? "Yes, delete forever"
      : "Delete forever"
    : "Move to Trash";

  const handleConfirm = () => {
    if (needsArming) {
      setArmed(true);
      return;
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 shrink-0 text-destructive" />
            {isPermanent ? "Delete permanently?" : `Delete ${subject}?`}
          </DialogTitle>
          <DialogDescription>
            {isPermanent ? (
              <>
                <strong className="font-medium text-foreground">{subject}</strong> will
                be removed for good. This cannot be undone.
              </>
            ) : (
              <>
                <strong className="font-medium text-foreground">{subject}</strong> will
                move to Trash. You can restore it for the next 30 days.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {needsArming ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Click “Delete forever” again to confirm.
          </p>
        ) : null}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            autoFocus={!needsArming}
          >
            {isPending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
