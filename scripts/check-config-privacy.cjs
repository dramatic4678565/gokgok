/**
 * Verifies the deployment config no longer points at upstream services by
 * default, and that the startup audit would catch it if it did.
 *
 * The rebrand inherited every endpoint from upstream, so a fresh build of this
 * fork shipped user data to Excalidraw's servers. This reads the env files that
 * ship in the repo and fails on any upstream host still configured.
 *
 * Run: node scripts/check-config-privacy.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const UPSTREAM = [
  "excalidraw.com",
  "sentry.io",
  "firebaseio.com",
  "firebaseapp.com",
  "appspot.com",
  "cloudfunctions.net",
  "digitaloceanspaces.com",
  "opencollective.com",
];

// The one intentional exception: a LICENSE or attribution reference.
const ALLOW = [
  { file: /(^|\/)LICENSE$/, why: "attribution" },
  { file: /CHANGELOG\.md$/, why: "historical record" },
  { file: /yarn\.lock$/, why: "generated" },
  { file: /^branding\//, why: "brand source of truth" },
  { file: /^(memory|scripts)\//, why: "tooling and docs" },
  { file: /^(BRANDING|README|MOSAIC-SYNC-GUIDE|AGENTS|CLAUDE)\.md$/, why: "docs" },
  { file: /^packages\/(mosaic|common|element|math|utils|laser-pointer|fractional-indexing)\/package\.json$/, why: "repository/bugs attribution" },
  { file: /dev-docs\//, why: "docs prose" },
  // This is the detector. It has to name the upstream hosts it looks for, so
  // it is exempt from itself.
  { file: /config-audit\.ts$/, why: "the privacy audit itself" },
  { file: /\.test\.[jt]sx?$|__tests__|fixtures/, why: "test data" },
  { file: /vite-env\.d\.ts$/, why: "typed env declarations, no values" },
  // CI configuration. The workflows either name an upstream service only to
  // document what the app used to call, or take their endpoint from a secret.
  { file: /^\.github\/workflows\//, why: "CI config" },

  // Upstream links deliberately kept and gated on SHOW_UPSTREAM_PROMOS,
  // because a fork that resells a hosted tier needs them back. They are dead
  // by default -- see BRANDING.md.
  {
    file: /mosaic-app\/components\/EncryptedIcon\.tsx$/,
    why: "gated on SHOW_UPSTREAM_PROMOS",
  },
  {
    file: /packages\/mosaic\/components\/(HelpDialog|BraveMeasureTextError|PublishLibrary)\.tsx$/,
    why: "gated on SHOW_UPSTREAM_PROMOS",
  },

  // Domain allowlists. These *are* the mechanism that stops a user-supplied
  // link or library URL resolving against an upstream host, so naming the host
  // is the point.
  { file: /packages\/mosaic\/data\/library\.ts$/, why: "allowed-library-domain list" },
  {
    file: /packages\/element\/src\/embeddable\.ts$/,
    why: "allowed-link-domain list",
  },
];

/** Files whose values are inlined into the shipped bundle. */
const SHIPPED = [".env.production", ".env.development", "firebase-project/.firebaserc"];

let problems = 0;
const bad = (msg) => {
  console.log(`  ${msg}`);
  problems++;
};

/** Strips comments so a mention in prose is not mistaken for a live value. */
const stripComments = (text, file) => {
  let out = text;
  if (/\.(ts|tsx|js|mjs|cjs|yml|yaml)$/i.test(file)) {
    out = out.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  } else if (/^\.env/.test(file) || /\.firebaserc$/.test(file)) {
    out = out.replace(/^\s*#.*$/gm, "");
  }
  return out;
};

console.log("Shipped configuration (values only, comments stripped):\n");
for (const rel of SHIPPED) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.log(`  ${rel}  -- missing`);
    continue;
  }
  const text = stripComments(fs.readFileSync(abs, "utf8"), rel);
  const hits = UPSTREAM.filter((h) => text.includes(h));
  if (hits.length) {
    bad(`${rel}  still configured against upstream: ${hits.join(", ")}`);
  } else {
    console.log(`  ok    ${rel}`);
  }
}

console.log("\nAnywhere else in the repo:\n");
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (["node_modules", ".git", "build", "dist"].includes(e.name)) continue;
      walk(p, out);
    } else if (/\.(ts|tsx|js|mjs|cjs|json|yml|yaml|html|scss|css)$/i.test(e.name)) {
      out.push(rel);
    }
  }
  return out;
};

for (const rel of walk(ROOT)) {
  if (ALLOW.some((a) => a.file.test(rel))) continue;
  // Comments are stripped here for the same reason as in the shipped-config
  // pass above. Without it, a `// see https://excalidraw.com/...` attribution
  // in a source file is reported as a live endpoint, and the check fails on
  // correct code -- which is how it came to be failing on a clean tree.
  const text = stripComments(fs.readFileSync(path.join(ROOT, rel), "utf8"), rel);
  const hits = UPSTREAM.filter((h) => text.includes(h));
  if (hits.length) {
    bad(`${rel}  -> ${hits.join(", ")}`);
  }
}

console.log(
  problems
    ? `\n${problems} place(s) still point at upstream services`
    : "\nno shipped configuration points at upstream services",
);
process.exit(problems ? 1 : 0);
