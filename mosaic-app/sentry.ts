import { getFeatureFlag } from "@mosaic/common";
import * as Sentry from "@sentry/browser";
import callsites from "callsites";

/**
 * Error reporting is opt-in and is off unless you point it at your own Sentry
 * project.
 *
 * It used to be hardcoded to upstream's project, gated only on a hostname
 * match that included "vercel.app" -- so every Vercel preview deployment sent
 * exception payloads, console.error output, feature flags and the build SHA to
 * Excalidraw's Sentry org. That is other people's data store, so it is gone.
 *
 * To enable: set VITE_APP_SENTRY_DSN to your own project's DSN and, optionally,
 * VITE_APP_SENTRY_ENVIRONMENT. Set VITE_APP_DISABLE_SENTRY=true to force it off
 * regardless (the Docker build does).
 */
const DSN = import.meta.env.VITE_APP_SENTRY_DSN as string | undefined;
const DISABLED = import.meta.env.VITE_APP_DISABLE_SENTRY === "true";

/**
 * Environment label for the current host. Keyed on this project's own domain
 * only -- the previous map matched any *.vercel.app host, which is how preview
 * builds ended up reporting as "staging" on somebody else's project.
 */
const ENV_BY_HOSTNAME: Record<string, string> = {
  "mosaic.app": "production",
};

const hostname = window.location.hostname;
const environment =
  (import.meta.env.VITE_APP_SENTRY_ENVIRONMENT as string | undefined) ??
  Object.keys(ENV_BY_HOSTNAME).find((h) => hostname === h || hostname.endsWith(`.${h}`))
    ? ENV_BY_HOSTNAME[
        Object.keys(ENV_BY_HOSTNAME).find(
          (h) => hostname === h || hostname.endsWith(`.${h}`),
        )!
      ]
    : undefined;

const enabled = !DISABLED && !!DSN;

if (enabled) {
  Sentry.init({
    dsn: DSN,
    environment,
    release: import.meta.env.VITE_APP_GIT_SHA,
    ignoreErrors: [
      "undefined is not an object (evaluating 'window.__pad.performLoop')", // Only happens on Safari, but it spams. Doesn't break anything
      "InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing.",
      /(Failed to fetch|(fetch|loading) dynamically imported module)/i, // A service worker trying to load an old asset
      /QuotaExceededError: (The quota has been exceeded|.*setItem.*Storage)/i, // localStorage quota exceeded
      "Internal error opening backing store for indexedDB.open", // Private mode and disabled indexedDB
    ],
    integrations: [
      Sentry.captureConsoleIntegration({
        levels: ["error"],
      }),
      Sentry.featureFlagsIntegration(),
    ],
    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/#.*$/, "");
      }

      if (!event.exception) {
        event.exception = {
          values: [
            {
              type: "ConsoleError",
              value: event.message ?? "Unknown error",
              stacktrace: {
                frames: callsites()
                  .slice(1)
                  .filter(
                    (frame) =>
                      frame.getFileName() &&
                      !frame.getFileName()?.includes("@sentry_browser.js"),
                  )
                  .map((frame) => ({
                    filename: frame.getFileName() ?? undefined,
                    function: frame.getFunctionName() ?? undefined,
                    in_app: !(frame.getFileName()?.includes("node_modules") ?? false),
                    lineno: frame.getLineNumber() ?? undefined,
                    colno: frame.getColumnNumber() ?? undefined,
                  })),
              },
              mechanism: {
                type: "instrument",
                handled: true,
                data: {
                  function: "console.error",
                  handler: "Sentry.beforeSend",
                },
              },
            },
          ],
        };
      }

      return event;
    },
  });

  const flagsIntegration =
    Sentry.getClient()?.getIntegrationByName<Sentry.FeatureFlagsIntegration>(
      "FeatureFlags",
    );
  if (flagsIntegration) {
    flagsIntegration.addFeatureFlag(
      "COMPLEX_BINDINGS",
      getFeatureFlag("COMPLEX_BINDINGS"),
    );
  }
}
