import { Footer } from "@mosaic/mosaic/index";
import React from "react";

import { isMosaicPlusSignedUser, SHOW_UPSTREAM_PROMOS } from "../app_constants";

import { DebugFooter, isVisualDebuggerEnabled } from "./DebugCanvas";
import { EncryptedIcon } from "./EncryptedIcon";

export const AppFooter = React.memo(
  ({ onChange }: { onChange: () => void }) => {
    return (
      <Footer>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
          }}
        >
          {isVisualDebuggerEnabled() && <DebugFooter onChange={onChange} />}
          {/*
            The shield icon links to an upstream blog post about end-to-end
            encryption in the paid Excalidraw+ workspace. Same reason as the
            rest of the upstream promos: it points off-site to a product Mosaic
            does not resell. Gated on SHOW_UPSTREAM_PROMOS. See BRANDING.md.
          */}
          {SHOW_UPSTREAM_PROMOS && !isMosaicPlusSignedUser && <EncryptedIcon />}
        </div>
      </Footer>
    );
  },
);
