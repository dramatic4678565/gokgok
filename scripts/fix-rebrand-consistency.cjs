/**
 * Post-rebrand consistency fixes.
 *
 * The bulk rebrand renamed a few things that turn out to be *format
 * identifiers* rather than brand, and a few files that the rebrand could only
 * rename by import, not on disk. This puts those back in order.
 *
 * Run: node scripts/fix-rebrand-consistency.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const edit = (file, pairs) => {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) {
    console.log(`  skip  ${file}: does not exist`);
    return;
  }
  let text = fs.readFileSync(abs, "utf8");
  const before = text;
  for (const [from, to] of pairs) {
    if (!text.includes(from)) {
      console.log(`  skip  ${file}: not found -> ${JSON.stringify(from)}`);
      continue;
    }
    text = text.split(from).join(to);
  }
  if (text !== before) {
    fs.writeFileSync(abs, text, "utf8");
    console.log(`  fix   ${file}`);
  }
};

console.log("1. MIME/format constant keys are file extensions, not brand");
edit("packages/common/src/constants.ts", [
  ['  mosaic: "application/vnd.excalidraw+json",', '  excalidraw: "application/vnd.excalidraw+json",'],
  ['  "mosaic.svg": "image/svg+xml",', '  "excalidraw.svg": "image/svg+xml",'],
  ['  "mosaic.png": "image/png",', '  "excalidraw.png": "image/png",'],
  ['  mosaic: "excalidraw",', '  excalidraw: "excalidraw",'],
  ["  mosaic: 2,", "  excalidraw: 2,"],
]);
// The export extension has to match the MIME_TYPES key it is looked up by.
edit("packages/mosaic/data/index.ts", [
  ['"mosaic.svg"', '"excalidraw.svg"'],
  ['"mosaic.png"', '"excalidraw.png"'],
]);

console.log("\n2. Symbols that come from the third-party mermaid-to-excalidraw package");
const MERMAID = [
  ["parseMermaidToMosaic", "parseMermaidToExcalidraw"],
  ["MermaidToMosaicResult", "MermaidToExcalidrawResult"],
  ["MermaidToMosaicConfig", "MermaidToExcalidrawConfig"],
];
for (const f of [
  "packages/mosaic/components/TTDDialog/hooks/useTextGeneration.ts",
  "packages/mosaic/components/TTDDialog/types.ts",
  "packages/mosaic/components/TTDDialog/TTDDialog.tsx",
  "packages/mosaic/tests/helpers/mocks.ts",
  "packages/mosaic/tests/clipboard.test.tsx",
  "packages/mosaic/tests/MermaidToExcalidraw.test.tsx",
]) {
  edit(f, MERMAID);
}

console.log("\n3. i18n keys are Crowdin-managed; only the values get branded");
for (const f of [
  "packages/mosaic/components/Toolbar.tsx",
  "packages/mosaic/components/MobileToolbar.tsx",
  "packages/mosaic/components/CommandPalette/CommandPalette.tsx",
]) {
  edit(f, [["toolBar.mermaidToMosaic", "toolBar.mermaidToExcalidraw"]]);
}
// t("labels.excalidrawLib") is a locale key, not the mosaicLib prop.
for (const f of [
  "packages/mosaic/components/LibraryMenuItems.tsx",
  "packages/mosaic/components/LibraryMenuHeaderContent.tsx",
]) {
  edit(f, [["labels.mosaicLib", "labels.excalidrawLib"]]);
}

console.log("\n4. relative imports that walk into packages/excalidraw");
edit("packages/tsconfig.base.json", [
  ['"./excalidraw/index.tsx"', '"./mosaic/index.tsx"'],
]);
edit("packages/element/src/Scene.ts", [
  ['"../../excalidraw/types"', '"../../mosaic/types"'],
]);
for (const f of [
  "packages/element/tests/linearElementEditor.test.tsx",
  "packages/element/tests/binding.test.tsx",
]) {
  edit(f, [['"../../excalidraw/tests/queries/dom"', '"../../mosaic/tests/queries/dom"']]);
}

console.log("\n5. remaining mermaid-to-excalidraw call sites");
const walkAll = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
};
for (const abs of walkAll(path.join(ROOT, "packages"))) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  if (rel === "scripts/fix-rebrand-consistency.cjs") continue;
  const before = fs.readFileSync(abs, "utf8");
  const after = MERMAID.reduce((t, [f, t2]) => t.split(f).join(t2), before);
  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    console.log(`  fix   ${rel}`);
  }
}

console.log("\n6. the premium tier is branded Mosaic+ (files already renamed on disk)");
// Identifiers and import paths. The cookie name, the locale keys and the
// env-var name stay: those are contracts with something outside the source.
const PLUS = [
  ["ExcalidrawPlusIframeExport", "MosaicPlusIframeExport"],
  ["ExcalidrawPlusPromoBanner", "MosaicPlusPromoBanner"],
  ["ExcalidrawPlusCommand", "MosaicPlusCommand"],
  ["ExcalidrawPlusAppCommand", "MosaicPlusAppCommand"],
  ["ExcalidrawPlusFrame", "MosaicPlusFrame"],
  ["isExcalidrawPlusSignedUser", "isMosaicPlusSignedUser"],
  ["ExcalidrawPlusExport", "MosaicPlusExport"],
  ['"./ExcalidrawPlusIframeExport"', '"./MosaicPlusIframeExport"'],
  ['"./components/ExcalidrawPlusPromoBanner"', '"./components/MosaicPlusPromoBanner"'],
];
for (const abs of walkAll(path.join(ROOT, "mosaic-app"))) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const before = fs.readFileSync(abs, "utf8");
  const after = PLUS.reduce((t, [f, t2]) => t.split(f).join(t2), before);
  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    console.log(`  fix   ${rel}`);
  }
}

console.log("\ndone");
