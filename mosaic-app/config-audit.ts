/**
 * Startup audit of the deployment's configuration.
 *
 * The rebrand inherited every service endpoint from upstream. A deployment of
 * this fork would happily send real user data to Excalidraw's servers: share
 * links through json.excalidraw.com, collaboration drawings through their
 * websocket server, and share-link files and persisted scenes into their
 * Firebase project. Nothing about that was visible at runtime.
 *
 * So rather than trusting a reviewer to notice, this runs on boot and says
 * plainly which endpoints still belong to somebody else. It never blocks the
 * app -- it just refuses to be quiet about it.
 *
 * Deliberately a console warning, not a throw: the drawing surface works fine
 * without any of these, and an app that refuses to start over a misconfigured
 * optional backend is worse than one that tells you what is missing.
 */
import { SHOW_UPSTREAM_PROMOS } from "./app_constants";

type Endpoint = {
  varName: string;
  service: string;
  /** Data that leaves the deployment when this is set. */
  data: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    varName: "VITE_APP_BACKEND_V2_GET_URL",
    service: "Shareable links",
    data: "the contents of every shared scene",
  },
  {
    varName: "VITE_APP_BACKEND_V2_POST_URL",
    service: "Shareable links",
    data: "the contents of every shared scene",
  },
  {
    varName: "VITE_APP_WS_SERVER_URL",
    service: "Live collaboration",
    data: "every drawing a collaborator draws",
  },
  {
    varName: "VITE_APP_FIREBASE_CONFIG",
    service: "Save to link and persisted scenes",
    data: "share-link files and saved scenes",
  },
  {
    varName: "VITE_APP_AI_BACKEND",
    service: "Diagram to code",
    data: "the diagram you submit, and the prompt context",
  },
  {
    varName: "VITE_APP_LIBRARY_BACKEND",
    service: "Public library publishing",
    data: "any library you publish",
  },
  {
    varName: "VITE_APP_LIBRARY_URL",
    service: "Public library browser",
    data: "your IP address and the libraries you open",
  },
  {
    varName: "VITE_APP_SENTRY_DSN",
    service: "Error reporting",
    data: "crash reports, console errors and stack traces",
  },
];

/** Hosts that belong to upstream, not to this deployment. */
const UPSTREAM_HOSTS = [
  "excalidraw.com",
  "oss-collab.excalidraw.com",
  "oss-ai.excalidraw.com",
  "sentry.io",
  "firebaseio.com",
  "firebaseapp.com",
  "appspot.com",
  "cloudfunctions.net",
  "digitaloceanspaces.com",
];

const env = import.meta.env as unknown as Record<string, string | undefined>;

const configured: Endpoint[] = [];
const upstream: { endpoint: Endpoint; host: string }[] = [];

for (const endpoint of ENDPOINTS) {
  const value = env[endpoint.varName];
  if (!value || value.trim() === "") {
    continue;
  }
  configured.push(endpoint);
  const host = UPSTREAM_HOSTS.find((h) => value.includes(h));
  if (host) {
    upstream.push({ endpoint, host });
  }
}

if (upstream.length) {
  const lines = [
    "",
    "┌─ mosaic: these services are still pointed at upstream excalidraw ─────",
    "│",
    "│  This deployment is sending real user data to a third party that does",
    "│  not own it. If that is intentional, fine, but it should be a decision",
    "│  rather than an accident.",
    "│",
  ];
  for (const { endpoint, host } of upstream) {
    lines.push(
      `│  ${endpoint.service} (${endpoint.varName})`,
      `│    -> ${host}: ${endpoint.data}`,
    );
  }
  lines.push(
    "│",
    "│  Fix: set these to your own services, or clear them to turn the feature",
    "│  off. See BRANDING.md.",
    "└──────────────────────────────────────────────────────────────────────",
    "",
  );
  console.warn(lines.join("\n"));
}

if (SHOW_UPSTREAM_PROMOS) {
  console.warn(
    "[mosaic] SHOW_UPSTREAM_PROMOS is on, so the UI is advertising upstream's " +
      "premium product and social accounts. Confirm that is what you want.",
  );
}
