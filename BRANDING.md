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

| Generated | What it is |
| --- | --- |
| `favicon.ico` | 16/24/32/48 PNG frames. Browsers ask for this first, so a stale one shows the old mark in the tab bar no matter what the other icons say. |
| `favicon.svg`, `favicon-{16,32,48}x48.png` | favicon variants |
| `maskable_icon_x{192,512}.png` | PWA maskable icons (full-bleed, inside the 80% safe zone) |
| `android-chrome-{192,512}x192.png`, `apple-touch-icon.png` | PWA / iOS home screen |
| `mosaic-mark.png`, `mosaic-logo.png` | mark and horizontal lockup, for README and docs |
| `og-image-3.png` | social card |
| `screenshots/*.png` | PWA store screenshots, generated as mockups so they can never go stale |
| `sidebar-*-promo-*.png` | artwork for the sidebar promo tabs, only rendered when `SHOW_UPSTREAM_PROMOS` is on |

---

## Changing the brand

1. Edit [`branding/mosaic-brand.json`](./branding/mosaic-brand.json).
2. Regenerate the images:

   ```bash
   yarn build:brand
   ```

   This uses `@resvg/resvg-js`, which is a devDependency, so it works in a fresh clone with no global installs.

3. Bake the meta tags into `index.html`:

   ```bash
   yarn sync:brand
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

## Hiding upstream promotions

Upstream ships a fair number of surfaces that advertise Excalidraw's own paid workspace, its own social and community accounts, and its own documentation. On a self-hosted Mosaic deployment they point users somewhere that has nothing to do with this product, so they are hidden behind a single flag rather than deleted:

```ts
// packages/common/src/constants.ts
export const SHOW_UPSTREAM_PROMOS = false;
```

It lives in `@mosaic/common` because the surfaces span two packages. `mosaic-app/app_constants.ts` re-exports it, so app code can keep importing it from there:

```ts
import { SHOW_UPSTREAM_PROMOS } from "../app_constants"; // in mosaic-app
import { SHOW_UPSTREAM_PROMOS } from "@mosaic/common"; // in packages/mosaic
```

It gates:

| Surface | File |
| --- | --- |
| "Mosaic+" button, top right; welcome-screen promo banner | `mosaic-app/App.tsx` |
| Sidebar promo tabs ("comments", "presentation") | `mosaic-app/components/AppSidebar.tsx` |
| "Mosaic+" promo banner (top right) | `mosaic-app/components/MosaicPlusPromoBanner.tsx` |
| "Mosaic+", "Sign up" menu items | `mosaic-app/components/AppMainMenu.tsx` |
| "GitHub", "Follow us", "Discord chat" | `packages/mosaic/components/main-menu/DefaultItems.tsx` (`UPSTREAM_SOCIALS`) |
| Command palette: GitHub / X / Discord / YouTube / "Mosaic+" / "Sign up" | `mosaic-app/App.tsx` |
| Export dialog "Export to Mosaic+" card, and its overwrite confirmation | `mosaic-app/App.tsx`, `mosaic-app/components/ExportToMosaicPlus.tsx` |
| Welcome screen "Sign up" link, and the signed-in "Did you want to go to Mosaic+ instead?" heading | `mosaic-app/components/AppWelcomeScreen.tsx` |
| Footer shield icon (links to an upstream blog post) | `mosaic-app/components/AppFooter.tsx` |
| AI rate-limit upsell line | `mosaic-app/components/AI.tsx` |
| Crash screen "bug tracker" paragraph | `mosaic-app/components/TopErrorBoundary.tsx` |
| Help dialog header: docs / blog / GitHub / YouTube | `packages/mosaic/components/HelpDialog.tsx` |
| Brave error dialog: FAQ, issue tracker, Discord | `packages/mosaic/components/BraveMeasureTextError.tsx` |
| Library publish dialog: library site, guidelines, licence | `packages/mosaic/components/PublishLibrary.tsx` |
| Text-to-diagram chat "upgrade" button | `packages/mosaic/components/TTDDialog/Chat/ChatMessage.tsx` |

**What is gated, and what is only branded.** The flag hides _links to a service that is not ours_. The product name "Mosaic+" is a plain rename and is not gated, because the strings are still in the translation files (46 Crowdin locales) and a fork that flips the flag needs one coherent name -- a menu that says "Mosaic+" and a dialog that says "Excalidraw+" would be a bug.

**Why gate instead of delete:** upstream is merged in every six hours, so a removed block comes back as a merge conflict. Re-resolving that is far more expensive than flipping a boolean, and a fork that _does_ resell a hosted tier needs these back. Enabling the flag also needs `VITE_APP_PLUS_LP` and `VITE_APP_PLUS_APP` pointed somewhere real first -- the URLs in the code still target upstream.

**Surrounding copy is kept, not deleted.** Where a gated link sat inside a sentence that was mostly still true -- the rate-limit message, the Brave explanation, the library publishing guidance -- only the link is removed. Dropping the whole paragraph would leave the user with no explanation of what went wrong or no warning about what they are agreeing to.

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

### `rebrand.cjs` is not safe to re-run on an already-rebranded tree

The rename is a plain string substitution, so it has no way to tell "Excalidraw" meaning _this product_ from "Excalidraw" meaning _upstream, the project we forked from_. Those two cases are handled by an explicit `PROTECT` allowlist, and that allowlist is not exhaustive. Running the script a second time over its own output therefore corrupts the tree, and it fails quietly -- it reports success either way. Observed damage:

- prose that deliberately refers to upstream was rewritten to refer to us, e.g. "Excalidraw's Sentry org. That is other people's data store" became "Mosaic's Sentry org. That is other people's data store", which is nonsense;
- the historical path literals in `scripts/check-stale-paths.cjs` were rewritten, turning `\bexcalidraw-app\b` into `\bmosaic-app\b` and silently disarming the check that is supposed to catch stale paths;
- test fixtures whose _measured pixel width_ is part of the assertion were reworded;
- the protected contract keys `MIME_TYPES.excalidraw`, `EXPORT_DATA_TYPES.excalidraw` and `VERSIONS.excalidraw` were renamed, which would break every `.excalidraw` file lookup.

So: **run it once, on a fresh upstream merge, before any of your own work is on top of it.** If you have to run it on a dirty tree, commit or stash first, and read the whole diff afterwards -- do not trust the exit code. `check:brand` runs only the self-test, which passes in either case.

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
