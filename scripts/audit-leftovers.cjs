const fs = require("fs");
const { execSync } = require("child_process");

const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => /\.(ts|tsx|js|mjs|mts|cjs|json|scss|css|html|md|mdx|yml|svg|txt)$/.test(f))
  .filter((f) => !/CHANGELOG\.md$|yarn\.lock$|(^|\/)LICENSE$|^\.env/.test(f));

const counts = new Map();
const examples = new Map();

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(/[A-Za-z0-9_.:@/-]*[Ee][Xx][Cc][Aa][Ll][Ii][Dd][Rr][Aa][Ww][A-Za-z0-9_.:@/-]*/g)) {
    const tok = m[0];
    counts.set(tok, (counts.get(tok) || 0) + 1);
    if (!examples.has(tok)) examples.set(tok, f);
  }
}

const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
console.log(`distinct remaining tokens: ${sorted.length}`);
console.log();
for (const [tok, n] of sorted) {
  console.log(`${String(n).padStart(4)}  ${tok}`);
}
