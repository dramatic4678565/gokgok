// time constants (ms)
export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export const FILE_UPLOAD_TIMEOUT = 300;
export const LOAD_IMAGES_TIMEOUT = 500;
export const SYNC_FULL_SCENE_INTERVAL_MS = 20000;
export const SYNC_BROWSER_TABS_TIMEOUT = 50;
export const CURSOR_SYNC_TIMEOUT = 33; // ~30fps
export const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

// should be aligned with MAX_ALLOWED_FILE_BYTES
export const FILE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // 4 MiB
// 1 year (https://stackoverflow.com/a/25201898/927631)
export const FILE_CACHE_MAX_AGE_SEC = 31536000;

export const WS_EVENTS = {
  SERVER_VOLATILE: "server-volatile-broadcast",
  SERVER: "server-broadcast",
  USER_FOLLOW_CHANGE: "user-follow",
  USER_FOLLOW_ROOM_CHANGE: "user-follow-room-change",
} as const;

export enum WS_SUBTYPES {
  INVALID_RESPONSE = "INVALID_RESPONSE",
  INIT = "SCENE_INIT",
  UPDATE = "SCENE_UPDATE",
  MOUSE_LOCATION = "MOUSE_LOCATION",
  IDLE_STATUS = "IDLE_STATUS",
  USER_VISIBLE_SCENE_BOUNDS = "USER_VISIBLE_SCENE_BOUNDS",
}

export const FIREBASE_STORAGE_PREFIXES = {
  shareLinkFiles: `/files/shareLinks`,
  collabFiles: `/files/rooms`,
};

export const ROOM_ID_BYTES = 10;

export const STORAGE_KEYS = {
  LOCAL_STORAGE_ELEMENTS: "excalidraw",
  LOCAL_STORAGE_APP_STATE: "excalidraw-state",
  LOCAL_STORAGE_COLLAB: "excalidraw-collab",
  LOCAL_STORAGE_THEME: "excalidraw-theme",
  LOCAL_STORAGE_DEBUG: "excalidraw-debug",
  VERSION_DATA_STATE: "version-dataState",
  VERSION_FILES: "version-files",

  IDB_LIBRARY: "excalidraw-library",
  IDB_TTD_CHATS: "excalidraw-ttd-chats",

  // do not use apart from migrations
  __LEGACY_LOCAL_STORAGE_LIBRARY: "excalidraw-library",
} as const;

export const COOKIES = {
  AUTH_STATE_COOKIE: "excplus-auth",
} as const;

export const isMosaicPlusSignedUser = document.cookie.includes(
  COOKIES.AUTH_STATE_COOKIE,
);

/**
 * Whether to surface upstream promotion surfaces in the UI.
 *
 * Defined in `@mosaic/common` so `packages/mosaic` can gate on the same value
 * -- the help dialog, the Brave error dialog, the library publish dialog and
 * the text-to-diagram chat live there, and a second copy of this flag in either
 * package would drift. Re-exported here because app code reads it from this
 * module alongside the other app-level constants.
 *
 * See the definition in `packages/common/src/constants.ts` and BRANDING.md.
 */
export { SHOW_UPSTREAM_PROMOS } from "@mosaic/common";

/**
 * Backed services this app can talk to.
 *
 * These were all inherited from upstream and pointed at Mosaic's own
 * services, which meant a deployment of this fork was shipping real user data
 * to someone else's infrastructure: share links resolved through
 * json.excalidraw.com, live collaboration drawings relayed through their
 * websocket server, and share-link files and persisted scenes written to their
 * Firebase project.
 *
 * They are now blank by default (see .env.production). The features that need
 * one ask through this helper so the user gets a sentence telling them what to
 * set, rather than a stack trace from deep inside the Firebase or socket.io
 * client.
 */
export const isServiceConfigured = (
  value: string | undefined | null,
  service: string,
  envVar: string,
): boolean => {
  if (value && value.trim() !== "") {
    return true;
  }
  console.warn(
    `[mosaic] "${service}" is not configured, so it is disabled. ` +
      `Set ${envVar} in your environment to enable it. See BRANDING.md.`,
  );
  return false;
};
