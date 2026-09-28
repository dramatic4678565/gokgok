# Mosaic branding

Everything about how Mosaic looks and identifies itself lives in one place, so that a change is a one-line edit rather than a hunt through the tree.

---

## The mark

A 2×2 grid of tiles in a single blue ramp.

A mosaic is small pieces assembled into one whole — which is exactly what a whiteboard does: many simple elements composed into a single picture. The four tones give the mark depth without needing a shadow or a gradient, and the shape stays legible at 16px, so the favicon and the app icon are the same artwork.

|           |           |           |           |
| --------- | --------- | --------- | --------- |
| hero      | mid       | light     | soft      |
| `#3977df` | `#5f96ea` | `#8fb4f2` | `#c7dbfb` |

The wordmark is drawn as SVG strokes rather than set in a font, so it renders identically on every platform and never needs a webfont. It inherits `currentColor`, so it follows the surrounding theme.

Assets live in [`branding/`](./branding) as sources, and are generated into [`public/`](./public) as the sizes the app actually uses.

---

## Changing the brand

1. Edit [`branding/mosaic-brand.json`](./branding/mosaic-brand.json).
2. Regenerate the images:

   ```powershell
   # one-off: install the rasteriser
   npm i -g @resvg/resvg-js-cli     # or: npm i @resvg/resvg-js
   node scripts/build-brand-assets.cjs
   ```

3. Bake the meta tags into `index.html`:

   ```powershell
   node scripts/sync-brand-into-html.cjs
   ```

4. Commit all of it.

`node scripts/sync-brand-into-html.cjs --check` fails if step 3 was forgotten, so it is safe to wire into CI.

### What still needs doing by hand

The JSON is the source of truth, but a few things cannot read it at runtime:

| Place | What to change |
| --- | --- |
| `.env.production`, `.env.development` | `VITE_APP_PLUS_APP`, backend and library URLs — these point at the upstream hosted services. Set them to your own. |
| `vercel.json` | Headers, host matchers and the VS Code redirect still reference the upstream domain. |
| `mosaic-app/index.html` | the `window.location.href` redirect inside the `<script>` block (premium auto-redirect) |
| `scripts/woff2/woff2-vite-plugins.js` | the font CDN the build falls back to |

---

## `SITE_URL` is a placeholder

`https://mosaic.app` is a stand-in. Replace it with your real domain before launch, or the canonical link, OG tags, sitemap and PWA manifest will all point somewhere you do not own.

---

## What deliberately did **not** get renamed

The rebrand changed everything that is our brand. It deliberately left alone everything that is a _contract with the outside world_, because renaming those silently breaks data that already exists.

| Kept as-is | Why |
| --- | --- |
| `.excalidraw` / `.excalidrawlib` files, `application/vnd.excalidraw+json` | a file format other tools read and write |
| `svg-source:excalidraw` in exported SVGs | the marker `exportToSvg` matches on when re-importing |
| `MIME_TYPES.excalidraw`, `EXPORT_DATA_TYPES.excalidraw` | the keys _are_ the file extensions |
| `localStorage` keys (`excalidraw-state`, `excalidraw-theme`, …) | renaming them orphans every returning user's saved work |
| i18n keys (`madeWithExcalidraw`, `excalidrawLib`, …) | 58 Crowdin files are keyed on them; only the translated _values_ are branded |
| CSS class names (`.excalidraw`, `.excalidraw-modal-container`, …) | a documented public styling API — a documented public styling API |
| `LICENSE` and copyright headers | they name the copyright holder, which we are not |
| `@excalidraw/eslint-config`, `@excalidraw/prettier-config`, `@excalidraw/mermaid-to-excalidraw`, `@excalidraw/random-username` | third-party packages that only exist on npm under those names |
| `excalidraw.com`, `github.com/excalidraw/excalidraw` | upstream URLs; still correct for attribution and for the sync |
| `Excalifont` | a font file, not a brand name |
| `CHANGELOG.md` | a historical record |

### Backwards compatibility

Two escape hatches exist so nothing downstream breaks on the rename:

- [`packages/mosaic/compatibility.ts`](./packages/mosaic/compatibility.ts) — `@mosaic/mosaic/compatibility` re-exports the old `Excalidraw*` names as deprecated aliases.
- The `window.EXCALIDRAW_*` globals are still read as a fallback wherever `window.MOSAIC_*` is undefined, so host pages written against the old bundle keep working.

The old names will not be carried forever. The point is a soft landing, not two APIs in perpetuity.

---

## Where the rebrand lives

The rename was applied by a script rather than by hand, so it can be re-applied and re-verified:

| Script | What it does |
| --- | --- |
| `scripts/rebrand.cjs` | applies the rename, protecting the contracts listed above |
| `scripts/rebrand.cjs --test` | 70+ self-tests asserting each protected string survives |
| `scripts/fix-rebrand-consistency.cjs` | repairs the handful of places a mechanical rename cannot get right on its own |
| `scripts/fix-test-fixture-text.cjs` | restores test fixture text whose measured width matters |
| `scripts/audit-leftovers.cjs` | lists every remaining `excalidraw` occurrence, to review by hand |

Always run the self-test before trusting a change to `rebrand.cjs`:

```powershell
node scripts/rebrand.cjs --test
```

If a future upstream merge brings new code in, the usual order is:

```powershell
node scripts/rebrand.cjs
node scripts/fix-rebrand-consistency.cjs
node scripts/fix-test-fixture-text.cjs
node scripts/sync-brand-into-html.cjs --check
yarn test:typecheck
npx vitest run --no-file-parallelism
```

The consistency scripts are idempotent, so re-running them is harmless.
