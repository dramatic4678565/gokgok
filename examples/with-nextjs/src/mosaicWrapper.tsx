"use client";
import * as mosaicLib from "@mosaic/mosaic";
import { Mosaic } from "@mosaic/mosaic";

import "@mosaic/mosaic/index.css";

import App from "../../with-script-in-browser/components/ExampleApp";

const MosaicWrapper: React.FC = () => {
  return (
    <>
      <App
        appTitle={"Mosaic with Nextjs Example"}
        useCustom={(api: any, args?: any[]) => {}}
        mosaicLib={mosaicLib}
      >
        <Mosaic />
      </App>
    </>
  );
};

export default MosaicWrapper;
