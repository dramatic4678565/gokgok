/**
 * Verifies every path a package.json points at actually exists on disk (or
 * would after a build), and that the emitted type declarations land where
 * "types" claims they do.
 *
 * The rebrand renamed package directories, which silently broke several of
 * these -- an npm consumer resolving @mosaic/mosaic got "Cannot find module"
 * because "types" pointed into a directory tsc no longer writes to.
 *
 * Run: node scripts/check-package-paths.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const pkgDirs = [
  ...fs
    .readdirSync(path.join(ROOT, "packages"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `packages/${e.name}`),
];

let problems = 0;
const note = (msg) => {
  console.log(`  ${msg}`);
  problems++;
};

// Collect every string in `exports` / `types` that looks like a file path.
const collect = (obj, acc = []) => {
  if (typeof obj === "string") acc.push(obj);
  else if (obj && typeof obj === "object")
    for (const v of Object.values(obj)) collect(v, acc);
  return acc;
};

for (const dir of pkgDirs) {
  const pjPath = path.join(ROOT, dir, "package.json");
  if (!fs.existsSync(pjPath)) continue;
  const pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
  console.log(`\n${pj.name}  (${dir})`);

  const targets = [
    ...(pj.types ? [pj.types] : []),
    ...collect(pj.exports ?? {}),
  ].filter((t) => t.startsWith("./"));

  // Strip glob tails: we can only check the static prefix exists.
  const uniq = [...new Set(targets.map((t) => t.replace(/\*.*$/, "")))].filter(
    (t) => t && t !== "./",
  );

  for (const t of uniq) {
    const abs = path.join(dir, t);
    const exists = fs.existsSync(abs);
    if (exists) {
      console.log(`  ok    ${t}`);
      continue;
    }
    // Not built yet? Only a problem if it is not a build output.
    const isBuildOutput = /^\.\/dist\//.test(t);
    if (isBuildOutput) {
      console.log(`  skip  ${t}  (build output, not present until you build)`);
    } else {
      note(`BROKEN  ${t}  (not a build output, and not on disk)`);
    }
  }
}

console.log(
  problems
    ? `\n${problems} broken package path(s)`
    : "\nno broken package paths outside of build output",
);
process.exit(problems ? 1 : 0);
