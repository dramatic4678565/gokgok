"use client";

import { toast } from "sonner";

import { apiFetch, errorMessage } from "@/lib/api/client";

/**
 * Downloads a board's scene as a `.mosaic` JSON file.
 *
 * The MIME type is the renamed one, so the file round-trips through the
 * editor's own importer rather than only being readable by eye.
 */
export async function downloadBoardScene(id: string, title: string): Promise<void> {
  try {
    const scene = await apiFetch<{ elements: unknown[] }>(
      `/api/boards/${id}/scene`,
    );

    const payload = {
      type: "mosaic",
      version: 2,
      source: "https://mosaic.app",
      elements: scene.elements,
      appState: { viewBackgroundColor: "#ffffff" },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^\w\-. ]+/g, "_") || "board"}.mosaic.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Board downloaded");
  } catch (error) {
    toast.error(errorMessage(error, "Could not download the board"));
  }
}
