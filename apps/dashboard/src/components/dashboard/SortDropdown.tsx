"use client";

import { ArrowDownAZ, ArrowDownUp, CalendarDays, Clock } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

import type { SortBy } from "@/lib/types";

const OPTIONS: ReadonlyArray<{
  value: SortBy;
  label: string;
  icon: typeof Clock;
}> = [
  { value: "modified", label: "Last modified", icon: Clock },
  { value: "name", label: "Name A–Z", icon: ArrowDownAZ },
  { value: "created", label: "Date created", icon: CalendarDays },
  { value: "opened", label: "Last opened", icon: ArrowDownUp },
];

export function SortDropdown({ className }: { className?: string }) {
  const sortBy = useDashboardStore((state) => state.sortBy);
  const setSortBy = useDashboardStore((state) => state.setSortBy);

  const active = OPTIONS.find((option) => option.value === sortBy) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Sort by ${active.label}`}
          className={cn(
            "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <ActiveIcon className="size-4 shrink-0" />
          <span className="hidden sm:inline">{active.label}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Sort boards by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
          {OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setSortBy(option.value)}
              className={cn(
                sortBy === option.value && "bg-accent/60 font-medium",
              )}
            >
              <option.icon className="size-4" />
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
