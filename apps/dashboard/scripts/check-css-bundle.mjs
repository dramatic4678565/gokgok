import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Fails the build if Tailwind silently stops running.
 *
 * This exists because it already happened once: `postcss.config.mjs` is ignored
 * by Next 14, so no plugin was registered, the `@tailwind` directives survived
 * into the output verbatim, the browser discarded them as unknown at-rules, and
 * the entire app rendered unstyled. `tsc`, `eslint`, `next build` and every HTTP
 * check all passed — the only symptom was a CSS bundle a few KB instead of tens
 * of KB, and a page full of unstyled white boxes.
 *
 * So this asserts on the artefact rather than trusting the build to complain.
 */

const here = dirname(fileURLToPath(import.meta.url));
const cssDir = join(here, "..", ".next", "static", "css");

/**
 * A working Tailwind build of this app emits well over 100 KB (the generated
 * utility sheet plus preflight and the theme variables). 40 KB is a generous
 * floor that a regression cannot cross without tripping.
 */
const MIN_CSS_BYTES = 40 * 1024;

let files;
try {
  files = readdirSync(cssDir).filter((name) => name.endsWith(".css"));
} catch {
  console.error(
    `[dashboard] no CSS found at ${cssDir} — did \`next build\` run before \`check:css\`?`,
  );
  process.exit(1);
}

const results = files.map((name) => {
  const path = join(cssDir, name);
  return { name, bytes: statSync(path).size, source: readFileSync(path, "utf8") };
});

const totalBytes = results.reduce((sum, file) => sum + file.bytes, 0);
const unprocessed = results.filter((file) => /@tailwind\s+(base|components|utilities)/.test(file.source));

console.log("[dashboard] CSS bundles:");
for (const file of results) {
  console.log(`  ${file.name}  ${(file.bytes / 1024).toFixed(1)} KB`);
}
console.log(`[dashboard] total ${(totalBytes / 1024).toFixed(1)} KB`);

if (unprocessed.length > 0) {
  console.error(
    `\n[dashboard] FAIL: ${unprocessed
      .map((file) => file.name)
      .join(", ")} still contain raw \`@tailwind\` directives, which means PostCSS ` +
      "did not process globals.css and the page will render unstyled.\n" +
      "[dashboard] Check that postcss.config.js uses CommonJS (module.exports); " +
      "Next 14 ignores an ESM postcss.config.mjs without saying so.\n",
  );
  process.exit(1);
}

if (totalBytes < MIN_CSS_BYTES) {
  console.error(
    `\n[dashboard] FAIL: total CSS is ${(totalBytes / 1024).toFixed(1)} KB, below the ` +
      `${(MIN_CSS_BYTES / 1024).toFixed(0)} KB floor.\n` +
      "[dashboard] That usually means Tailwind's `content` globs match no files, " +
      "or PostCSS is not running at all.\n",
  );
  process.exit(1);
}

console.log("[dashboard] CSS looks processed. OK.\n");
