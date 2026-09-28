import "@mosaic/mosaic/global";
import "@mosaic/mosaic/css";

interface Window {
  __MOSAIC_SHA__: string | undefined;
  /** @deprecated Use `__MOSAIC_SHA__`. */
  __EXCALIDRAW_SHA__: string | undefined;
}
