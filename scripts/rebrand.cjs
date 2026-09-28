/**
 * Mosaic rebrand.
 *
 * Renames the Excalidraw brand to Mosaic across the working tree, while
 * deliberately leaving alone everything that is a *technical contract* or a
 * *third party* rather than our brand:
 *
 *   - the .excalidraw / .excalidrawlib file format, its MIME types and the
 *     `svg-source:` / `payload-type:` markers embedded in exported SVGs
 *   - LICENSE and copyright attribution
 *   - third-party @excalidraw/* dependencies and upstream GitHub URLs
 *   - i18n keys (58 Crowdin files) -- only the translated *values* change
 *   - persisted localStorage keys, so returning users keep their drawings
 *   - CSS class names, which are a documented public styling API
 *   - the Excalifont family, the Excalidraw+ product, the upstream sync
 *
 * Run the self-test after changing this file:  node scripts/rebrand.cjs --test
 * Run the rebrand:                              node scripts/rebrand.cjs [--dry]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DRY = process.argv.includes("--dry");
const TEST = process.argv.includes("--test");

/* -------------------------------------------------------------------------- */
/* Masking                                                                     */
/* -------------------------------------------------------------------------- */

let seq = 0;
let masks = new Map();
/** Hide every match of `re` from later rules. Returns the new text. */
const hide = (text, re) =>
  text.replace(re, (match) => {
    const key = `\u0000M${seq++}\u0000`;
    masks.set(key, match);
    return key;
  });

/** Put the hidden substrings back exactly as they were. */
const restore = (text) => {
  for (const [key, original] of masks) {
    if (text.includes(key)) text = text.split(key).join(original);
  }
  return text;
};

/* -------------------------------------------------------------------------- */
/* Files we never touch                                                        */
/* -------------------------------------------------------------------------- */

const SKIP_FILE = [
  /^\.git\//,
  /(^|\/)LICENSE$/i,
  /CHANGELOG\.md$/i,
  /\.snap$/,
  /^yarn\.lock$/,
  /^\.env(\.|$)/,
  /crowdin\.yml$/,
  /^\.github\/FUNDING\.yml$/,
  /mosaic-brand-directions\.zip$/,
  /^MOSAIC-SYNC-GUIDE\.md$/,
  /^BRANDING\.md$/,
  // The rebrand tooling must never rewrite itself, or the protected-string
  // patterns in these files would be renamed out from under themselves.
  /^scripts\/rebrand\.cjs$/,
  /^scripts\/audit-leftovers\.cjs$/,
  /^scripts\/fix-rebrand-consistency\.cjs$/,
  /^scripts\/build-brand-assets\.cjs$/,
  /^scripts\/sync-brand-into-html\.cjs$/,
  /^branding\//,
  /^scripts\/sync-upstream\./,
  /^\.github\/workflows\/sync-upstream\.yml$/,
  /\.woff2$|\.png$|\.ico$|\.zip$|\.excalidrawlib$|\.webp$|\.jpg$/i,
];

const isTextFile = (f) =>
  /\.(ts|tsx|js|jsx|mjs|mts|cjs|json|scss|css|html|md|mdx|yml|yaml|svg|config|txt)$/i.test(
    f
  ) || /(^|\/)(package\.json|robots\.txt|_headers)$/.test(f);

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      walk(p, out);
    } else if (isTextFile(rel) && !SKIP_FILE.some((r) => r.test(rel))) {
      out.push(rel);
    }
  }
  return out;
};

/* -------------------------------------------------------------------------- */
/* Phase 1: paths and the first-party package scope                            */
/* -------------------------------------------------------------------------- */

const PATHS = [
  ["excalidraw-app", "mosaic-app"],
  ["packages/excalidraw", "packages/mosaic"],
  ["dev-docs/docs/@excalidraw", "dev-docs/docs/@mosaic"],
  ["@excalidraw/excalidraw", "@mosaic/mosaic"],
  ["@excalidraw/common", "@mosaic/common"],
  ["@excalidraw/element", "@mosaic/element"],
  ["@excalidraw/math", "@mosaic/math"],
  ["@excalidraw/utils", "@mosaic/utils"],
  ["@excalidraw/fractional-indexing", "@mosaic/fractional-indexing"],
  ["@excalidraw/laser-pointer", "@mosaic/laser-pointer"],
  // any other first-party @excalidraw/* (third parties are protected below)
  [/(?<![A-Za-z0-9_-])@excalidraw\/(?!eslint-config|prettier-config|mermaid-to-excalidraw|markdown-to-text|random-username)/g, "@mosaic/"],
];

/* -------------------------------------------------------------------------- */
/* Phase 2: protect the things that are not our brand                          */
/* -------------------------------------------------------------------------- */

const PROTECT = [
  // -- the file format -------------------------------------------------------
  // Longest / most specific first: excalidrawLibrary must win over excalidrawLib.
  /excalidrawLibraryIds/g,
  /excalidrawLibrary_\w+/g,
  /excalidrawLibrary/g,
  /excalidrawClipboardWithAPI/g,
  /excalidrawClipboard/g,
  /excalidrawlib/g,
  /excalidraw\/(?:clipboard|api\/clipboard)/g,
  /application\/vnd\.excalidraw[\w.+-]*/gi,
  /vnd\.excalidraw\w*/gi,
  /\.excalidraw\b/g,
  /\.excalidrawlib\b/g,
  // markers written into exported SVGs; the code asserts on these strings
  /svg-source:\w+/g,
  /payload-type:[\w.+/-]+/g,
  /excalidraw-element-skeleton/g,

  // -- public JS API surface ------------------------------------------------
  /EXCALIDRAW_ASSET_PATH/g,
  /EXCALIDRAW_THROTTLE_RENDER/g,
  /EXCALIDRAW_EXPORT_SOURCE/g,
  /__EXCALIDRAW_SHA__/g,
  /PLACEHOLDER:EXCALIDRAW_APP_FONTS/g,

  // -- persisted storage keys: renaming orphans every user's data -----------
  /"excalidraw-(?:state|collab|theme|debug|library|ttd-chats|oai-api-key)"/g,
  /"mermaid-to-excalidraw"/g,
  /"excalidraw"/g,
  /"excalidrawlib"/g,
  /\b_excalidraw_libraries\b/g,
  /\b_excalidraw\b/g,

  // -- third-party packages, repos, and the upstream brand domain ------------
  /@excalidraw\/eslint-config/g,
  /@excalidraw\/prettier-config/g,
  /@excalidraw\/mermaid-to-excalidraw/g,
  /@excalidraw\/markdown-to-text/g,
  /@excalidraw\/random-username/g,
  /mermaid-to-excalidraw/g,
  /github\.com\/excalidraw\/excalidraw[\w./-]*/gi,
  /githubusercontent\.com\/excalidraw\/excalidraw-libraries/gi,
  /excalidraw-libraries/gi,
  /github\.com\/excalidraw\/excalidraw-room/gi,
  /[a-z0-9.-]*excalidraw\.com[\w./-]*/gi,
  /excalidraw-room-persistence[\w.-]*/gi,
  /us-central1-excalidraw-room-persistence[\w.-]*/gi,
  /excalidraw-oss-dev[\w.-]*/gi,
  /\/excalidraw\/[A-Za-z0-9]/g,
  /orgs\/excalidraw/g,
  /open_collective:\s*excalidraw/g,
  /opencollective\.com\/excalidraw/g,
  /crowdin\.com\/(?:project|translate)\/excalidraw/g,
  /hub\.docker\.com\/r\/excalidraw\/excalidraw/g,
  /x\.com\/excalidraw/g,
  /twitter\.com\/excalidraw/g,
  /youtube\.com\/@excalidraw/g,
  /linkedin\.com\/company\/excalidraw/g,
  /deepwiki\.com\/excalidraw\/excalidraw/g,
  /esexcalidraw|excalidraw\.com\.mx|x-excalidraw|xexcalidraw/gi,

  // -- named assets and the Excalidraw+ product -----------------------------
  /\bExcalifont\b/g,
  /Excalidraw Bot/g,
  /Excalidraw community/g,
  /\bExcalidraw\+/g,
  /\bexcalidrawplus_\w*/g,
  /\bexcalidrawPlus\w*/g,
  /\bExcalidrawPlus\w*/g,
  /EXCALIDRAW_PLUS_ORIGIN/g,
  /isExcalidrawPlusSignedUser/g,
  /excplus-auth/g,

  // -- i18n keys (only the translated values get rebranded) -----------------
  /"madeWithExcalidraw"/g,
  /"mermaidToExcalidraw"/g,
  /"center_heading_plus"/g,
  /"excalidrawPlus"/g,
  /"excalidrawLib"/g,

  // -- CSS class names: a documented public styling API ---------------------
  // Keeping these means .excalidraw, .excalidraw-modal-container and friends all
  // stay coherent with each other and with the tests that target them.
  /excalidraw[-_]{1,2}[\w-]*/g,
  /(["'`])excalidraw(?=["'`\s])/g,

  // -- format constant *keys*, which are really file extensions -------------
  // MIME_TYPES.excalidraw === "application/vnd.excalidraw+json": the key is the
  // extension, so it has to keep spelling out the extension.
  /(\b(?:MIME|STRING_MIME|EXPORT_DATA)_?TYPES\.)\w*(?=[,;\s])/g,
  /\bVERSIONS\.\w*(?=[,;\s])/g,
  /excalidraw\.svg\b/g,
  /excalidraw\.png\b/g,

  // -- symbols owned by the third-party mermaid-to-excalidraw package -------
  // Our call sites must use the names that package actually exports.
  /parseMermaidTo\w+/g,
  /MermaidTo\w+Result/g,
  /MermaidTo\w+Config/g,
  /toolBar\.mermaidTo\w+/g,
  /labels\.excalidrawLib\b/g,
];

/* -------------------------------------------------------------------------- */
/* Phase 3: the actual brand rename                                            */
/* -------------------------------------------------------------------------- */

const BRAND = [
  // Capitalised: the bare product name plus every identifier containing it
  // (ExcalidrawLogo, MosaicProps, useExcalidrawStateValue, ...).
  [/Excalidraw/g, "Mosaic"],
  [/EXCALIDRAW/g, "MOSAIC"],
  // Lowercase, camelCase continuation: excalidrawElements, excalidrawDir.
  [/\bexcalidraw(?=[A-Za-z])/g, "mosaic"],
  // Lowercase standalone: utm_source=excalidraw.
  [/\bexcalidraw\b/g, "mosaic"],
];

const transform = (input) => {
  let text = input;
  for (const [from, to] of PATHS) text = text.split(from).join(to);
  for (const re of PROTECT) text = hide(text, re);
  for (const [from, to] of BRAND) text = text.replace(from, to);
  return restore(text);
};

/* -------------------------------------------------------------------------- */
/* Self-test: the protected things must survive, the brand must not           */
/* -------------------------------------------------------------------------- */

if (TEST) {
  // [input, exact expected output]
  const cases = [
    // third-party packages must not be renamed
    ['"@excalidraw/eslint-config": "1.0.3"', '"@excalidraw/eslint-config": "1.0.3"'],
    ['"@excalidraw/prettier-config"', '"@excalidraw/prettier-config"'],
    ['import x from "@excalidraw/mermaid-to-excalidraw"', 'import x from "@excalidraw/mermaid-to-excalidraw"'],
    ['import x from "@excalidraw/random-username"', 'import x from "@excalidraw/random-username"'],
    // upstream brand domain
    ['"https://excalidraw.com/api/v2/"', '"https://excalidraw.com/api/v2/"'],
    ['"https://libraries.excalidraw.com"', '"https://libraries.excalidraw.com"'],
    ['"https://plus.excalidraw.com/blog"', '"https://plus.excalidraw.com/blog"'],
    ['"https://docs.excalidraw.com/docs/x"', '"https://docs.excalidraw.com/docs/x"'],
    ['"https://github.com/excalidraw/excalidraw/pull/12"', '"https://github.com/excalidraw/excalidraw/pull/12"'],
    ['"github.com/excalidraw/excalidraw-libraries"', '"github.com/excalidraw/excalidraw-libraries"'],
    ['https://xexcalidraw.com', 'https://xexcalidraw.com'],
    ['https://excalidraw.com.mx', 'https://excalidraw.com.mx'],
    // the file format
    ['"application/vnd.excalidraw+json"', '"application/vnd.excalidraw+json"'],
    ['"application/vnd.excalidrawlib+json"', '"application/vnd.excalidrawlib+json"'],
    ['"application/vnd.excalidraw.clipboard+json"', '"application/vnd.excalidraw.clipboard+json"'],
    ['"excalidraw/clipboard"', '"excalidraw/clipboard"'],
    ['"excalidraw-api/clipboard"', '"excalidraw-api/clipboard"'],
    ['"excalidrawlib"', '"excalidrawlib"'],
    ['MIME_TYPES.excalidrawlib', 'MIME_TYPES.excalidrawlib'],
    ['MIME_TYPES.excalidrawlibIds', 'MIME_TYPES.excalidrawlibIds'],
    ['VERSIONS.excalidrawLibrary', 'VERSIONS.excalidrawLibrary'],
    ['EXPORT_DATA_TYPES.excalidrawClipboard', 'EXPORT_DATA_TYPES.excalidrawClipboard'],
    ['EXPORT_DATA_TYPES.excalidraw', 'EXPORT_DATA_TYPES.excalidraw'],
    ['endsWith(".excalidrawlib")', 'endsWith(".excalidrawlib")'],
    ['endsWith(".excalidraw")', 'endsWith(".excalidraw")'],
    ['"mermaid-to-excalidraw"', '"mermaid-to-excalidraw"'],
    ['excalidraw-element-skeleton', 'excalidraw-element-skeleton'],
    // markers embedded in exported SVGs
    ['createHTMLComment("svg-source:excalidraw")', 'createHTMLComment("svg-source:excalidraw")'],
    ['"payload-type:application/vnd.excalidraw+json"', '"payload-type:application/vnd.excalidraw+json"'],
    // i18n keys stay, values are rebranded
    ['"madeWithExcalidraw": "Made with Excalidraw"', '"madeWithExcalidraw": "Made with Mosaic"'],
    ['"mermaidToExcalidraw": "Mermaid to Excalidraw"', '"mermaidToExcalidraw": "Mermaid to Mosaic"'],
    ['"excalidrawplus_button": "Export"', '"excalidrawplus_button": "Export"'],
    ['"excalidrawPlus": { "title": "Excalidraw+" }', '"excalidrawPlus": { "title": "Excalidraw+" }'],
    // persisted storage keys
    ['STORAGE_KEYS = { LOCAL_STORAGE_KEY: "excalidraw" }', 'STORAGE_KEYS = { LOCAL_STORAGE_KEY: "excalidraw" }'],
    ['"excalidraw-theme"', '"excalidraw-theme"'],
    ['"excalidraw-state"', '"excalidraw-state"'],
    ['"excalidraw-library"', '"excalidraw-library"'],
    ['"excalidraw-oai-api-key"', '"excalidraw-oai-api-key"'],
    ['window.name = "_excalidraw"', 'window.name = "_excalidraw"'],
    ['target="_excalidraw_libraries"', 'target="_excalidraw_libraries"'],
    // host integration globals
    ['window.EXCALIDRAW_ASSET_PATH = "/x"', 'window.EXCALIDRAW_ASSET_PATH = "/x"'],
    ['window.EXCALIDRAW_THROTTLE_RENDER', 'window.EXCALIDRAW_THROTTLE_RENDER'],
    ['window.EXCALIDRAW_EXPORT_SOURCE', 'window.EXCALIDRAW_EXPORT_SOURCE'],
    ['window.__EXCALIDRAW_SHA__', 'window.__EXCALIDRAW_SHA__'],
    ['<!-- PLACEHOLDER:EXCALIDRAW_APP_FONTS -->', '<!-- PLACEHOLDER:EXCALIDRAW_APP_FONTS -->'],
    // named assets and the Excalidraw+ product
    ['fontFamily: "Excalifont"', 'fontFamily: "Excalifont"'],
    ['"Excalidraw+"', '"Excalidraw+"'],
    ['ExcMATH as ExcalidrawPlusFrame', 'ExcMATH as ExcalidrawPlusFrame'],
    ['EXCALIDRAW_PLUS_ORIGIN', 'EXCALIDRAW_PLUS_ORIGIN'],
    // CSS classes: documented styling API
    ['className="excalidraw excalidraw-container"', 'className="excalidraw excalidraw-container"'],
    ['"excalidraw excalidraw-container notranslate"', '"excalidraw excalidraw-container notranslate"'],
    ['.excalidraw--view-mode { }', '.excalidraw--view-mode { }'],
    ['.excalidraw__embeddable-hint { }', '.excalidraw__embeddable-hint { }'],
    ['"excalidraw-textEditorContainer"', '"excalidraw-textEditorContainer"'],
    ['"excalidraw-button"', '"excalidraw-button"'],
    ['open_collective: excalidraw', 'open_collective: excalidraw'],
  ];

  // The value is the exact expected output; "" means "must be unchanged".
  let failed = 0;
  for (const [input, expected] of cases) {
    const out = transform(input);
    if (out === expected) {
      console.log(`  ok    ${JSON.stringify(input)} -> ${out}`);
    } else {
      console.log(
        `  FAIL  ${JSON.stringify(input)}\n        got      ${JSON.stringify(
          out
        )}\n        expected ${JSON.stringify(expected)}`
      );
      failed++;
    }
  }

  // Positive cases: brand text has to be renamed.
  const positives = [
    ["Excalidraw Whiteboard", "Mosaic Whiteboard"],
    ["Made with Excalidraw", "Made with Mosaic"],
    ["@excalidraw/element", "@mosaic/element"],
    ["@excalidraw/excalidraw", "@mosaic/mosaic"],
    ["excalidraw-app", "mosaic-app"],
    ["packages/excalidraw/index.tsx", "packages/mosaic/index.tsx"],
    ["export const ExcalidrawLogo", "export const MosaicLogo"],
    ["ExcalidrawProps", "MosaicProps"],
    ["useExcalidrawStateValue", "useMosaicStateValue"],
    ["convertToExcalidrawElements", "convertToMosaicElements"],
    ["excalidrawAPI", "mosaicAPI"],
    ["excalidrawLib", "mosaicLib"],
    ["excalidrawElements", "mosaicElements"],
    ["excalidrawDir", "mosaicDir"],
    ['utm_source=excalidraw', "utm_source=mosaic"],
    ["ExcalidrawImperativeAPI", "MosaicImperativeAPI"],
    ["Excalifont", "Excalifont"],
  ];
  for (const [input, expect] of positives) {
    const out = transform(input);
    if (out !== expect) {
      console.log(`  FAIL  ${JSON.stringify(input)}\n        got      ${out}\n        expected ${expect}`);
      failed++;
    } else {
      console.log(`  ok    ${JSON.stringify(input)} -> ${out}`);
    }
  }

  console.log(failed ? `\n${failed} FAILURES` : "\nall self-tests passed");
  process.exit(failed ? 1 : 0);
}

/* -------------------------------------------------------------------------- */
/* Run                                                                          */
/* -------------------------------------------------------------------------- */

const files = walk(ROOT);
const changed = [];

for (const rel of files) {
  const abs = path.join(ROOT, rel);
  const src = fs.readFileSync(abs, "utf8");
  const out = transform(src);
  masks = new Map();
  seq = 0;
  if (out !== src) {
    changed.push(rel);
    if (!DRY) fs.writeFileSync(abs, out, "utf8");
  }
}

console.log(
  `${DRY ? "[dry] would change" : "changed"} ${changed.length} of ${files.length} files`
);
