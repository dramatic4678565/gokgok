import React from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import initialData from "@site/src/initialData";
import { useColorMode } from "@docusaurus/theme-common";

import "@mosaic/mosaic/index.css";

let MosaicComp = {};
if (ExecutionEnvironment.canUseDOM) {
  MosaicComp = require("@mosaic/mosaic");
}
const Mosaic = React.forwardRef((props, ref) => {
  if (!window.EXCALIDRAW_ASSET_PATH) {
    window.EXCALIDRAW_ASSET_PATH =
      "https://esm.sh/@mosaic/mosaic@0.18.0/dist/prod/";
  }

  const { colorMode } = useColorMode();
  return <MosaicComp.Mosaic theme={colorMode} {...props} ref={ref} />;
});
// Add react-live imports you need here
const MosaicScope = {
  React,
  ...React,
  Mosaic,
  Footer: MosaicComp.Footer,
  useDevice: MosaicComp.useDevice,
  MainMenu: MosaicComp.MainMenu,
  WelcomeScreen: MosaicComp.WelcomeScreen,
  LiveCollaborationTrigger: MosaicComp.LiveCollaborationTrigger,
  Sidebar: MosaicComp.Sidebar,
  exportToCanvas: MosaicComp.exportToCanvas,
  initialData,
  useI18n: MosaicComp.useI18n,
  convertToMosaicElements: MosaicComp.convertToMosaicElements,
  CaptureUpdateAction: MosaicComp.CaptureUpdateAction,
};

export default MosaicScope;
