"use client";

import {
  Activity,
  Clock3,
  House,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Star,
  Trash,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { FolderSidebarList } from "@/components/dashboard/FolderSidebarList";
import { SidebarItem } from "@/components/dashboard/SidebarItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: House, exact: true },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/recent", label: "Recent", icon: Clock3 },
  { href: "/trash", label: "Trash", icon: Trash },
  { href: "/activity", label: "Activity", icon: Activity },
] as const;

const BOTTOM_NAV = [{ href: "/settings", label: "Settings", icon: Settings }] as const;

type SidebarProps = {
  /** Called after a navigation — used to close the mobile drawer. */
  onNavigate?: () => void;
  /** The mobile drawer renders its own close affordance. */
  variant?: "desktop" | "drawer";
};

export function Sidebar({ onNavigate, variant = "desktop" }: SidebarProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();

  const collapsed = useDashboardStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const setCreateFolderOpen = useDashboardStore((state) => state.setCreateFolderOpen);

  // `persist` rehydrates after mount; until then render the expanded sidebar so
  // the server and client agree.
  const isCollapsed = hydrated && collapsed && variant === "desktop";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-200 ease-out",
        isCollapsed ? "w-16" : "w-60",
        variant === "drawer" && "w-full border-r-0",
      )}
    >
      {/* Logo ------------------------------------------------------- */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2.5 px-3",
          isCollapsed && "justify-center px-0",
        )}
      >
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]">
            <path
              d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
              fill="currentColor"
            />
          </svg>
        </span>

        {!isCollapsed ? (
          <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
            Mosaic
          </span>
        ) : null}

        {variant === "desktop" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={isCollapsed}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="size-[18px]" />
                ) : (
                  <PanelLeftClose className="size-[18px]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* Primary nav ----------------------------------------------- */}
      <nav aria-label="Main" className="px-2 py-1">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarItem
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href, "exact" in item ? item.exact : false)}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      <Separator className="mx-2 my-2 w-auto bg-sidebar-border" />

      {/* Folders ----------------------------------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "flex h-8 items-center px-4",
            isCollapsed && "justify-center px-0",
          )}
        >
          {!isCollapsed ? (
            <>
              <h2 className="flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Folders
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCreateFolderOpen(true)}
                    aria-label="New folder"
                  >
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New folder (F)</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCreateFolderOpen(true)}
                  aria-label="New folder"
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New folder (F)</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
          <FolderSidebarList collapsed={isCollapsed} onNavigate={onNavigate} />
        </div>
      </div>

      {/* Pinned ------------------------------------------------------ */}
      <div className="border-t border-sidebar-border p-2">
        <ul className="space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <li key={item.href}>
              <SidebarItem
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                collapsed={isCollapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
