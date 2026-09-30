const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "dev-docs", "docs");

const walk = (dir, base, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out);
    else if (/\.mdx?$/.test(e.name))
      out.push(
        path
          .relative(base, p)
          .replace(/\\/g, "/")
          .replace(/\.mdx?$/, ""),
      );
  }
  return out;
};
const files = new Set(walk(DOCS, DOCS));

const sidebar = fs.readFileSync(
  path.join(ROOT, "dev-docs", "sidebars.js"),
  "utf8",
);
const ids = new Set();
// skip `label:` lines -- those are display text, not ids
for (const m of sidebar.matchAll(/(?<!\blabel: )"(@[^"]+)"/g)) ids.add(m[1]);

console.log(`doc files on disk: ${files.size}`);
console.log(`ids referenced  : ${ids.size}\n`);

const missing = [...ids].filter((id) => !files.has(id)).sort();
if (missing.length) {
  console.log("UNRESOLVED ids (docusaurus build fails on these):");
  for (const id of missing) console.log(`  ${id}`);
  process.exit(1);
}

// Reverse direction: files nobody links to (orphans). Not fatal, but worth
// knowing, since a renamed file that nothing points at is a dead page.
const linked = new Set(
  [...ids].flatMap((id) => [id, ...Object.keys(sidebar).filter(() => false)]),
);
const orphans = [...files].filter(
  (f) => !linked.has(f) && !sidebar.includes(f),
);
console.log(`orphan pages (exist but not in sidebars.js): ${orphans.length}`);
for (const o of orphans) console.log(`  ${o}`);
console.log("\nall referenced doc ids resolve");
