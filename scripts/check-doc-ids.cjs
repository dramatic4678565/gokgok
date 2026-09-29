const fs = require("fs");
const path = require("path");

const DOCS = path.resolve(__dirname, "..", "dev-docs", "docs");
const sidebars = fs.readFileSync(
  path.resolve(__dirname, "..", "dev-docs", "sidebars.js"),
  "utf8",
);

// Docusaurus derives a doc id from its path under docs/, minus the extension.
const walk = (dir, base, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, base, out);
    } else if (/\.mdx?$/.test(e.name)) {
      const rel = path.relative(base, p).replace(/\\/g, "/");
      out.push(rel.replace(/\.mdx?$/, ""));
    }
  }
  return out;
};

const files = new Set(walk(DOCS, DOCS));

// Pull every quoted string that looks like a doc id out of sidebars.js.
// Category `label:` values are display text, not ids, so they are skipped.
const ids = new Set();
for (const m of sidebars.matchAll(/(?<!\blabel: )"(@[A-Za-z0-9@/_-]+)"/g)) {
  ids.add(m[1]);
}

const missing = [...ids].filter((id) => !files.has(id)).sort();

console.log(`doc files: ${files.size}`);
console.log(`doc ids referenced in sidebars.js: ${ids.size}`);
if (missing.length) {
  console.log(`\nMISSING (build would fail):`);
  for (const id of missing) console.log(`  ${id}`);
  process.exit(1);
} else {
  console.log(
    "\nall referenced doc ids resolve to a file -- docusaurus build will not break on this",
  );
}
