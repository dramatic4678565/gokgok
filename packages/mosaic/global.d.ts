// Host-integration globals.
//
// The `MOSAIC_*` names are the ones to use. The `EXCALIDRAW_*` names are still
// read as a fallback so that pages which embedded the upstream bundle keep
// working without changes; new code should not rely on them.

interface Window {
  ClipboardItem: any;
  gtag: Function;
  sa_event: Function;
  fathom: { trackEvent: Function };
  DEBUG_FRACTIONAL_INDICES: boolean | undefined;

  /** Base path (or paths) the app loads its bundled assets from. */
  MOSAIC_ASSET_PATH: string | string[] | undefined;
  /** Disables the render throttle. Development aid. */
  MOSAIC_THROTTLE_RENDER: boolean | undefined;
  /** Reported as the export `source` in shared scenes. */
  MOSAIC_EXPORT_SOURCE: string;
  /** Version stamp injected at build time. */
  __MOSAIC_SHA__: string | undefined;

  /** @deprecated Use `MOSAIC_ASSET_PATH`. */
  EXCALIDRAW_ASSET_PATH: string | string[] | undefined;
  /** @deprecated Use `MOSAIC_THROTTLE_RENDER`. */
  EXCALIDRAW_THROTTLE_RENDER: boolean | undefined;
  /** @deprecated Use `MOSAIC_EXPORT_SOURCE`. */
  EXCALIDRAW_EXPORT_SOURCE: string;
  /** @deprecated Use `__MOSAIC_SHA__`. */
  __EXCALIDRAW_SHA__: string | undefined;
}

interface CanvasRenderingContext2D {
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect
  roundRect?: (
    x: number,
    y: number,
    width: number,
    height: number,
    radii:
      | number // [all-corners]
      | [number] // [all-corners]
      | [number, number] // [top-left-and-bottom-right, top-right-and-bottom-left]
      | [number, number, number] // [top-left, top-right-and-bottom-left, bottom-right]
      | [number, number, number, number], // [top-left, top-right, bottom-right, bottom-left]
  ) => void;
}

interface Clipboard extends EventTarget {
  write(data: any[]): Promise<void>;
}

// PNG encoding/decoding
// -----------------------------------------------------------------------------
type TEXtChunk = { name: "tEXt"; data: Uint8Array };

declare module "png-chunk-text" {
  function encode(
    name: string,
    value: string,
  ): { name: "tEXt"; data: Uint8Array };
  function decode(data: Uint8Array): { keyword: string; text: string };
}
declare module "png-chunks-encode" {
  function encode(chunks: TEXtChunk[]): Uint8Array<ArrayBuffer>;
  export = encode;
}
declare module "png-chunks-extract" {
  function extract(buffer: Uint8Array): TEXtChunk[];
  export = extract;
}
// -----------------------------------------------------------------------------

interface Blob {
  handle?: FileSystemFileHandle;
  name?: string;
}

declare module "*.scss";

// ---------------------------------------------------------------------------?
// ensure Uint8Array isn't assignable to ArrayBuffer
// (due to TS structural typing)
// https://github.com/microsoft/TypeScript/issues/31311#issuecomment-490690695
interface ArrayBuffer {
  _brand?: "ArrayBuffer";
}
interface Uint8Array {
  _brand?: "Uint8Array";
}
// ---------------------------------------------------------------------------?

// https://github.com/nodeca/image-blob-reduce/issues/23#issuecomment-783271848
declare module "image-blob-reduce" {
  import type { PicaResizeOptions, Pica } from "pica";
  namespace ImageBlobReduce {
    interface ImageBlobReduce {
      toBlob(file: File, options: ImageBlobReduceOptions): Promise<Blob>;
      _create_blob(
        this: { pica: Pica },
        env: {
          out_canvas: HTMLCanvasElement;
          out_blob: Blob;
        },
      ): Promise<any>;
    }

    interface ImageBlobReduceStatic {
      new (options?: any): ImageBlobReduce;

      (options?: any): ImageBlobReduce;
    }
    interface ImageBlobReduceOptions extends PicaResizeOptions {
      max: number;
    }
  }
  const reduce: ImageBlobReduce.ImageBlobReduceStatic;
  export = reduce;
}

interface CustomMatchers {
  toBeNonNaNNumber(): void;
  toCloselyEqualPoints(
    points: readonly [number, number][],
    precision?: number,
  ): void;
}

declare namespace jest {
  interface Expect extends CustomMatchers {}
  interface Matchers extends CustomMatchers {}
}
