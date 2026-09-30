"use client";

import { Eye, Folder, Pencil, Plus, Star, Trash } from "lucide-react";
import Link from "next/link";

import { relativeTime } from "@/lib/dashboard/format";
import { cn } from "@/lib/utils";

import type { Activity, ActivityType } from "@/lib/types";

type Meta = {
  label: string;
  icon: typeof Plus;
  className: string;
  ring: string;
};

const META: Record<ActivityType, Meta> = {
  created: {
    label: "Created",
    icon: Plus,
    className: "text-green-600 dark:text-green-500",
    ring: "bg-green-500/10",
  },
  renamed: {
    label: "Renamed",
    icon: Pencil,
    className: "text-blue-600 dark:text-blue-500",
    ring: "bg-blue-500/10",
  },
  deleted: {
    label: "Deleted",
    icon: Trash,
    className: "text-red-600 dark:text-red-500",
    ring: "bg-red-500/10",
  },
  opened: {
    label: "Opened",
    icon: Eye,
    className: "text-muted-foreground",
    ring: "bg-muted",
  },
  favorited: {
    label: "Favorited",
    icon: Star,
    className: "text-amber-500",
    ring: "bg-amber-500/10",
  },
  moved: {
    label: "Moved",
    icon: Folder,
    className: "text-purple-600 dark:text-purple-500",
    ring: "bg-purple-500/10",
  },
};

export function ActivityItem({ activity }: { activity: Activity }) {
  const meta = META[activity.type];
  const Icon = meta.icon;

  const summary =
    activity.type === "moved"
      ? `${meta.label} “${activity.boardTitle}” to ${activity.folderName ?? "Uncategorized"}`
      : `${meta.label} “${activity.boardTitle}”`;

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {/* Connector line between entries, stopping at the last one. */}
      <span
        aria-hidden="true"
        className="absolute left-[15px] top-9 bottom-0 w-px bg-border last:hidden"
      />

      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 grid size-8 shrink-0 place-items-center rounded-full",
          meta.ring,
        )}
      >
        <Icon className={cn("size-4", meta.className)} />
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <p className="truncate text-sm">
          <span className={cn("font-medium", meta.className)}>{meta.label}</span>{" "}
          <Link
            href={`/board/${activity.boardId}`}
            className="rounded-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {activity.boardTitle}
          </Link>
          {activity.type === "moved" && activity.folderName ? (
            <>
              {" "}
              <span className="text-muted-foreground">to {activity.folderName}</span>
            </>
          ) : null}
        </p>
        <time
          dateTime={activity.createdAt}
          className="mt-0.5 block text-xs text-muted-foreground"
        >
          {relativeTime(activity.createdAt)}
        </time>
        <span className="sr-only">{summary}</span>
      </div>
    </li>
  );
}

export { META as ACTIVITY_META };
