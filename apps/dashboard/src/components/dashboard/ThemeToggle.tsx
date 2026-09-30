"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * next-themes cannot know the resolved theme on the server, so the icon is
 * neutral until the component has mounted. Rendering the real icon immediately
 * would be a hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? (theme ?? "system") : "system";
  const ActiveIcon = !mounted
    ? Monitor
    : active === "system"
      ? Monitor
      : active === "dark"
        ? Moon
        : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Theme: ${active}`}
          className={cn(
            "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <ActiveIcon className="size-[18px]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
            className={cn(active === option.value && "bg-accent/60 font-medium")}
          >
            <option.icon className="size-4" />
            {option.label}
            {active === option.value ? (
              <span className="sr-only">(current)</span>
            ) : null}
          </DropdownMenuItem>
        ))}
        {!mounted ? null : (
          <span className="sr-only">Resolved theme: {resolvedTheme}</span>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
