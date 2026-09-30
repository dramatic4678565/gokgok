"use client";

import { Star } from "lucide-react";

import { useToggleFavorite } from "@/lib/hooks/useBoards";
import { cn } from "@/lib/utils";

type StarButtonProps = {
  boardId: string;
  title: string;
  isFavorite: boolean;
  className?: string;
  /** Called after a successful toggle — used to close an open menu. */
  onToggled?: () => void;
};

/**
 * Favourite toggle with an optimistic update, so the star fills in on click
 * rather than after the round trip.
 */
export function StarButton({
  boardId,
  title,
  isFavorite,
  className,
  onToggled,
}: StarButtonProps) {
  const toggle = useToggleFavorite({ success: null });

  const label = isFavorite
    ? `Remove “${title}” from favorites`
    : `Add “${title}” to favorites`;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      disabled={toggle.isPending}
      className={cn(
        "grid size-8 place-items-center rounded-full transition-colors",
        "hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "dark:hover:bg-white/10",
        isFavorite
          ? "text-amber-500"
          : "text-neutral-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
      onClick={(event) => {
        // The card is a link; starring must not navigate.
        event.preventDefault();
        event.stopPropagation();
        toggle.mutate(
          { id: boardId, isFavorite: !isFavorite },
          { onSuccess: onToggled },
        );
      }}
    >
      <Star className={cn("size-[18px]", isFavorite && "fill-current")} />
    </button>
  );
}
