import Trans from "@mosaic/mosaic/components/Trans";
import { t } from "@mosaic/mosaic/i18n";
import * as Sentry from "@sentry/browser";
import React from "react";

import { SHOW_UPSTREAM_PROMOS } from "../app_constants";

interface TopErrorBoundaryState {
  hasError: boolean;
  sentryEventId: string;
  localStorage: string;
}

export class TopErrorBoundary extends React.Component<
  any,
  TopErrorBoundaryState
> {
  state: TopErrorBoundaryState = {
    hasError: false,
    sentryEventId: "",
    localStorage: "",
  };

  render() {
    return this.state.hasError ? this.errorSplash() : this.props.children;
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const _localStorage: any = {};
    for (const [key, value] of Object.entries({ ...localStorage })) {
      try {
        _localStorage[key] = JSON.parse(value);
      } catch (error: any) {
        _localStorage[key] = value;
      }
    }

    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);

      this.setState((state) => ({
        hasError: true,
        sentryEventId: eventId,
        localStorage: JSON.stringify(_localStorage),
      }));
    });
  }

  private selectTextArea(event: React.MouseEvent<HTMLTextAreaElement>) {
    if (event.target !== document.activeElement) {
      event.preventDefault();
      (event.target as HTMLTextAreaElement).select();
    }
  }

  private async createGithubIssue() {
    let body = "";
    try {
      const templateStrFn = (
        await import(
          /* webpackChunkName: "bug-issue-template" */ "../bug-issue-template"
        )
      ).default;
      body = encodeURIComponent(templateStrFn(this.state.sentryEventId));
    } catch (error: any) {
      console.error(error);
    }

    window.open(
      `https://github.com/excalidraw/excalidraw/issues/new?body=${body}`,
      "_blank",
      "noopener noreferrer",
    );
  }

  private errorSplash() {
    return (
      <div className="ErrorSplash mosaic">
        <div className="ErrorSplash-messageContainer">
          <div className="ErrorSplash-paragraph bigger align-center">
            <Trans
              i18nKey="errorSplash.headingMain"
              button={(el) => (
                <button onClick={() => window.location.reload()}>{el}</button>
              )}
            />
          </div>
          <div className="ErrorSplash-paragraph align-center">
            <Trans
              i18nKey="errorSplash.clearCanvasMessage"
              button={(el) => (
                <button
                  onClick={() => {
                    try {
                      localStorage.clear();
                      window.location.reload();
                    } catch (error: any) {
                      console.error(error);
                    }
                  }}
                >
                  {el}
                </button>
              )}
            />
            <br />
            <div className="smaller">
              <span role="img" aria-label="warning">
                ⚠️
              </span>
              {t("errorSplash.clearCanvasCaveat")}
              <span role="img" aria-hidden="true">
                ⚠️
              </span>
            </div>
          </div>
          <div>
            <div className="ErrorSplash-paragraph">
              {t("errorSplash.trackedToSentry", {
                eventId: this.state.sentryEventId,
              })}
            </div>
            {/*
              The whole paragraph, not just the button: `openIssueMessage` is
              written entirely around upstream's bug tracker ("following up on
              our bug tracker ... copying and pasting into the GitHub issue").
              Hiding only the button would leave a dead promise in the crash
              screen. Gated on SHOW_UPSTREAM_PROMOS like the rest of the
              upstream promotion. See BRANDING.md.
            */}
            {SHOW_UPSTREAM_PROMOS && (
              <div className="ErrorSplash-paragraph">
                <Trans
                  i18nKey="errorSplash.openIssueMessage"
                  button={(el) => (
                    <button onClick={() => this.createGithubIssue()}>
                      {el}
                    </button>
                  )}
                />
              </div>
            )}
            <div className="ErrorSplash-paragraph">
              <div className="ErrorSplash-details">
                <label>{t("errorSplash.sceneContent")}</label>
                <textarea
                  rows={5}
                  onPointerDown={this.selectTextArea}
                  readOnly={true}
                  value={this.state.localStorage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
