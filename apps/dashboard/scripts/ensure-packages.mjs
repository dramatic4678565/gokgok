import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The dashboard's editor route imports `@mosaic/mosaic`, which the monorepo
 * publishes as build artefacts (`dist/prod/*.js` plus generated `.d.ts` and
 * CSS). A fresh clone has none of them, so `next dev` / `next build` would fail
 * with an opaque "Module not found" from webpack.
 *
 * This runs as `predev` / `prebuild`: if the artefacts are present it exits
 * immediately, and if they are not it runs the repo's own `build:packages`
 * once. It never rebuilds when the packages are already built, so day-to-day
 * iteration is unaffected.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

const REQUIRED_ARTEFACTS = [
  "packages/common/dist/prod/index.js",
  "packages/element/dist/prod/index.js",
  "packages/math/dist/prod/index.js",
  "packages/mosaic/dist/prod/index.js",
  "packages/mosaic/dist/prod/index.css",
  "packages/mosaic/dist/types/mosaic/index.d.ts",
];

const missing = REQUIRED_ARTEFACTS.filter(
  (relative) => !existsSync(resolve(repoRoot, relative)),
);

if (missing.length === 0) {
  process.exit(0);
}

console.log(
  `\n[dashboard] ${missing.length} editor package artefact(s) are missing — running \`yarn build:packages\`.\n` +
    "[dashboard] This takes a few minutes and only needs to happen once per clone.\n",
);

const result = spawnSync("yarn", ["build:packages"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) {
  console.error(
    "\n[dashboard] `yarn build:packages` failed. Run it manually to see the error:\n" +
      "  yarn build:packages\n",
  );
}

process.exit(result.status ?? 1);
