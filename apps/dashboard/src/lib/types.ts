/**
 * Domain types for the Mosaic dashboard.
 *
 * These mirror the HTTP contract exactly (see `src/lib/api/*` and the route
 * handlers under `src/app/api`). Pointing the app at a real backend means
 * changing `API_BASE_URL` in `src/lib/api/client.ts` and nothing else.
 */

export type Board = {
  id: string;
  title: string;
  thumbnail: string | null;
  isFavorite: boolean;
  isDeleted: boolean;
  folderId: string | null;
  folder?: { id: string; name: string; color: string };
  lastOpenedAt: string | null;
  updatedAt: string;
  createdAt: string;
  /**
   * Optional and additive: the dashboard's `Shared` filter chip needs it, but
   * it is not part of the base contract, so a backend that omits it still
   * typechecks against this type.
   */
  isShared?: boolean;
};

export type Folder = {
  id: string;
  name: string;
  color: FolderColor;
  createdAt: string;
  updatedAt: string;
  /** Denormalised for the sidebar badge; the server recomputes it on read. */
  boardCount: number;
};

export type ActivityType =
  | "created"
  | "renamed"
  | "deleted"
  | "opened"
  | "favorited"
  | "moved";

export type Activity = {
  id: string;
  type: ActivityType;
  boardId: string;
  boardTitle: string;
  /** Present when `type === "moved"`. */
  folderId?: string | null;
  folderName?: string | null;
  createdAt: string;
};

/** The eight swatches offered by the folder colour picker. */
export const FOLDER_COLORS = [
  "indigo",
  "blue",
  "green",
  "amber",
  "red",
  "pink",
  "purple",
  "gray",
] as const;

export type FolderColor = (typeof FOLDER_COLORS)[number];

/** Starter scenes offered by the create-board modal. */
export const BOARD_TEMPLATES = [
  { id: "blank", label: "Blank" },
  { id: "flowchart", label: "Flowchart" },
  { id: "wireframe", label: "Wireframe" },
  { id: "mindmap", label: "Mind map" },
] as const;

export type BoardTemplateId = (typeof BOARD_TEMPLATES)[number]["id"];

export type ViewMode = "grid" | "list";

export type SortBy = "modified" | "name" | "created" | "opened";

export type ActiveFilter = "all" | "favorites" | "recent" | "shared";

export type TrashRetentionDays = 30;

/** Days a soft-deleted board is kept before it is purged. Mirrors the server. */
export const TRASH_RETENTION_DAYS: TrashRetentionDays = 30;

export const UNCATEGORIZED_LABEL = "Uncategorized";

/** Query parameters accepted by `GET /api/boards`. */
export type BoardQuery = {
  folder?: string;
  favorite?: boolean;
  search?: string;
  sort?: SortBy;
  /** Include soft-deleted boards. Only the trash page sets this. */
  deleted?: boolean;
};

/** Query parameters accepted by `GET /api/activity`. */
export type ActivityQuery = {
  page?: number;
  type?: ActivityType | "all";
  pageSize?: number;
};

export type ActivityPage = {
  items: Activity[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
