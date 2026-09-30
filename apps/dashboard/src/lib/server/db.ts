import {
  type Activity,
  type ActivityPage,
  type ActivityType,
  type Board,
  type BoardQuery,
  type BoardTemplateId,
  type Folder,
  type FolderColor,
  type SortBy,
  type TrashRetentionDays,
} from "@/lib/types";

import { getTemplateScene, type BoardScene } from "./templates";

/**
 * Server-only in-memory store that stands in for the boards/folders/activity
 * backend. It is the *only* thing that would be replaced to point the dashboard
 * at a real service — the route handlers in `src/app/api/**` are the contract,
 * and the client never imports this module.
 *
 * State lives for the lifetime of the Node process, so a dev-server restart
 * resets to the seed. That is deliberate for a mock: there is no migration story
 * to maintain, and the fixtures stay readable.
 */

const TRASH_RETENTION_DAYS: TrashRetentionDays = 30;
export const ACTIVITY_PAGE_SIZE = 20;

/** A board plus the server-only fields that never reach the client. */
type BoardRecord = Board & {
  /** ISO timestamp of the soft delete, used for restore and the countdown. */
  deletedAt: string | null;
  scene: BoardScene;
};

type Db = {
  boards: Map<string, BoardRecord>;
  folders: Map<string, Folder>;
  activity: Activity[];
};

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const hoursAgo = (h: number) => minutesAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

const FOLDER_FIXTURES: ReadonlyArray<{
  name: string;
  color: FolderColor;
}> = [
  { name: "Product", color: "indigo" },
  { name: "Engineering", color: "blue" },
  { name: "Research", color: "purple" },
  { name: "Clients", color: "green" },
  { name: "Archive", color: "gray" },
];

type BoardFixture = {
  title: string;
  folder: string | null;
  favorite?: boolean;
  shared?: boolean;
  /** Minutes since the board was last opened. */
  openedMinutesAgo?: number | null;
  /** Hours since the board was last edited. */
  updatedHoursAgo: number;
  createdDaysAgo: number;
  deletedHoursAgo?: number;
  template?: BoardTemplateId;
};

const BOARD_FIXTURES: readonly BoardFixture[] = [
  { title: "Q3 product roadmap", folder: "Product", favorite: true, shared: true, openedMinutesAgo: 22, updatedHoursAgo: 1, createdDaysAgo: 64 },
  { title: "Onboarding flow", folder: "Product", favorite: true, openedMinutesAgo: 180, updatedHoursAgo: 5, createdDaysAgo: 48 },
  { title: "Pricing page wireframes", folder: "Product", shared: true, openedMinutesAgo: 1500, updatedHoursAgo: 30, createdDaysAgo: 40 },
  { title: "Feature request triage", folder: "Product", openedMinutesAgo: null, updatedHoursAgo: 96, createdDaysAgo: 35 },
  { title: "Service architecture", folder: "Engineering", favorite: true, shared: true, openedMinutesAgo: 65, updatedHoursAgo: 2, createdDaysAgo: 90 },
  { title: "Auth refactor plan", folder: "Engineering", openedMinutesAgo: 400, updatedHoursAgo: 12, createdDaysAgo: 55 },
  { title: "Incident postmortem — July", folder: "Engineering", openedMinutesAgo: 2900, updatedHoursAgo: 70, createdDaysAgo: 30 },
  { title: "Database migration dry run", folder: "Engineering", openedMinutesAgo: 7200, updatedHoursAgo: 140, createdDaysAgo: 22 },
  { title: "Client kickoff — Northwind", folder: "Clients", favorite: true, shared: true, openedMinutesAgo: 8, updatedHoursAgo: 3, createdDaysAgo: 12 },
  { title: "Northwind discovery notes", folder: "Clients", openedMinutesAgo: 240, updatedHoursAgo: 20, createdDaysAgo: 11 },
  { title: "Acme workshop whiteboard", folder: "Clients", openedMinutesAgo: 1500, updatedHoursAgo: 44, createdDaysAgo: 9 },
  { title: "Globex renewal timeline", folder: "Clients", openedMinutesAgo: 4300, updatedHoursAgo: 100, createdDaysAgo: 7 },
  { title: "User interview synthesis", folder: "Research", shared: true, openedMinutesAgo: 130, updatedHoursAgo: 8, createdDaysAgo: 26 },
  { title: "Competitor teardown", folder: "Research", openedMinutesAgo: 3100, updatedHoursAgo: 60, createdDaysAgo: 19 },
  { title: "Jobs to be done map", folder: "Research", openedMinutesAgo: 6000, updatedHoursAgo: 160, createdDaysAgo: 14 },
  { title: "2024 retro", folder: "Archive", openedMinutesAgo: null, updatedHoursAgo: 400, createdDaysAgo: 240 },
  { title: "Brand exploration v1", folder: "Archive", openedMinutesAgo: null, updatedHoursAgo: 620, createdDaysAgo: 300 },
  { title: "Team offsite planning", folder: null, favorite: true, openedMinutesAgo: 45, updatedHoursAgo: 6, createdDaysAgo: 18 },
  { title: "Reading list diagram", folder: null, openedMinutesAgo: 900, updatedHoursAgo: 24, createdDaysAgo: 16 },
  { title: "Untitled Board", folder: null, openedMinutesAgo: null, updatedHoursAgo: 200, createdDaysAgo: 5 },
  { title: "Sprint 42 burndown", folder: "Engineering", openedMinutesAgo: 6100, updatedHoursAgo: 180, createdDaysAgo: 4, deletedHoursAgo: 72 },
  { title: "Old pricing model", folder: "Product", openedMinutesAgo: null, updatedHoursAgo: 500, createdDaysAgo: 200, deletedHoursAgo: 240 },
  { title: "Hallway sketches", folder: null, openedMinutesAgo: null, updatedHoursAgo: 640, createdDaysAgo: 150, deletedHoursAgo: 480 },
];

const iso = (date: Date) => date.toISOString();

let activitySeq = 0;

/** Builds an activity entry. Shared by the seed and the mutators below so ids
 *  stay unique across both. */
const makeActivity = (
  type: ActivityType,
  board: { id: string; title: string },
  at: Date,
  folder?: Folder | null,
): Activity => ({
  id: `act-${++activitySeq}`,
  type,
  boardId: board.id,
  boardTitle: board.title,
  folderId: folder?.id ?? null,
  folderName: folder?.name ?? null,
  createdAt: iso(at),
});

function createSeed(): Db {
  const folders = new Map<string, Folder>();
  const folderIdByName = new Map<string, string>();

  FOLDER_FIXTURES.forEach((fixture, index) => {
    const id = `folder-${index + 1}`;
    folders.set(id, {
      id,
      name: fixture.name,
      color: fixture.color,
      createdAt: iso(daysAgo(200 - index * 10)),
      updatedAt: iso(daysAgo(20 - index)),
      boardCount: 0,
    });
    folderIdByName.set(fixture.name, id);
  });

  const boards = new Map<string, BoardRecord>();
  const activity: Activity[] = [];

  BOARD_FIXTURES.forEach((fixture, index) => {
    const id = `board-${index + 1}`;
    const folderId = fixture.folder
      ? (folderIdByName.get(fixture.folder) ?? null)
      : null;
    const folder = folderId ? (folders.get(folderId) ?? null) : null;

    const createdAt = daysAgo(fixture.createdDaysAgo);
    const updatedAt = hoursAgo(fixture.updatedHoursAgo);
    const lastOpenedAt =
      fixture.openedMinutesAgo == null
        ? null
        : minutesAgo(fixture.openedMinutesAgo);
    const deletedAt =
      fixture.deletedHoursAgo == null
        ? null
        : hoursAgo(fixture.deletedHoursAgo);

    const record: BoardRecord = {
      id,
      title: fixture.title,
      thumbnail: null,
      isFavorite: fixture.favorite ?? false,
      isDeleted: deletedAt !== null,
      folderId: folder?.id ?? null,
      lastOpenedAt: lastOpenedAt ? iso(lastOpenedAt) : null,
      updatedAt: iso(updatedAt),
      createdAt: iso(createdAt),
      isShared: fixture.shared ?? false,
      deletedAt: deletedAt ? iso(deletedAt) : null,
      scene: getTemplateScene(fixture.template ?? "blank"),
    };

    boards.set(id, record);

    if (folder) {
      folder.boardCount += 1;
    }

    // A plausible history per board: created, then a couple of edits and
    // opens, plus a delete for anything in the trash.
    activity.push(makeActivity("created", record, createdAt));
    if (activitySeq % 3 === 0) {
      activity.push(
        makeActivity("renamed", record, new Date(createdAt.getTime() + 3_600_000)),
      );
    }
    if (lastOpenedAt) {
      activity.push(makeActivity("opened", record, lastOpenedAt));
    }
    if (fixture.favorite) {
      activity.push(
        makeActivity("favorited", record, new Date(updatedAt.getTime() + 1_800_000)),
      );
    }
    if (deletedAt) {
      activity.push(makeActivity("deleted", record, deletedAt));
    }
  });

  activity.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { boards, folders, activity };
}

const emptyDb = (): Db => ({
  boards: new Map(),
  folders: new Map(),
  activity: [],
});

const globalForDb = globalThis as unknown as { __mosaicDashboardDb?: Db };

let db: Db = (globalForDb.__mosaicDashboardDb ??= createSeed());

/**
 * Replaces the store contents. Exists for tests: the store is a module-level
 * singleton so that it survives dev-server hot reloads, which also means one
 * test file would otherwise inherit every write made by the test before it.
 *
 * `seed: false` gives a genuinely empty store; the default restores the
 * fixtures, which is what a dev server wants.
 */
export function resetStore({ seed = true }: { seed?: boolean } = {}): void {
  db = seed ? createSeed() : emptyDb();
  globalForDb.__mosaicDashboardDb = db;
}

/** Appends an entry to the live activity feed. Called by every mutator that
 *  represents something a person would want to see in their history. */
const recordActivity = (
  type: ActivityType,
  board: { id: string; title: string },
  at: Date,
  folder?: Folder | null,
) => {
  db.activity.unshift(makeActivity(type, board, at, folder));
};

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

function toDto(record: BoardRecord): Board {
  const folder = record.folderId
    ? db.folders.get(record.folderId)
    : undefined;

  return {
    id: record.id,
    title: record.title,
    thumbnail: record.thumbnail,
    isFavorite: record.isFavorite,
    isDeleted: record.isDeleted,
    folderId: record.folderId,
    ...(folder
      ? { folder: { id: folder.id, name: folder.name, color: folder.color } }
      : {}),
    lastOpenedAt: record.lastOpenedAt,
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
    isShared: record.isShared ?? false,
  };
}

const withBoardCount = (folder: Folder): Folder => ({
  ...folder,
  boardCount: [...db.boards.values()].filter(
    (b) => !b.isDeleted && b.folderId === folder.id,
  ).length,
});

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

const SORTERS: Record<SortBy, (a: BoardRecord, b: BoardRecord) => number> = {
  modified: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  created: (a, b) => b.createdAt.localeCompare(a.createdAt),
  opened: (a, b) =>
    (b.lastOpenedAt ?? "").localeCompare(a.lastOpenedAt ?? "") ||
    b.updatedAt.localeCompare(a.updatedAt),
  name: (a, b) => a.title.localeCompare(b.title),
};

export function listBoards(query: BoardQuery = {}): Board[] {
  const { folder, favorite, search, sort = "modified", deleted = false } = query;

  const needle = search?.trim().toLowerCase();

  const rows = [...db.boards.values()].filter((record) => {
    if (record.isDeleted !== deleted) {
      return false;
    }
    if (favorite && !record.isFavorite) {
      return false;
    }
    if (folder === "none" && record.folderId !== null) {
      return false;
    }
    if (folder && folder !== "none" && record.folderId !== folder) {
      return false;
    }
    if (needle && !record.title.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });

  rows.sort(SORTERS[sort] ?? SORTERS.modified);

  return rows.map(toDto);
}

export function getBoard(id: string): Board | null {
  const record = db.boards.get(id);
  return record ? toDto(record) : null;
}

export function createBoard(input: {
  title?: string;
  folderId?: string | null;
  template?: BoardTemplateId;
}): Board {
  const now = new Date();
  const id = crypto.randomUUID();

  const record: BoardRecord = {
    id,
    title: input.title?.trim() || "Untitled Board",
    thumbnail: null,
    isFavorite: false,
    isDeleted: false,
    folderId: input.folderId ?? null,
    lastOpenedAt: null,
    updatedAt: iso(now),
    createdAt: iso(now),
    isShared: false,
    deletedAt: null,
    scene: getTemplateScene(input.template ?? "blank"),
  };

  db.boards.set(id, record);
  recordActivity("created", record, now, record.folderId ? db.folders.get(record.folderId) : null);

  return toDto(record);
}

export function updateBoard(
  id: string,
  patch: { title?: string; isFavorite?: boolean; folderId?: string | null },
): Board | null {
  const record = db.boards.get(id);
  if (!record) {
    return null;
  }

  const now = new Date();
  const previousFolderId = record.folderId;

  if (typeof patch.title === "string") {
    const title = patch.title.trim();
    if (title && title !== record.title) {
      record.title = title;
      recordActivity("renamed", record, now);
    }
  }

  if (typeof patch.isFavorite === "boolean" && patch.isFavorite !== record.isFavorite) {
    record.isFavorite = patch.isFavorite;
    if (patch.isFavorite) {
      recordActivity("favorited", record, now);
    }
  }

  if (patch.folderId !== undefined && patch.folderId !== previousFolderId) {
    record.folderId = patch.folderId;
    recordActivity(
      "moved",
      record,
      now,
      patch.folderId ? db.folders.get(patch.folderId) : null,
    );
  }

  record.updatedAt = iso(now);
  return toDto(record);
}

export function duplicateBoard(id: string): Board | null {
  const source = db.boards.get(id);
  if (!source) {
    return null;
  }

  const now = new Date();
  const copyId = crypto.randomUUID();

  const copy: BoardRecord = {
    ...source,
    id: copyId,
    title: `${source.title} (copy)`,
    thumbnail: null,
    isFavorite: false,
    isDeleted: false,
    lastOpenedAt: null,
    createdAt: iso(now),
    updatedAt: iso(now),
    deletedAt: null,
    scene: structuredClone(source.scene),
  };

  db.boards.set(copyId, copy);
  recordActivity("created", copy, now, copy.folderId ? db.folders.get(copy.folderId) : null);

  return toDto(copy);
}

export function softDeleteBoard(id: string): Board | null {
  const record = db.boards.get(id);
  if (!record) {
    return null;
  }

  const now = new Date();
  record.isDeleted = true;
  record.isFavorite = false;
  record.deletedAt = iso(now);
  record.updatedAt = iso(now);
  recordActivity("deleted", record, now);

  return toDto(record);
}

export function restoreBoard(id: string): Board | null {
  const record = db.boards.get(id);
  if (!record) {
    return null;
  }

  record.isDeleted = false;
  record.deletedAt = null;
  record.updatedAt = iso(new Date());

  return toDto(record);
}

export function deleteBoardForever(id: string): boolean {
  const record = db.boards.get(id);
  if (!record) {
    return false;
  }

  db.boards.delete(id);
  db.activity = db.activity.filter((entry) => entry.boardId !== id);
  return true;
}

export function emptyTrash(): number {
  const trashed = [...db.boards.values()].filter((b) => b.isDeleted);
  trashed.forEach((record) => {
    db.boards.delete(record.id);
  });
  db.activity = db.activity.filter((entry) => !trashed.some((b) => b.id === entry.boardId));
  return trashed.length;
}

export function touchBoard(id: string): Board | null {
  const record = db.boards.get(id);
  if (!record) {
    return null;
  }

  const now = new Date();
  record.lastOpenedAt = iso(now);
  recordActivity("opened", record, now);
  return toDto(record);
}

export function getBoardScene(id: string): BoardScene | null {
  return db.boards.get(id)?.scene ?? null;
}

export function saveBoardScene(id: string, scene: BoardScene): boolean {
  const record = db.boards.get(id);
  if (!record) {
    return false;
  }
  record.scene = scene;
  record.updatedAt = iso(new Date());
  return true;
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export function listFolders(): Folder[] {
  return [...db.folders.values()]
    .map(withBoardCount)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFolder(id: string): Folder | null {
  const folder = db.folders.get(id);
  return folder ? withBoardCount(folder) : null;
}

export function createFolder(input: {
  name?: string;
  color?: FolderColor;
}): Folder {
  const now = new Date();
  const id = crypto.randomUUID();
  const folder: Folder = {
    id,
    name: input.name?.trim() || "New folder",
    color: input.color ?? "indigo",
    createdAt: iso(now),
    updatedAt: iso(now),
    boardCount: 0,
  };

  db.folders.set(id, folder);
  return withBoardCount(folder);
}

export function updateFolder(
  id: string,
  patch: { name?: string; color?: FolderColor },
): Folder | null {
  const folder = db.folders.get(id);
  if (!folder) {
    return null;
  }

  if (typeof patch.name === "string" && patch.name.trim()) {
    folder.name = patch.name.trim();
  }
  if (patch.color) {
    folder.color = patch.color;
  }
  folder.updatedAt = iso(new Date());

  return withBoardCount(folder);
}

export function deleteFolder(id: string): { movedBoards: number } | null {
  const folder = db.folders.get(id);
  if (!folder) {
    return null;
  }

  let movedBoards = 0;
  const now = iso(new Date());

  db.boards.forEach((record) => {
    if (record.folderId === id) {
      record.folderId = null;
      record.updatedAt = now;
      movedBoards += 1;
    }
  });

  db.folders.delete(id);
  return { movedBoards };
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export function listActivity(
  query: { page?: number; type?: ActivityType | "all"; pageSize?: number } = {},
): ActivityPage {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? ACTIVITY_PAGE_SIZE);

  const filtered =
    !query.type || query.type === "all"
      ? db.activity
      : db.activity.filter((entry) => entry.type === query.type);

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    total: filtered.length,
    hasMore: start + items.length < filtered.length,
  };
}

export { TRASH_RETENTION_DAYS };
