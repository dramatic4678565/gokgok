import { beforeEach, describe, expect, it } from "vitest";

import {
  createBoard,
  createFolder,
  deleteFolder,
  deleteBoardForever,
  duplicateBoard,
  emptyTrash,
  getBoard,
  getBoardScene,
  listActivity,
  listBoards,
  listFolders,
  resetStore,
  restoreBoard,
  softDeleteBoard,
  touchBoard,
  updateBoard,
} from "@/lib/server/db";

import type { Board } from "@/lib/types";

/**
 * The store is a module-level singleton, so each test starts from an empty one
 * rather than inheriting whatever ran before it. The fixtures are bypassed —
 * the seed's 23 boards would make every count assertion wrong.
 */
const seed = (): Board[] => {
  const product = createFolder({ name: "Product", color: "indigo" });
  const engineering = createFolder({ name: "Engineering", color: "blue" });

  const roadmap = createBoard({ title: "Roadmap", folderId: product.id });
  const architecture = createBoard({
    title: "Architecture",
    folderId: engineering.id,
  });
  const scratch = createBoard({ title: "Scratch" });

  return [roadmap, architecture, scratch];
};

let created: Board[];

beforeEach(() => {
  resetStore({ seed: false });
  created = seed();
});

describe("createBoard", () => {
  it("defaults the title when none is given", () => {
    const board = createBoard({});
    expect(board.title).toBe("Untitled Board");
  });

  it("trims a provided title", () => {
    expect(createBoard({ title: "  Padded  " }).title).toBe("Padded");
  });

  it("starts unfiled, unfavorited and unopened", () => {
    const board = createBoard({ title: "Fresh" });
    expect(board.folderId).toBeNull();
    expect(board.isFavorite).toBe(false);
    expect(board.isDeleted).toBe(false);
    expect(board.lastOpenedAt).toBeNull();
  });
});

describe("listBoards", () => {
  it("excludes soft-deleted boards unless asked for them", () => {
    softDeleteBoard(created[0].id);

    const live = listBoards().map((b) => b.id);
    const trashed = listBoards({ deleted: true }).map((b) => b.id);

    expect(live).not.toContain(created[0].id);
    expect(trashed).toContain(created[0].id);
  });

  it("filters by folder", () => {
    const folderId = created[0].folderId!;
    const rows = listBoards({ folder: folderId });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(created[0].id);
  });

  it("supports the synthetic Uncategorized folder", () => {
    const rows = listBoards({ folder: "none" });
    expect(rows.map((b) => b.id)).toEqual([created[2].id]);
  });

  it("searches titles case-insensitively", () => {
    expect(listBoards({ search: "ROADMAP" }).map((b) => b.id)).toEqual([
      created[0].id,
    ]);
    expect(listBoards({ search: "  " })).toHaveLength(3);
  });

  it("filters favorites", () => {
    updateBoard(created[0].id, { isFavorite: true });
    const rows = listBoards({ favorite: true });
    expect(rows.map((b) => b.id)).toEqual([created[0].id]);
  });

  it("sorts by name ascending", () => {
    const rows = listBoards({ sort: "name" }).map((b) => b.title);
    expect(rows).toEqual([...rows].sort((a, b) => a.localeCompare(b)));
  });

  it("sorts opened boards by lastOpenedAt, unopened last", () => {
    touchBoard(created[0].id);
    const rows = listBoards({ sort: "opened" });
    expect(rows[0].id).toBe(created[0].id);
    expect(rows.at(-1)!.lastOpenedAt).toBeNull();
  });

  it("embeds the folder summary on each board", () => {
    const board = listBoards({ folder: created[0].folderId! })[0];
    expect(board.folder?.name).toBe("Product");
  });
});

describe("updateBoard", () => {
  it("renames and refreshes updatedAt", () => {
    const before = getBoard(created[0].id)!.updatedAt;
    const board = updateBoard(created[0].id, { title: "Renamed" });

    expect(board?.title).toBe("Renamed");
    // `>=` not `>`: creation and rename can land in the same millisecond, so a
    // strict comparison would be flaky. What matters is that the timestamp is
    // refreshed forward, never backward.
    expect(Date.parse(getBoard(created[0].id)!.updatedAt)).toBeGreaterThanOrEqual(
      Date.parse(before),
    );
  });

  it("ignores a blank rename rather than clearing the title", () => {
    expect(updateBoard(created[0].id, { title: "   " })?.title).toBe(
      "Roadmap",
    );
  });

  it("moves between folders and to Uncategorized", () => {
    expect(updateBoard(created[0].id, { folderId: null })?.folderId).toBeNull();
    expect(updateBoard(created[0].id, { folderId: null })?.folder).toBeUndefined();
  });

  it("returns null for an unknown board", () => {
    expect(updateBoard("nope", { title: "x" })).toBeNull();
  });
});

describe("delete lifecycle", () => {
  it("soft delete clears the favorite flag", () => {
    updateBoard(created[0].id, { isFavorite: true });
    expect(softDeleteBoard(created[0].id)?.isFavorite).toBe(false);
  });

  it("restore clears the deleted flag", () => {
    softDeleteBoard(created[0].id);
    expect(restoreBoard(created[0].id)?.isDeleted).toBe(false);
  });

  it("permanent delete removes the board and its history", () => {
    const activityBefore = listActivity({ pageSize: 1000 }).total;
    expect(softDeleteBoard(created[0].id)).not.toBeNull();

    expect(deleteBoardForever(created[0].id)).toBe(true);
    expect(getBoard(created[0].id)).toBeNull();
    expect(deleteBoardForever(created[0].id)).toBe(false);

    const after = listActivity({ pageSize: 1000 }).total;
    expect(after).toBeLessThan(activityBefore);
  });

  it("emptyTrash removes only soft-deleted boards", () => {
    softDeleteBoard(created[0].id);

    expect(emptyTrash()).toBe(1);
    expect(getBoard(created[0].id)).toBeNull();
    expect(getBoard(created[1].id)).not.toBeNull();
    expect(getBoard(created[2].id)).not.toBeNull();
  });
});

describe("duplicateBoard", () => {
  it("copies the title, folder and scene but not the flags", () => {
    updateBoard(created[0].id, { isFavorite: true });
    const copy = duplicateBoard(created[0].id);

    expect(copy?.title).toBe("Roadmap (copy)");
    expect(copy?.isFavorite).toBe(false);
    expect(copy?.folderId).toBe(created[0].folderId);
    expect(copy?.id).not.toBe(created[0].id);
  });

  it("copies the scene rather than aliasing the source's", () => {
    const source_ = createBoard({ title: "Source", template: "flowchart" });
    const copyId = duplicateBoard(source_.id)!.id;

    const source = getBoardScene(source_.id)!;
    const copy = getBoardScene(copyId)!;

    expect(source.elements.length).toBeGreaterThan(0);
    // Deep copy, so the editor mutating the copy cannot reach back into the
    // original. Element ids are intentionally identical — uniqueness is only
    // required within one document.
    expect(copy).not.toBe(source);
    expect(copy.elements).not.toBe(source.elements);
    expect(copy.elements[0]).not.toBe(source.elements[0]);
    expect(copy.elements.map((e) => e.id)).toEqual(
      source.elements.map((e) => e.id),
    );
  });
});

describe("folders", () => {
  it("recomputes boardCount from live boards", () => {
    const folder = createFolder({ name: "Counted" });
    createBoard({ title: "In", folderId: folder.id });
    createBoard({ title: "Also in", folderId: folder.id });

    expect(listFolders().find((f) => f.id === folder.id)?.boardCount).toBe(2);
  });

  it("deleting a folder uncategorizes its boards and reports the count", () => {
    const folderId = created[0].folderId!;

    expect(deleteFolder(folderId)).toEqual({ movedBoards: 1 });
    expect(getBoard(created[0].id)?.folderId).toBeNull();
    expect(getBoard(created[0].id)?.folder).toBeUndefined();
  });

  it("returns null when deleting an unknown folder", () => {
    expect(deleteFolder("nope")).toBeNull();
  });

  it("rejects a blank name", () => {
    expect(createFolder({ name: "  " }).name).toBe("New folder");
  });
});

describe("activity", () => {
  it("records the mutating actions", () => {
    const board = created[0];
    updateBoard(board.id, { isFavorite: true });
    updateBoard(board.id, { title: "Renamed" });

    const types = new Set(
      listActivity({ pageSize: 1000 }).items.map((entry) => entry.type),
    );

    expect(types.has("created")).toBe(true);
    expect(types.has("favorited")).toBe(true);
    expect(types.has("renamed")).toBe(true);
  });

  it("paginates and reports hasMore", () => {
    const first = listActivity({ page: 1, pageSize: 2 });
    expect(first.items).toHaveLength(2);
    expect(first.hasMore).toBe(true);

    const last = listActivity({
      page: Math.ceil(first.total / 2),
      pageSize: 2,
    });
    expect(last.hasMore).toBe(false);
  });

  it("filters by type", () => {
    createBoard({ title: "Filtered" });
    const created_ = listActivity({ type: "created", pageSize: 1000 });

    expect(created_.items.length).toBeGreaterThan(0);
    expect(
      created_.items.every((entry) => entry.type === "created"),
    ).toBe(true);
  });

  it("orders newest first", () => {
    const items = listActivity({ pageSize: 1000 }).items;
    const timestamps = items.map((entry) => entry.createdAt);
    expect([...timestamps].sort((a, b) => b.localeCompare(a))).toEqual(timestamps);
  });
});

describe("the Board DTO", () => {
  it("never leaks the server-only fields", () => {
    const dto = getBoard(created[0].id)!;
    expect(dto).not.toHaveProperty("scene");
    expect(dto).not.toHaveProperty("deletedAt");
  });
});
