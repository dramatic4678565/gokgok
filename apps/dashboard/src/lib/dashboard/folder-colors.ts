import { FOLDER_COLORS } from "@/lib/types";

import type { FolderColor } from "@/lib/types";

/**
 * Tailwind classes for each folder colour.
 *
 * Written out in full rather than composed at runtime: Tailwind only emits
 * classes it can see in the source, so an interpolated
 * `bg-${color}-500` would compile to nothing.
 */
type FolderColorClasses = {
  /** The solid dot in the sidebar and on folder cards. */
  dot: string;
  /** Tinted background for a folder pill on a board card. */
  pill: string;
  /** Ring colour while a board is dragged over this folder. */
  ring: string;
  /** Fill for the colour-picker swatch when it is not selected. */
  swatch: string;
};

const CLASSES: Record<FolderColor, FolderColorClasses> = {
  indigo: {
    dot: "bg-indigo-500",
    pill: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    ring: "ring-indigo-500",
    swatch: "bg-indigo-500",
  },
  blue: {
    dot: "bg-blue-500",
    pill: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    ring: "ring-blue-500",
    swatch: "bg-blue-500",
  },
  green: {
    dot: "bg-green-500",
    pill: "bg-green-500/10 text-green-700 dark:text-green-300",
    ring: "ring-green-500",
    swatch: "bg-green-500",
  },
  amber: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500",
    swatch: "bg-amber-500",
  },
  red: {
    dot: "bg-red-500",
    pill: "bg-red-500/10 text-red-700 dark:text-red-300",
    ring: "ring-red-500",
    swatch: "bg-red-500",
  },
  pink: {
    dot: "bg-pink-500",
    pill: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
    ring: "ring-pink-500",
    swatch: "bg-pink-500",
  },
  purple: {
    dot: "bg-purple-500",
    pill: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    ring: "ring-purple-500",
    swatch: "bg-purple-500",
  },
  gray: {
    dot: "bg-neutral-400 dark:bg-neutral-500",
    pill: "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300",
    ring: "ring-neutral-500",
    swatch: "bg-neutral-400 dark:bg-neutral-600",
  },
};

export function folderColorClasses(color: FolderColor | string | undefined) {
  return CLASSES[(color as FolderColor) in CLASSES ? (color as FolderColor) : "gray"];
}

export { FOLDER_COLORS };
