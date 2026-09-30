import { SHOW_UPSTREAM_PROMOS } from "@mosaic/common";

import Trans from "./Trans";

/**
 * All three links in this dialog point upstream -- the FAQ, the issue tracker
 * and the Discord -- so they are gated on SHOW_UPSTREAM_PROMOS.
 *
 * The explanatory text itself stays: it is the only place the user is told what
 * actually went wrong (Brave's fingerprinting blocks the text measurement the
 * editor depends on) and how to unblock it. Hiding the whole component would
 * leave a blank dialog and no way to fix the problem. See BRANDING.md.
 */
const BraveMeasureTextError = () => {
  return (
    <div data-testid="brave-measure-text-error">
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line1"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line2"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      {SHOW_UPSTREAM_PROMOS && (
        <>
          <p>
            <Trans
              i18nKey="errors.brave_measure_text_error.line3"
              link={(el) => (
                <a href="https://docs.excalidraw.com/docs/@mosaic/mosaic/faq#turning-off-aggresive-block-fingerprinting-in-brave-browser">
                  {el}
                </a>
              )}
            />
          </p>
          <p>
            <Trans
              i18nKey="errors.brave_measure_text_error.line4"
              issueLink={(el) => (
                <a href="https://github.com/excalidraw/excalidraw/issues/new">
                  {el}
                </a>
              )}
              discordLink={(el) => (
                <a href="https://discord.gg/UexuTaE">{el}.</a>
              )}
            />
          </p>
        </>
      )}
    </div>
  );
};

export default BraveMeasureTextError;
