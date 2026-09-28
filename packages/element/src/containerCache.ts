import type { MosaicTextContainer } from "./types";

export const originalContainerCache: {
  [id: MosaicTextContainer["id"]]:
    | {
        height: MosaicTextContainer["height"];
      }
    | undefined;
} = {};

export const updateOriginalContainerCache = (
  id: MosaicTextContainer["id"],
  height: MosaicTextContainer["height"],
) => {
  const data =
    originalContainerCache[id] || (originalContainerCache[id] = { height });
  data.height = height;
  return data;
};

export const resetOriginalContainerCache = (id: MosaicTextContainer["id"]) => {
  if (originalContainerCache[id]) {
    delete originalContainerCache[id];
  }
};

export const getOriginalContainerHeightFromCache = (
  id: MosaicTextContainer["id"],
) => {
  return originalContainerCache[id]?.height ?? null;
};
