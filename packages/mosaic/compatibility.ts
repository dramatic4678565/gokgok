/**
 * Backwards-compatible aliases.
 *
 * Mosaic is a rename of the upstream package, but plenty of existing
 * integrations (and a lot of upstream documentation and tutorial code) refer
 * to the old names. Rather than breaking them outright, the upstream names
 * stay available here as deprecated aliases.
 *
 * Nothing new should be added to this file. The point is to give the rename a
 * soft landing, not to keep two APIs alive in perpetuity.
 *
 * @example
 * // old code keeps working
 * import { Excalidraw } from "@mosaic/mosaic/compatibility";
 * // new code
 * import { Mosaic } from "@mosaic/mosaic";
 *
 * @deprecated Import the `Mosaic*` names from the package root instead.
 */
import {
  Mosaic as MosaicComponent,
  MosaicAPIProvider,
  useMosaicStateValue,
  useOnMosaicStateChange,
  convertToMosaicElements,
  mutateElement,
  newElementWith,
  reconcileElements,
  serializeAsJSON,
  serializeLibraryAsJSON,
  mergeLibraryItems,
  getLibraryItemsHash,
  isLinearElement,
  isInvisiblySmallElement,
  elementsOverlappingBBox,
  setCustomTextMetricsProvider,
  isElementLink,
  getDataURL,
  CaptureUpdateAction,
} from "./index";

/* -- component and hooks ---------------------------------------------------- */

/** @deprecated Use `Mosaic`. */
export const Excalidraw = MosaicComponent;

/** @deprecated Use `MosaicAPIProvider`. */
export const ExcalidrawAPIProvider = MosaicAPIProvider;

/** @deprecated Use `useMosaicStateValue`. */
export const useExcalidrawStateValue = useMosaicStateValue;

/** @deprecated Use `useOnMosaicStateChange`. */
export const useOnExcalidrawStateChange = useOnMosaicStateChange;

/* -- elements --------------------------------------------------------------- */

/** @deprecated Use `convertToMosaicElements`. */
export const convertToExcalidrawElements = convertToMosaicElements;

/** @deprecated Use `newElementWith`. */
export const newElement = newElementWith;

/** @deprecated Use `mutateElement`. */
export const mutateElementAlias = mutateElement;

/** @deprecated Use `reconcileElements`. */
export const reconcileElementsAlias = reconcileElements;

/* -- serialisation ---------------------------------------------------------- */

/** @deprecated Use `serializeAsJSON`. */
export const serializeAsJSONAlias = serializeAsJSON;

/** @deprecated Use `serializeLibraryAsJSON`. */
export const serializeLibraryAsJSONAlias = serializeLibraryAsJSON;

/* -- libraries -------------------------------------------------------------- */

/** @deprecated Use `mergeLibraryItems`. */
export const mergeLibraryItemsAlias = mergeLibraryItems;

/** @deprecated Use `getLibraryItemsHash`. */
export const getLibraryItemsHashAlias = getLibraryItemsHash;

/* -- re-exports that never changed shape ----------------------------------- */

export {
  isLinearElement,
  isInvisiblySmallElement,
  elementsOverlappingBBox,
  setCustomTextMetricsProvider,
  isElementLink,
  getDataURL,
  CaptureUpdateAction,
};
