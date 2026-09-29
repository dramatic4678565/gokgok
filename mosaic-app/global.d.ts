import "@mosaic/mosaic/global";
import "@mosaic/mosaic/css";

interface Window {
  __MOSAIC_SHA__: string | undefined;
  /** @deprecated Use `__MOSAIC_SHA__`. */
  __EXCALIDRAW_SHA__: string | undefined;
  /** Set by index.html; gates the premium-tier auto-redirect. */
  __MOSAIC_PLUS_AUTO_REDIRECT__?: boolean;
  /** Set by index.html; the premium app this deployment redirects to, if any. */
  __MOSAIC_PLUS_APP__?: string;
}
