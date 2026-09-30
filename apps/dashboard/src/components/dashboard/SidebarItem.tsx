"use client";

import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Highlights the row and marks it `aria-current="page"`. */
  isActive: boolean;
  /** Trailing count, e.g. the number of boards in a folder. */
  badge?: number;
  /** Hides the label and shows a tooltip on hover — collapsed sidebar. */
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
};

export function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive,
  badge,
  collapsed = false,
  className,
  onNavigate,
}: SidebarItemProps) {
  const row = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? undefined : label}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
        collapsed ? "justify-center px-0" : "px-2.5",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        className,
      )}
    >
      {/* Left border accent marks the active route without shifting the row. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />

      <Icon className="size-[18px] shrink-0" />

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {typeof badge === "number" && badge > 0 ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-sidebar-accent text-muted-foreground",
              )}
            >
              {badge}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );

  if (!collapsed) {
    return row;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
