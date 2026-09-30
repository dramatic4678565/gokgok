import { describe, expect, it } from "vitest";

import {
  boardDragId,
  folderDropId,
  parseBoardDragId,
  parseFolderDropId,
} from "@/lib/dashboard/dnd";

describe("drag ids", () => {
  it("round-trips a board id", () => {
    expect(parseBoardDragId(boardDragId("board-7"))).toBe("board-7");
  });

  it("round-trips a folder id", () => {
    expect(parseFolderDropId(folderDropId("folder-2"))).toBe("folder-2");
  });

  it("keeps the two namespaces apart", () => {
    // Both helpers are used on the same id shape during a drop, so a folder id
    // must never be readable as a board id.
    expect(parseBoardDragId(folderDropId("folder-2"))).toBeNull();
    expect(parseFolderDropId(boardDragId("folder-2"))).toBeNull();
  });

  it("preserves ids that themselves contain colons", () => {
    // Board ids from a real backend are opaque, so only the prefix may be split.
    const id = "board:weird:id";
    expect(parseBoardDragId(boardDragId(id))).toBe(id);
  });

  it("returns null for unrelated or missing ids", () => {
    expect(parseBoardDragId(undefined)).toBeNull();
    expect(parseBoardDragId("toast:1")).toBeNull();
    expect(parseFolderDropId(undefined)).toBeNull();
    expect(parseFolderDropId("SortableGrid-item")).toBeNull();
  });
});
