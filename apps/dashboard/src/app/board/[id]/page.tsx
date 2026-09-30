"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { useTouchBoard } from "@/lib/hooks/useBoards";

import type { Board } from "@/lib/types";

/**
 * `/board/[id]` — the editor route.
 *
 * The Mosaic editor touches `window` while its module is evaluated, so it is
 * pulled in with `ssr: false` and lives behind a dynamic boundary. This
 * component owns everything around it: resolving the board, fetching its scene,
 * recording the open, and offering a way back.
 */
const MosaicEditor = dynamic(
  () => import("@/components/board/MosaicEditor").then((m) => m.MosaicEditor),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 grid place-items-center bg-background">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading editor…
        </span>
      </div>
    ),
  },
);

function Loading({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </span>
    </div>
  );
}

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const router = useRouter();

  const touchBoard = useTouchBoard();

  const [board, setBoard] = useState<Board | null>(null);
  const [scene, setScene] = useState<unknown>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [boardRow, boardScene] = await Promise.all([
          apiFetch<Board>(`/api/boards/${boardId}`),
          apiFetch<unknown>(`/api/boards/${boardId}/scene`),
        ]);

        if (cancelled) {
          return;
        }

        setBoard(boardRow);
        setScene(boardScene);
        setStatus("ready");

        // Records `lastOpenedAt`, which Recent and "Last opened" read.
        touchBoard.mutate(boardId);
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (errorMessage(error, "").includes("404")) {
          setStatus("missing");
        } else {
          setStatus("error");
          toast.error(errorMessage(error, "Could not open this board"));
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // `touchBoard` is a stable mutation object; re-running on every render
    // would refetch the scene each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  if (status === "loading") {
    return <Loading label="Opening board…" />;
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="fixed inset-0 grid place-items-center bg-background px-6">
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold">We couldn&apos;t open that board</h1>
          <p className="text-sm text-muted-foreground">
            {status === "missing"
              ? "It may have been deleted, or the link is out of date."
              : "Something went wrong loading it."}
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="size-4" />
            Back to boards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mosaic-host">
      <MosaicEditor
        boardId={boardId}
        title={board?.title ?? "Untitled Board"}
        initialData={scene}
      />
    </div>
  );
}
