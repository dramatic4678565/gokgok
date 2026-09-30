"use client";

import { Check } from "lucide-react";

import { FOLDER_COLORS, folderColorClasses } from "@/lib/dashboard/folder-colors";
import { cn } from "@/lib/utils";

import type { FolderColor } from "@/lib/types";

type FolderColorPickerProps = {
  value: FolderColor;
  onChange: (color: FolderColor) => void;
  /** Renders swatches in a row, or as a wrapping grid inside a dialog. */
  layout?: "row" | "grid";
  className?: string;
};

export function FolderColorPicker({
  value,
  onChange,
  layout = "row",
  className,
}: FolderColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Folder colour"
      className={cn(
        layout === "row" ? "flex items-center gap-1.5" : "grid grid-cols-8 gap-2",
        className,
      )}
    >
      {FOLDER_COLORS.map((color) => {
        const isSelected = color === value;

        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color}
            title={color}
            onClick={() => onChange(color)}
            className={cn(
              "relative grid place-items-center rounded-full transition-transform",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              layout === "row" ? "size-6" : "size-8",
              !isSelected && "hover:scale-110",
            )}
          >
            <span
              className={cn(
                "size-full rounded-full",
                folderColorClasses(color).swatch,
              )}
            />
            {isSelected ? (
              <Check
                className={cn(
                  "absolute size-3.5 text-white drop-shadow",
                  layout === "row" && "size-3",
                )}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
