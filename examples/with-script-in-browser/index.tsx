import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@mosaic/mosaic/index.css";

import type * as TMosaic from "@mosaic/mosaic";

import App from "./components/ExampleApp";

declare global {
  interface Window {
    MosaicLib: typeof TMosaic;
  }
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
const { Mosaic } = window.MosaicLib;
root.render(
  <StrictMode>
    <App
      appTitle={"Mosaic Example"}
      useCustom={(api: any, args?: any[]) => {}}
      mosaicLib={window.MosaicLib}
    >
      <Mosaic />
    </App>
  </StrictMode>,
);
