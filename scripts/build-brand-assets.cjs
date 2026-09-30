/**
 * Generates the Mosaic brand asset set from the chosen mark
 * (the 2x2 blue tile grid) and rasterises the PNG variants.
 *
 * Run: node scripts/build-brand-assets.cjs
 */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

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
  <rect x="${pad}" y="${pad}" width="${tile}" height="${tile}" rx="${radius}" fill="${
  C.hero
}"/>
  <rect x="${
    pad + tile + gap
  }" y="${pad}" width="${tile}" height="${tile}" rx="${radius}" fill="${
  C.light
}"/>
  <rect x="${pad}" y="${
  pad + tile + gap
}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.mid}"/>
  <rect x="${pad + tile + gap}" y="${
  pad + tile + gap
}" width="${tile}" height="${tile}" rx="${radius}" fill="${C.soft}"/>`;

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (title ? `<title>${title}</title>` : "") +
  body +
  `</svg>`;

/**
 * Packs PNG frames into a .ico container.
 *
 * Browsers ask for /favicon.ico before the PNG or SVG variants, so a stale one
 * is enough to make the upstream mark show up in the tab bar no matter what the
 * rest of the icons say. PNG-in-ICO has been supported everywhere since IE11 and
 * is what every icon pipeline emits now.
 */
const buildIco = (pngs, sizes) => {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += pngs[i].length;
  }
  return Buffer.concat([header, ...entries, ...pngs]);
};

const files = {};

// 1. Mark only (square, transparent) ------------------------------------------------
files["mosaic-mark.svg"] = svg(
  512,
  512,
  mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }),
  "Mosaic",
);

// 2. Favicon -----------------------------------------------------------------------
// Tiles fill more of the box so they stay crisp at 16px, and the white plate
// keeps the mark readable on dark browser chrome.
files["favicon.svg"] = svg(
  64,
  64,
  `<rect width="64" height="64" rx="13" fill="#ffffff"/>` +
    mark({ size: 64, tile: 27, gap: 3, pad: 3.5, radius: 6 }),
  "Mosaic",
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
  "Mosaic",
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
  "Mosaic",
);

// 5. Wordmark only ------------------------------------------------------------------
files["mosaic-wordmark.svg"] = svg(
  420,
  120,
  `<text x="0" y="74" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="62" font-weight="650" fill="${C.ink}">Mosaic</text>` +
    `<text x="2" y="104" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="14" letter-spacing="2" fill="${C.muted}">MOSAIC</text>`,
  "Mosaic",
);

// 6. Maskable icons (full-bleed background, mark inside the 80% safe zone) -----------
files["maskable_icon_x192.svg"] = svg(
  192,
  192,
  `<rect width="192" height="192" fill="${C.night}"/>` +
    `<g transform="translate(27.2 27.2) scale(0.5375)">` +
    mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }) +
    `</g>`,
  "Mosaic",
);
files["maskable_icon_x512.svg"] = svg(
  512,
  512,
  `<rect width="512" height="512" fill="${C.night}"/>` +
    `<g transform="translate(72.5 72.5) scale(0.7168)">` +
    mark({ size: 512, tile: 200, gap: 24, pad: 44, radius: 48 }) +
    `</g>`,
  "Mosaic",
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
        `<rect x="${x}" y="${y}" width="96" height="96" rx="22" fill="${
          shades[idx]
        }" opacity="${0.025 + idx * 0.018}"/>`,
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
    "Mosaic",
  );
}

// --- write -------------------------------------------------------------------------
fs.mkdirSync(BRAND, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(BRAND, name), content, "utf8");
}
fs.writeFileSync(
  path.join(PUBLIC, "favicon.svg"),
  files["favicon.svg"],
  "utf8",
);
fs.writeFileSync(
  path.join(PUBLIC, "og-image.svg"),
  files["og-image.svg"],
  "utf8",
);
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

/**
 * PWA store screenshots. Upstream shipped these as hand-made mockups showing
 * its own UI; ours are generated so they can never go stale and always carry the
 * Mosaic identity. The aspect ratio matches the originals (462x945) so the
 * manifest does not need to change.
 */
const SCREENSHOTS = [
  ["virtual-whiteboard", "#0f1729", "hero", "Draw, map, think"],
  ["shapes", "#132033", "shapes", "Every shape you need"],
  ["wireframe", "#101c2e", "wireframe", "Sketch in wireframe"],
  ["illustration", "#16273d", "illustration", "Add illustration"],
  ["collaboration", "#122036", "collaboration", "Work together live"],
  ["export", "#0f1729", "export", "Export anywhere"],
];

/** A mock browser window with the mark, used for the PWA listing screenshots. */
const mockup = (bg, kind, caption) => {
  const W = 462;
  const H = 945;
  const bar = 46;
  const pad = 18;
  const panelX = pad;
  const panelW = 96;
  const topY = bar + 22;

  // The sidebar / toolbar shapes differ per shot so the set does not look
  // like six copies of the same image.
  const sidebar = [
    `<rect x="${panelX}" y="${topY}" width="${panelW}" height="${
      H - topY - pad - 40
    }" rx="16" fill="rgba(255,255,255,0.05)"/>`,
    ...[0, 1, 2, 3, 4].map(
      (i) =>
        `<rect x="${panelX + 12}" y="${topY + 16 + i * 34}" width="${
          72 - (i % 2) * 16
        }" height="18" rx="9" fill="rgba(255,255,255,${0.16 - i * 0.02})"/>`,
    ),
  ];

  const art = {
    hero: [
      `<rect x="${panelW + 2 * pad}" y="${
        topY + 40
      }" width="180" height="120" rx="14" fill="rgba(57,119,223,0.55)"/>`,
      `<rect x="${panelW + 2 * pad + 200}" y="${
        topY + 40
      }" width="96" height="120" rx="14" fill="rgba(143,180,242,0.5)"/>`,
      `<path d="M${panelW + 2 * pad + 180} ${
        topY + 100
      } l20 0" stroke="#c7dbfb" stroke-width="6" stroke-linecap="round"/>`,
    ],
    shapes: [
      `<circle cx="${W / 2}" cy="${
        topY + 250
      }" r="72" fill="rgba(57,119,223,0.55)"/>`,
      `<rect x="${W / 2 - 40}" y="${
        topY + 360
      }" width="150" height="110" rx="16" fill="rgba(143,180,242,0.45)"/>`,
      `<path d="M${W / 2 - 70} ${
        topY + 530
      } l140 0" stroke="#c7dbfb" stroke-width="6" stroke-linecap="round"/>`,
    ],
    wireframe: [
      `<rect x="${panelW + 2 * pad}" y="${
        topY + 40
      }" width="300" height="200" rx="16" fill="none" stroke="rgba(199,219,251,0.8)" stroke-width="4"/>`,
      `<path d="M${panelW + 2 * pad} ${topY + 40} l300 200 M${
        panelW + 2 * pad + 300
      } ${
        topY + 40
      } l-300 200" stroke="rgba(199,219,251,0.4)" stroke-width="3"/>`,
      `<rect x="${panelW + 2 * pad}" y="${
        topY + 280
      }" width="220" height="150" rx="16" fill="none" stroke="rgba(199,219,251,0.6)" stroke-width="4"/>`,
    ],
    illustration: [
      `<circle cx="${W / 2 - 50}" cy="${
        topY + 260
      }" r="58" fill="rgba(57,119,223,0.5)"/>`,
      `<circle cx="${W / 2 + 70}" cy="${
        topY + 300
      }" r="40" fill="rgba(143,180,242,0.45)"/>`,
      `<rect x="${W / 2 - 120}" y="${
        topY + 380
      }" width="300" height="150" rx="18" fill="rgba(199,219,251,0.28)"/>`,
    ],
    collaboration: [
      `<circle cx="${W / 2 - 60}" cy="${
        topY + 250
      }" r="34" fill="rgba(95,150,234,0.9)"/>`,
      `<circle cx="${W / 2 + 60}" cy="${
        topY + 280
      }" r="34" fill="rgba(143,180,242,0.9)"/>`,
      `<circle cx="${W / 2}" cy="${
        topY + 350
      }" r="34" fill="rgba(199,219,251,0.9)"/>`,
      `<path d="M${W / 2 - 34} ${topY + 262} l40 30 M${W / 2 + 34} ${
        topY + 296
      } l-22 40" stroke="rgba(255,255,255,0.55)" stroke-width="5" stroke-linecap="round"/>`,
    ],
    export: [
      `<rect x="${panelW + 2 * pad}" y="${
        topY + 60
      }" width="300" height="180" rx="16" fill="rgba(57,119,223,0.5)"/>`,
      `<rect x="${panelW + 2 * pad}" y="${
        topY + 280
      }" width="140" height="120" rx="14" fill="rgba(143,180,242,0.45)"/>`,
      `<rect x="${panelW + 2 * pad + 160}" y="${
        topY + 280
      }" width="140" height="120" rx="14" fill="rgba(199,219,251,0.35)"/>`,
    ],
  }[kind];

  // The mark sits centre-screen, below whatever the scene shows.
  const markSvg = `<g transform="translate(${W / 2 - 76} ${
    topY + 500
  }) scale(1.19)">${mark({
    size: 128,
    tile: 50,
    gap: 7,
    pad: 7,
    radius: 13,
  })}</g>`;

  return svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${bg}"/>` +
      // window chrome
      `<rect width="${W}" height="${bar}" fill="rgba(0,0,0,0.28)"/>` +
      `<circle cx="22" cy="${bar / 2}" r="6" fill="rgba(255,255,255,0.28)"/>` +
      `<circle cx="42" cy="${bar / 2}" r="6" fill="rgba(255,255,255,0.22)"/>` +
      `<circle cx="62" cy="${bar / 2}" r="6" fill="rgba(255,255,255,0.18)"/>` +
      `<rect x="88" y="${bar / 2 - 9}" width="${
        W - 120
      }" height="18" rx="9" fill="rgba(255,255,255,0.10)"/>` +
      sidebar.join("") +
      `<rect x="${panelX + pad + panelW}" y="${topY}" width="${
        W - panelW - pad * 2 - pad
      }" height="${
        H - topY - pad - 40
      }" rx="16" fill="rgba(255,255,255,0.03)"/>` +
      art.join("") +
      markSvg +
      `<text x="${W / 2}" y="${
        H - 92
      }" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="26" font-weight="650" fill="#ffffff">${caption}</text>` +
      `<text x="${W / 2}" y="${
        H - 62
      }" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="12" letter-spacing="1.8" fill="${
        C.muted
      }">MOSAIC</text>`,
    `Mosaic — ${caption}`,
  );
};

const screenshotDir = path.join(PUBLIC, "screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });
for (const [name, bg, kind, caption] of SCREENSHOTS) {
  const source = mockup(bg, kind, caption);
  fs.writeFileSync(path.join(BRAND, `screenshot-${name}.svg`), source, "utf8");
  const r = new Resvg(source, {
    fitTo: { mode: "width", value: 462 },
    background: "rgba(0,0,0,0)",
  });
  fs.writeFileSync(path.join(screenshotDir, `${name}.png`), r.render().asPng());
}
console.log(`wrote ${SCREENSHOTS.length} PWA screenshots`);

/**
 * Sidebar promo artwork.
 *
 * These are only rendered when SHOW_UPSTREAM_PROMOS is on (see
 * mosaic-app/app_constants.ts), so they are off-brand on a default deployment
 * -- but they should still not be pictures of someone else's product, in case
 * a fork turns the flag on. Regenerated here so they can never drift.
 */
{
  const promo = (kind, label, dark) => {
    const W = 400;
    const H = 280;
    const bg = dark ? "#122036" : "#ffffff";
    const fg = dark ? "#e8eaed" : "#253144";
    const sub = dark ? "#9aa0a6" : "#8390a0";
    const art =
      kind === "comments"
        ? [
            `<rect x="54" y="46" width="200" height="130" rx="16" fill="rgba(57,119,223,0.5)"/>`,
            `<rect x="196" y="74" width="150" height="86" rx="14" fill="rgba(143,180,242,0.45)"/>`,
            `<circle cx="126" cy="98" r="15" fill="rgba(255,255,255,0.9)"/>`,
            `<rect x="152" y="90" width="82" height="8" rx="4" fill="rgba(255,255,255,0.7)"/>`,
            `<rect x="152" y="104" width="56" height="8" rx="4" fill="rgba(255,255,255,0.45)"/>`,
          ]
        : [
            `<rect x="70" y="52" width="260" height="150" rx="18" fill="rgba(143,180,242,0.45)"/>`,
            `<rect x="104" y="86" width="120" height="12" rx="6" fill="rgba(57,119,223,0.9)"/>`,
            `<rect x="104" y="112" width="180" height="12" rx="6" fill="rgba(57,119,223,0.55)"/>`,
            `<rect x="104" y="138" width="150" height="12" rx="6" fill="rgba(57,119,223,0.35)"/>`,
          ];
    return svg(
      W,
      H,
      `<rect width="${W}" height="${H}" fill="${bg}"/>` +
        art.join("") +
        `<text x="${W / 2}" y="${
          H - 44
        }" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="22" font-weight="650" fill="${fg}">${label}</text>` +
        `<text x="${W / 2}" y="${
          H - 20
        }" text-anchor="middle" font-family="Inter,Segoe UI,Helvetica,Arial,sans-serif" font-size="10" letter-spacing="1.6" fill="${sub}">MOSAIC</text>`,
      `Mosaic — ${label}`,
    );
  };

  for (const [kind, label] of [
    ["comments", "Comments in context"],
    ["presentation", "Present from a sketch"],
  ]) {
    for (const theme of ["dark", "light"]) {
      const source = promo(kind, label, theme === "dark");
      fs.writeFileSync(
        path.join(BRAND, `sidebar-${kind}-promo-${theme}.svg`),
        source,
        "utf8",
      );
      const r = new Resvg(source, {
        fitTo: { mode: "width", value: 400 },
        background: "rgba(0,0,0,0)",
      });
      const png = r.render().asPng();
      fs.writeFileSync(
        path.join(PUBLIC, `sidebar-${kind}-promo-${theme}.png`),
        png,
      );
      // The components reference .jpg; drop the originals so the old artwork
      // cannot linger and win over the new file.
      fs.rmSync(path.join(PUBLIC, `sidebar-${kind}-promo-${theme}.jpg`), {
        force: true,
      });
      console.log(`  sidebar-${kind}-promo-${theme}.png  (replaces .jpg)`);
    }
  }
}

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

// favicon.ico -- browsers prefer this over the PNG/SVG, so leaving the upstream
// one in place is what makes the old icon show up in the tab bar.
{
  const svgText = files["favicon.svg"];
  const sizes = [16, 24, 32, 48];
  const pngs = sizes.map((size) =>
    new Resvg(svgText, {
      fitTo: { mode: "width", value: size },
      background: "rgba(0,0,0,0)",
    })
      .render()
      .asPng(),
  );
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), buildIco(pngs, sizes));
  console.log(
    `  favicon.ico  ${sizes.join("/")}  ${(
      fs.statSync(path.join(PUBLIC, "favicon.ico")).size / 1024
    ).toFixed(1)}kB`,
  );
}

console.log("done");
