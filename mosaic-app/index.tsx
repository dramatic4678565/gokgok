import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "../mosaic-app/sentry";
import "../mosaic-app/config-audit";

import MosaicApp from "./App";

window.__MOSAIC_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
registerSW();
root.render(
  <StrictMode>
    <MosaicApp />
  </StrictMode>,
);
