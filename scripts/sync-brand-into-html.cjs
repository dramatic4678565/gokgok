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

const block = `    <!-- Primary Meta Tags -->
    <meta name="title" content="${escapeAttr(
  `${brand.shortDescription} | ${brand.name}`
)}" />
    <meta name="description" content="${escapeAttr(brand.description)}" />
    <meta name="image" content="${escapeAttr(ogImage)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:site_name" content="${escapeAttr(brand.name)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeAttr(url)}" />
    <meta property="og:title" content="${escapeAttr(
  `${brand.name} — ${brand.tagline}`
)}" />
    <meta property="og:image:alt" content="${escapeAttr(
  `${brand.name} logo`
)}" />
    <meta property="og:description" content="${escapeAttr(brand.description)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:site" content="${escapeAttr(
  brand.social.twitter
)}" />
    <meta property="twitter:url" content="${escapeAttr(url)}" />
    <meta property="twitter:title" content="${escapeAttr(
  `${brand.name} — ${brand.tagline}`
)}" />
    <meta property="twitter:description" content="${escapeAttr(
  brand.description
)}" />
    <meta property="twitter:image" content="${escapeAttr(ogImage)}" />

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

if (process.argv.includes("--check")) {
  if (next !== html) {
    console.error(
      "index.html branding is out of date with branding/mosaic-brand.json.\n" +
        "Run: node scripts/sync-brand-into-html.cjs"
    );
    process.exit(1);
  }
  console.log("index.html branding is in sync");
} else if (next === html) {
  console.log("index.html branding already in sync");
} else {
  fs.writeFileSync(file, next, "utf8");
  console.log("updated mosaic-app/index.html branding block");
}
