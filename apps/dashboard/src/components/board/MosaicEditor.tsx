"use client";

import { ArrowLeft, Check, CloudUpload, Loader2 } from "lucide-react";
import { Mosaic } from "@mosaic/mosaic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch, errorMessage } from "@/lib/api/client";

import type { MosaicProps } from "@mosaic/mosaic/types";

/** `THEME` values from `@mosaic/common`, restated so this file needs no extra
 *  dependency on the editor's shared package. */
type EditorTheme = "light" | "dark";

/**
 * Bridges the dashboard to the Mosaic editor.
 *
 * This is the only file that imports `@mosaic/mosaic`, which keeps the editor's
 * DOM requirements — and its stylesheet, loaded in `app/board/layout.tsx` — out
 * of the rest of the app. It is only ever reached from `/board/[id]`, which
 * loads it with `ssr: false`.
 */
export function MosaicEditor({
  boardId,
  title,
  initialData,
}: {
  boardId: string;
  title: string;
  initialData: unknown;
}) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [theme, setTheme] = useState<EditorTheme>("light");

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The scene arrives as `unknown` because it is JSON off the wire. The editor
  // normalises it on load, so the cast happens here, at the boundary, and
  // nowhere else.
  const editorInitialData = initialData as MosaicProps["initialData"];

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setTheme(query.matches ? "dark" : "light");

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const persist = useCallback(
    (elements: unknown) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setSaveState("saving");

      // Debounced: `onChange` fires on every pointer move.
      timer.current = setTimeout(() => {
        apiFetch(`/api/boards/${boardId}/scene`, {
          method: "PUT",
          body: { elements, appState: { viewBackgroundColor: "#ffffff" } },
        })
          .then(() => setSaveState("saved"))
          .catch((error: unknown) => {
            setSaveState("error");
            // Reported in the toolbar rather than as a toast, so it does not
            // fight the editor's own notifications.
            console.warn(
              "Mosaic: could not save the scene",
              errorMessage(error, "unknown error"),
            );
          });
      }, 1500);
    },
    [boardId],
  );

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 shadow-sm backdrop-blur">
          <Link
            href="/"
            aria-label="Back to boards"
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-[18px]" />
          </Link>
          <span className="max-w-[40vw] truncate pr-1 text-sm font-medium">
            {title}
          </span>
        </div>

        <div
          className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur"
          role="status"
          aria-live="polite"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </>
          ) : saveState === "error" ? (
            "Could not save"
          ) : saveState === "saved" ? (
            <>
              <Check className="size-3.5" />
              Saved
            </>
          ) : (
            <>
              <CloudUpload className="size-3.5" />
              Autosaves
            </>
          )}
        </div>
      </div>

      <Mosaic
        initialData={editorInitialData}
        theme={theme}
        viewModeEnabled
        zenModeEnabled={false}
        gridModeEnabled={false}
        detectScroll={false}
        onChange={(elements) => persist(elements)}
      />
    </>
  );
}
