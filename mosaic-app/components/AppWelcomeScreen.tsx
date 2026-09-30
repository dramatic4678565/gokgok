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

  /*
   * The signed-in branch rewrites the product name inside a translated heading
   * into a link to the paid workspace. Both halves of that are upstream
   * promotion, so the whole branch is gated on SHOW_UPSTREAM_PROMOS -- when the
   * flag is off we fall through to the ordinary heading, which is the only one
   * that mentions this product at all.
   *
   * Gating only the link is not enough: `isMosaicPlusSignedUser` is a cookie
   * read, and a stale `excplus-auth` cookie on a deployment that does not sell
   * that product would otherwise swap the whole heading out from under the
   * user. See BRANDING.md.
   */
  if (SHOW_UPSTREAM_PROMOS && isMosaicPlusSignedUser) {
    /*
     * Split the heading on the product name so it can become a link. The name
     * is matched through a single constant used for both the pattern and the
     * comparison, so a rebrand that touches one of them cannot leave the other
     * stale -- which is exactly how this ended up rendering an unbranded name
     * with no link.
     */
    const PLUS_NAME = "Mosaic+";
    const parts = t("welcomeScreen.app.center_heading_plus").split(
      new RegExp(`(${PLUS_NAME.replace(/\+/g, "\\+")})`, "g"),
    );
    headingContent = parts.map((bit, idx) =>
      bit === PLUS_NAME ? (
        <a
          style={{ pointerEvents: POINTER_EVENTS.inheritFromUI }}
          href={`${
            import.meta.env.VITE_APP_PLUS_APP
          }?utm_source=mosaic&utm_medium=app&utm_content=welcomeScreenSignedInUser`}
          key={idx}
        >
          {PLUS_NAME}
        </a>
      ) : (
        bit
      ),
    );
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
