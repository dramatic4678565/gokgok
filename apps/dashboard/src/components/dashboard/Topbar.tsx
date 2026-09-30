"use client";

import { Menu, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { SearchBar } from "@/components/dashboard/SearchBar";
import { SortDropdown } from "@/components/dashboard/SortDropdown";
import { UserMenu } from "@/components/dashboard/UserMenu";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/store/dashboardStore";

type TopbarProps = {
  /** Board-list pages get search, view and sort; other pages do not. */
  showBoardControls?: boolean;
};

export function Topbar({ showBoardControls = true }: TopbarProps) {
  const setCreateBoardOpen = useDashboardStore((state) => state.setCreateBoardOpen);
  const setCommandPaletteOpen = useDashboardStore((state) => state.setCommandPaletteOpen);
  const setMobileSidebarOpen = useDashboardStore((state) => state.setMobileSidebarOpen);

  // `lg` is the breakpoint where the fixed sidebar appears, so the hamburger
  // has to disappear at the same point — otherwise there are two competing
  // ways to open navigation.
  const [hasFixedSidebar, setHasFixedSidebar] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setHasFixedSidebar(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur sm:gap-3 sm:px-6">
      {!hasFixedSidebar ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation"
          className="shrink-0"
        >
          <Menu className="size-5" />
        </Button>
      ) : null}

      {showBoardControls ? (
        <>
          {/* Below `sm` the field collapses into an icon that opens the command
              palette, which carries the same search. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Search boards"
            className="shrink-0 sm:hidden"
          >
            <Search className="size-5" />
          </Button>

          <SearchBar className="hidden min-w-0 flex-1 sm:block sm:max-w-md" />
        </>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {showBoardControls ? (
          <>
            <ViewToggle />
            <SortDropdown className="hidden md:inline-flex" />
          </>
        ) : null}

        {showBoardControls ? (
          <Button onClick={() => setCreateBoardOpen(true)} className="shrink-0">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New Board</span>
          </Button>
        ) : null}

        <UserMenu />
      </div>
    </header>
  );
}
