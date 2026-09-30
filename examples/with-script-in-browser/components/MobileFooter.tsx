import React from "react";

import type * as TMosaic from "@mosaic/mosaic";
import type { MosaicImperativeAPI } from "@mosaic/mosaic/types";

import CustomFooter from "./CustomFooter";

const MobileFooter = ({
  mosaicAPI,
  mosaicLib,
}: {
  mosaicAPI: MosaicImperativeAPI;
  mosaicLib: typeof TMosaic;
}) => {
  const { useEditorInterface, Footer } = mosaicLib;

  const editorInterface = useEditorInterface();
  if (editorInterface.formFactor === "phone") {
    return (
      <Footer>
        <CustomFooter mosaicAPI={mosaicAPI} mosaicLib={mosaicLib} />
      </Footer>
    );
  }
  return null;
};
export default MobileFooter;
