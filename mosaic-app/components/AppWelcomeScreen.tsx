import { loginIcon } from "@mosaic/mosaic/components/icons";
import { POINTER_EVENTS } from "@mosaic/common";
import { useI18n } from "@mosaic/mosaic/i18n";
import { WelcomeScreen } from "@mosaic/mosaic/index";
import React from "react";

import { isMosaicPlusSignedUser, SHOW_UPSTREAM_PROMOS } from "../app_constants";

export const AppWelcomeScreen: React.FC<{
  onCollabDialogOpen: () => any;
  isCollabEnabled: boolean;
}> = React.memo((props) => {
  const { t } = useI18n();
  let headingContent;

  if (isMosaicPlusSignedUser) {
    headingContent = t("welcomeScreen.app.center_heading_plus")
      .split(/(Mosaic\+)/)
      .map((bit, idx) => {
        if (bit === "Excalidraw+") {
          return (
            <a
              style={{ pointerEvents: POINTER_EVENTS.inheritFromUI }}
              href={`${
                import.meta.env.VITE_APP_PLUS_APP
              }?utm_source=mosaic&utm_medium=app&utm_content=welcomeScreenSignedInUser`}
              key={idx}
            >
              Excalidraw+
            </a>
          );
        }
        return bit;
      });
  } else {
    headingContent = (
      <>
        {t("welcomeScreen.app.center_heading")}
        <br />
        {t("welcomeScreen.app.center_heading_line2")}
        <br />
        {t("welcomeScreen.app.center_heading_line3")}
      </>
    );
  }

  return (
    <WelcomeScreen>
      <WelcomeScreen.Hints.MenuHint>
        {t("welcomeScreen.app.menuHint")}
      </WelcomeScreen.Hints.MenuHint>
      <WelcomeScreen.Hints.ToolbarHint />
      <WelcomeScreen.Hints.HelpHint />
      <WelcomeScreen.Center>
        <WelcomeScreen.Center.Logo />
        <WelcomeScreen.Center.Heading>
          {headingContent}
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Menu>
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
          {props.isCollabEnabled && (
            <WelcomeScreen.Center.MenuItemLiveCollaborationTrigger
              onSelect={() => props.onCollabDialogOpen()}
            />
          )}
          {/*
            "Sign up" for the upstream paid workspace. Gated on
            SHOW_UPSTREAM_PROMOS for the same reason as the rest of the upstream
            promos -- see BRANDING.md.
          */}
          {SHOW_UPSTREAM_PROMOS && !isMosaicPlusSignedUser && (
            <WelcomeScreen.Center.MenuItemLink
              href={`${
                import.meta.env.VITE_APP_PLUS_LP
              }/plus?utm_source=mosaic&utm_medium=app&utm_content=welcomeScreenGuest`}
              shortcut={null}
              icon={loginIcon}
            >
              {t("labels.signUp")}
            </WelcomeScreen.Center.MenuItemLink>
          )}
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
});
