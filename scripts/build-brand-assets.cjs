/**
 * Generates the Mosaic brand asset set from the chosen mark
 * (the 2x2 blue tile grid) and rasterises the PNG variants.
 *
 * Run: node scripts/build-brand-assets.cjs
 */
const fs = require("fs");
const path = require("path");
const { Resvg } = require(process.env.RESVG_PATH);

const PUBLIC = path.resolve(__dirname, "..", "public");
const BRAND = path.resolve(__dirname, "..", "branding");

// The brand ramp. #3977df is the hero blue from the selected lockup.
const C = {
  hero: "#3977df",
  mid: "#5f96ea",
  light: "#8fb4f2",
  soft: "#c7dbfb",
  ink: "#253144",
  muted: "#8390a0",
  night: "#0f1729",
};

/** 2x2 tile grid, laid out in a `size`x`size` box. */
const mark = ({ size = 512, tile, gap, pad, radius }) => `
  <rect x="${pad}" y="${pad}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.hero}"/>
  <rect x="${pad + tile + gap}" y="${pad}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.light}"/>
  <rect x="${pad}" y="${pad + tile + gap}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.mid}"/>
  <rect x="${pad + tile + gap}" y="${pad + tile + gap}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.soft}"/>`;

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (title ? `<title>${title}</title>` : "") +
  body +
  `</svg>`;

const files = {};

// 1. Mark only (square, transparent) ------------------------------------------------
files["mosaic-mark.svg"] = svg(
  512,
  512,
  mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }),
  "Mosaic"
);

// 2. Favicon -----------------------------------------------------------------------
// Tiles fill more of the box so they stay crisp at 16px, and the white plate
// keeps the mark readable on dark browser chrome.
files["favicon.svg"] = svg(
  64,
  64,
  `<rect width="64" height="64" rx="13" fill="#ffffff"/>` +
    mark({ size: 64, tile: 27, gap: 3, pad: 3.5, radius: 6 }),
  "Mosaic"
);

// 3. Horizontal lockup --------------------------------------------------------------
files["mosaic-logo.svg"] = svg(
  720,
  200,
  `<g transform="translate(24 16)">` +
    mark({ size: 168, tile: 66, gap: 8, pad: 14, radius: 16 }) +
    `</g>` +
    `<text x="248" y="104" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="62" font-weight="650" fill="${C.ink}">Mosaic</text>` +
    `<text x="250" y="140" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="15" letter-spacing="2.2" fill="${C.muted}">MOSAIC</text>`,
  "Mosaic"
);

// 4. Stacked lockup (for narrow spaces) --------------------------------------------
files["mosaic-logo-stacked.svg"] = svg(
  200,
  260,
  `<g transform="translate(44 20)">` +
    mark({ size: 112, tile: 44, gap: 5, pad: 9, radius: 10 }) +
    `</g>` +
    `<text x="100" y="196" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="34" font-weight="650" fill="${C.ink}">Mosaic</text>` +
    `<text x="101" y="222" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="9" letter-spacing="1.6" fill="${C.muted}">MOSAIC</text>`,
  "Mosaic"
);

// 5. Wordmark only ------------------------------------------------------------------
files["mosaic-wordmark.svg"] = svg(
  420,
  120,
  `<text x="0" y="74" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="62" font-weight="650" fill="${C.ink}">Mosaic</text>` +
    `<text x="2" y="104" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="14" letter-spacing="2" fill="${C.muted}">MOSAIC</text>`,
  "Mosaic"
);

// 6. Maskable icons (full-bleed background, mark inside the 80% safe zone) -----------
files["maskable_icon_x192.svg"] = svg(
  192,
  192,
  `<rect width="192" height="192" fill="${C.night}"/>` +
    `<g transform="translate(27.2 27.2) scale(0.5375)">` +
    mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }) +
    `</g>`,
  "Mosaic"
);
files["maskable_icon_x512.svg"] = svg(
  512,
  512,
  `<rect width="512" height="512" fill="${C.night}"/>` +
    `<g transform="translate(72.5 72.5) scale(0.7168)">` +
    mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }) +
    `</g>`,
  "Mosaic"
);

// 7. Social card ---------------------------------------------------------------------
{
  // A faint tile field in the background, echoing the mark.
  const tiles = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 9; c++) {
      const x = 40 + c * 132;
      const y = 30 + r * 150;
      const shades = ["#ffffff", C.mid, C.light, C.hero];
      const idx = (r * 9 + c * 3) % 4;
      tiles.push(
        `<rect x="${x}" y="${y}" width="96" height="96" rx="22" fill="${shades[idx]}" opacity="${
          0.025 + idx * 0.018
        }"/>`
      );
    }
  }
  files["og-image.svg"] = svg(
    1200,
    630,
    `<rect width="1200" height="630" fill="${C.night}"/>` +
      `<g transform="translate(700 -60) scale(1.05)">${tiles.join("")}</g>` +
      `<g transform="translate(96 214)">` +
      mark({ size: 168, tile: 66, gap: 8, pad: 14, radius: 16 }) +
      `</g>` +
      `<text x="320" y="322" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="96" font-weight="650" fill="#ffffff">Mosaic</text>` +
      `<text x="323" y="372" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="26" fill="#8fb4f2">Visual whiteboard for teams</text>` +
      `<text x="96" y="520" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="26" fill="#8390a0">Sketch ideas, map systems, think together — in the browser.</text>`,
    "Mosaic"
  );
}

// --- write -------------------------------------------------------------------------
fs.mkdirSync(BRAND, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(BRAND, name), content, "utf8");
}
fs.writeFileSync(path.join(PUBLIC, "favicon.svg"), files["favicon.svg"], "utf8");
fs.writeFileSync(path.join(PUBLIC, "og-image.svg"), files["og-image.svg"], "utf8");
console.log(`wrote ${Object.keys(files).length} brand SVGs`);

// --- rasterise ---------------------------------------------------------------------
const raster = [
  ["mosaic-mark.svg", "mosaic-mark.png", 512],
  ["favicon.svg", "favicon-16x16.png", 16],
  ["favicon.svg", "favicon-32x32.png", 32],
  ["favicon.svg", "favicon-48x48.png", 48],
  ["mosaic-mark.svg", "android-chrome-192x192.png", 192],
  ["mosaic-mark.svg", "android-chrome-512x512.png", 512],
  ["mosaic-mark.svg", "apple-touch-icon.png", 180],
  ["maskable_icon_x192.svg", "maskable_icon_x192.png", 192],
  ["maskable_icon_x512.svg", "maskable_icon_x512.png", 512],
  ["mosaic-logo.svg", "mosaic-logo.png", 1440],
  ["og-image.svg", "og-image-3.png", 1200],
];

for (const [src, out, width] of raster) {
  const svgText = fs.readFileSync(path.join(BRAND, src), "utf8");
  const r = new Resvg(svgText, {
    fitTo: { mode: "width", value: width },
    background: "rgba(0,0,0,0)",
  });
  const buf = r.render().asPng();
  fs.writeFileSync(path.join(PUBLIC, out), buf);
  console.log(`  ${out}  ${width}px  ${(buf.length / 1024).toFixed(1)}kB`);
}
console.log("done");
