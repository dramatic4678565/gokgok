"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { DashboardModals } from "@/components/dashboard/DashboardModals";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { parseBoardDragId, parseFolderDropId } from "@/lib/dashboard/dnd";
import { useMoveToFolder } from "@/lib/hooks/useBoards";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { useDashboardStore } from "@/lib/store/dashboardStore";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

/** What the drag overlay needs; supplied by the card's `useDraggable` data. */
type DraggedBoard = { boardId: string; title: string; folderId: string | null };

/**
 * The dashboard frame: navigation, topbar, content, and the one `DndContext`
 * that spans all of them — the sidebar folder rows and the board cards have to
 * share a context for dragging between the two to work at all.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  const moveToFolder = useMoveToFolder({ success: null });

  const mobileSidebarOpen = useDashboardStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useDashboardStore(
    (state) => state.setMobileSidebarOpen,
  );

  const [dragged, setDragged] = useState<DraggedBoard | null>(null);

  const sensors = useSensors(
    // A distance threshold keeps a plain click on the card a navigation rather
    // than the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const onDragStart = (event: DragStartEvent) => {
    setDragged((event.active.data.current as DraggedBoard | undefined) ?? null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDragged(null);

    const boardId = parseBoardDragId(String(event.active.id));
    const targetFolderId = parseFolderDropId(
      event.over ? String(event.over.id) : undefined,
    );

    if (!boardId || targetFolderId === null) {
      return;
    }

    const from = (event.active.data.current as DraggedBoard | undefined)?.folderId;

    if (from === targetFolderId) {
      return;
    }

    moveToFolder.mutate(
      { id: boardId, folderId: targetFolderId },
      {
        onSuccess: (board) => {
          toast.success(`“${board.title}” moved`);
        },
      },
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragged(null)}
    >
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* Fixed sidebar from `lg` up. */}
        <div className="hidden shrink-0 lg:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] p-6">{children}</div>
          </main>
        </div>

        {/* Below `lg` the same sidebar becomes a drawer. */}
        <Sheet
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        >
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar
              variant="drawer"
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <DragOverlay dropAnimation={null}>
        {dragged ? (
          <motion.div
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 1.02, opacity: 1 }}
            className="flex max-w-xs items-center gap-2 rounded-lg border border-primary/40 bg-card px-3 py-2 text-sm font-medium shadow-lg"
          >
            {dragged.title}
          </motion.div>
        ) : null}
      </DragOverlay>

      <DashboardModals />
      <CommandPalette />
    </DndContext>
  );
}
