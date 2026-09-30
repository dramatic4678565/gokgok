/**
 * Writes the branding meta tags into mosaic-app/index.html from
 * branding/mosaic-brand.json, between the BRANDING:BEGIN / BRANDING:END
 * markers.
 *
 * index.html is a static file processed by vite, so the values are baked in at
 * build-prep time rather than templated at runtime. Re-run this after changing
 * the brand JSON, then commit the result.
 *
 * Run: node scripts/sync-brand-into-html.cjs [--check]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const brand = JSON.parse(
  fs.readFileSync(path.join(ROOT, "branding", "mosaic-brand.json"), "utf8")
);

const BEGIN = "<!-- BRANDING:BEGIN";
const END = "<!-- BRANDING:END -->";

const escapeAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const url = brand.siteUrl.replace(/\/$/, "");
const ogImage = `${url}/${brand.assets.ogImage}`;

const meta = (attr, name, content) =>
  `    <meta ${attr}="${name}" content="${content}" />`;

const block = `    <!-- Primary Meta Tags -->
${meta("name", "title", escapeAttr(`${brand.shortDescription} | ${brand.name}`))}
${meta("name", "description", escapeAttr(brand.description))}
${meta("name", "image", escapeAttr(ogImage))}

    <!-- Open Graph / Facebook -->
${meta("property", "og:site_name", escapeAttr(brand.name))}
${meta("property", "og:type", escapeAttr("website"))}
${meta("property", "og:url", escapeAttr(url))}
${meta("property", "og:title", escapeAttr(`${brand.name} — ${brand.tagline}`))}
${meta("property", "og:image:alt", escapeAttr(`${brand.name} logo`))}
${meta("property", "og:description", escapeAttr(brand.description))}
${meta("property", "og:image", escapeAttr(ogImage))}

    <!-- Twitter -->
${meta("property", "twitter:card", escapeAttr("summary_large_image"))}
${meta("property", "twitter:site", escapeAttr(brand.social.twitter))}
${meta("property", "twitter:url", escapeAttr(url))}
${meta("property", "twitter:title", escapeAttr(`${brand.name} — ${brand.tagline}`))}
${meta("property", "twitter:description", escapeAttr(brand.description))}
${meta("property", "twitter:image", escapeAttr(ogImage))}

    <link rel="canonical" href="${escapeAttr(url)}" />
`;

const file = path.join(ROOT, "mosaic-app", "index.html");
const html = fs.readFileSync(file, "utf8");
const start = html.indexOf(BEGIN);
const end = html.indexOf(END);
if (start === -1 || end === -1) {
  console.error(`markers not found in index.html (${BEGIN} / ${END})`);
  process.exit(1);
}
const head = html.slice(0, start);
// `tail` keeps the END marker, so the block is written between the two.
const tail = html.slice(end);
const next = `${head}${BEGIN} generated from branding/mosaic-brand.json by
         scripts/sync-brand-into-html.cjs -- do not edit by hand -->
${block}${tail}`;

const { execFileSync } = require("child_process");

/** Format with the repo's own Prettier so this script and the linter agree. */
const format = (source) => {
  // Resolved rather than hard-coded: Prettier's bin filename differs between
  // major versions (bin-prettier.js in 2.x, bin/prettier.cjs in 3.x).
  let bin;
  try {
    bin = require.resolve("prettier/bin-prettier.js");
  } catch {
    bin = require.resolve("prettier");
  }
  try {
    return execFileSync(
      process.execPath,
      [bin, "--parser", "html"],
      { input: source, cwd: ROOT, encoding: "utf8" },
    );
  } catch (e) {
    console.warn(`  (prettier unavailable, writing unformatted: ${e.message})`);
    return source;
  }
};

if (process.argv.includes("--check")) {
  if (format(next) !== html) {
    console.error(
      "index.html branding is out of date with branding/mosaic-brand.json.\n" +
        "Run: node scripts/sync-brand-into-html.cjs",
    );
    process.exit(1);
  }
  console.log("index.html branding is in sync");
} else {
  const formatted = format(next);
  if (formatted === html) {
    console.log("index.html branding already in sync");
  } else {
    fs.writeFileSync(file, formatted, "utf8");
    console.log("updated mosaic-app/index.html branding block");
  }
}
