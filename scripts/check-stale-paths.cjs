/**
 * Scans the repo for references to paths that the rebrand rename moved, so a
 * stale path fails here instead of silently disabling a build, a CI job or a
 * translation sync.
 *
 * The rebrand renamed excalidraw-app -> mosaic-app and packages/excalidraw ->
 * packages/mosaic. Files that spelled those paths out -- Dockerfiles, CI
 * workflows, tsconfigs, ignore files, crowdin config -- had to be updated by
 * hand, and anything missed is invisible until that job runs.
 *
 * Run: node scripts/check-stale-paths.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/** Paths the rename invalidated. */
const RENAMED = [
  { pattern: /\bexcalidraw-app\b/g, why: "directory renamed to mosaic-app" },
  { pattern: /packages\/excalidraw\b/g, why: "renamed to packages/mosaic" },
  { pattern: /packages\/excalidraw\//g, why: "renamed to packages/mosaic/" },
  { pattern: /\/excalidraw\/fonts\//g, why: "now /mosaic/fonts/" },
  {
    pattern: /dist\/types\/excalidraw\//g,
    why: "tsc emits to dist/types/mosaic/",
  },
];

/**
 * Places where an "excalidraw" is expected and fine, so a hit is not a
 * finding. Each entry must state why, so the exemption is auditable.
 */
const ALLOW = [
  { file: /CHANGELOG\.md$/, why: "historical record" },
  { file: /yarn\.lock$/, why: "generated" },
  { file: /(^|\/)LICENSE$/, why: "names the copyright holder" },
  { file: /^scripts\/rebrand\.cjs$/, why: "rebrand tooling" },
  {
    file: /^scripts\/(audit-leftovers|check-doc-ids|check-doc-links|check-package-paths|check-stale-paths|fix-rebrand-consistency|fix-test-fixture-text|sync-brand-into-html|build-brand-assets)\.cjs$/,
    why: "rebrand tooling",
  },
  { file: /^scripts\/sync-upstream\./, why: "upstream sync" },
  { file: /^\.github\/workflows\/sync-upstream\.yml$/, why: "upstream sync" },
  { file: /^(memory|branding)\//, why: "our own docs" },
  {
    file: /^(BRANDING|MOSAIC-SYNC-GUIDE|AGENTS|CLAUDE)\.md$/,
    why: "our own docs",
  },
  { file: /mermaid-to-excalidraw/i, why: "third-party package name" },
  // Prose and doc pages legitimately link to upstream source paths, which still
  // say packages/excalidraw because that is what the upstream repo has. Only
  // build inputs are checked, since only those actually break a build.
  {
    file: /dev-docs\/docs\//,
    why: "docs prose: upstream permalinks say packages/excalidraw",
  },
  { file: /\.mdx?$/, why: "documentation prose, not a build input" },
  // repository/bugs/homepage in package.json point at the upstream repo, where
  // the directory really is still packages/excalidraw. Renaming them would
  // misattribute the code; they are metadata, not build inputs.
  {
    file: /package\.json$/,
    why: "repository/bugs/homepage are upstream metadata",
  },
];

const TEXT =
  /\.(ts|tsx|js|jsx|mjs|mts|cjs|json|scss|css|html|md|mdx|yml|yaml|txt)$/i;

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (
        e.name === ".git" ||
        e.name === "node_modules" ||
        e.name === "build" ||
        e.name === "dist"
      )
        continue;
      walk(p, out);
    } else if (TEXT.test(e.name)) {
      out.push(rel);
    }
  }
  return out;
};

let findings = 0;
for (const rel of walk(ROOT)) {
  if (ALLOW.some((a) => a.file.test(rel))) continue;
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
  text.split("\n").forEach((line, i) => {
    for (const { pattern, why } of RENAMED) {
      if (pattern.test(line)) {
        console.log(`  ${rel}:${i + 1}  ${line.trim().slice(0, 100)}`);
        console.log(`      -> stale path: ${why}`);
        findings++;
        pattern.lastIndex = 0;
      }
      pattern.lastIndex = 0;
    }
  });
}

console.log(
  findings
    ? `\n${findings} stale path reference(s) -- these will fail or silently no-op`
    : "\nno stale paths from the directory rename",
);
process.exit(findings ? 1 : 0);
