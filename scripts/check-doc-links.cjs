/**
 * Checks that every external link in the docs points at a repository or site
 * that actually exists.
 *
 * The rebrand rewrote some upstream URLs to a "mosaic" GitHub org that was
 * never created, so the links 404 without breaking any build. This catches
 * that class of mistake.
 *
 * Network calls are opt-in (--online) so it can run in CI without hanging on
 * rate limits; the offline pass just reports what it would check.
 *
 * Run: node scripts/check-doc-links.cjs [--online]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "dev-docs", "docs");
const ONLINE = process.argv.includes("--online");

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
};

/** Hosts we do not probe: auth-walled, or not ours to check. */
const SKIP_HOSTS = /^(localhost|127\.|0\.0\.|.*\.local)$/;

const links = new Map();
for (const file of walk(DOCS)) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    const url = m[1];
    if (SKIP_HOSTS.test(new URL(url).hostname)) continue;
    if (!links.has(url)) links.set(url, []);
    links.get(url).push(path.relative(ROOT, file).replace(/\\/g, "/"));
  }
}

const byHost = new Map();
for (const url of links.keys()) {
  const h = new URL(url).hostname;
  if (!byHost.has(h)) byHost.set(h, []);
  byHost.get(h).push(url);
}

console.log(`${links.size} external links across ${byHost.size} hosts\n`);

if (!ONLINE) {
  for (const [host, urls] of byHost) {
    console.log(`  ${host}  (${urls.length})`);
  }
  console.log("\nre-run with --online to probe them");
  process.exit(0);
}

(async () => {
  let bad = 0;
  for (const url of links.keys()) {
    const host = new URL(url).hostname;
    if (SKIP_HOSTS.test(host)) continue;
    let ok = false;
    try {
      // HEAD first, fall back to GET: some hosts reject HEAD.
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      ok = res.ok || res.status === 405 || res.status === 403;
    } catch {
      try {
        const res = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
        });
        ok = res.ok || res.status === 403;
      } catch (e) {
        ok = false;
      }
    }
    if (!ok) {
      bad++;
      console.log(`  BROKEN  ${url}`);
      for (const f of links.get(url)) console.log(`      used in ${f}`);
    }
  }
  console.log(
    bad ? `\n${bad} broken link(s)` : "\nall external links reachable",
  );
  process.exit(bad ? 1 : 0);
})();
