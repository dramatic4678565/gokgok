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
 * These are the "Excalidraw+" button in the top right, the "Excalidraw+", "Sign
 * up", "GitHub", "Follow us" and "Discord chat" entries in the main menu, and
 * the Excalidraw+ promo tabs in the sidebar. Every one of them points at
 * upstream's paid workspace or its own social/community accounts, so on a self
 * -hosted Mosaic deployment they would point users at someone else's product.
 *
 * Off by default. Flip it to true for a fork that actually resells a hosted
 * tier, and point the relevant env vars at that service first:
 *
 *   VITE_APP_PLUS_LP    the landing page (VITE_APP_PLUS_LP + "/plus")
 *   VITE_APP_PLUS_APP   the app itself (VITE_APP_PLUS_APP + "/sign-up")
 *
 * The code behind each surface is still present, just gated on this flag, so
 * toggling it here is all that is needed to bring them back.
 *
 * See BRANDING.md.
 */
export const SHOW_UPSTREAM_PROMOS = false;
