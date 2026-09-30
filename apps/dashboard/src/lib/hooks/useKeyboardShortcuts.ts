"use client";

import { useEffect } from "react";

import { focusSearchInput } from "@/lib/dashboard/search-focus";
import { useDashboardStore } from "@/lib/store/dashboardStore";

/** True when the user is typing somewhere, so a bare-letter shortcut must not fire. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Dashboard keyboard shortcuts.
 *
 * Cmd/Ctrl+K palette · N new board · F new folder · / focus search.
 * Escape is left to Radix, which already closes whichever dialog is open.
 */
export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useDashboardStore((s) => s.setCommandPaletteOpen);
  const setCreateBoardOpen = useDashboardStore((s) => s.setCreateBoardOpen);
  const setCreateFolderOpen = useDashboardStore((s) => s.setCreateFolderOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      // The palette shortcut works even while typing — it is a modifier combo.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      switch (event.key) {
        case "n":
        case "N":
          event.preventDefault();
          setCreateBoardOpen(true);
          break;
        case "f":
        case "F":
          event.preventDefault();
          setCreateFolderOpen(true);
          break;
        case "/":
          if (focusSearchInput()) {
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen, setCreateBoardOpen, setCreateFolderOpen]);
}
