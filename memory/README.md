# Mosaic — agent memory

Notes for whoever works on this repo next, human or AI. The intent behind decisions is recorded here so it does not have to be reverse-engineered from the diff.

Read this before editing. Read [BRANDING.md](../BRANDING.md) before anything brand-related.

---

## The one thing to know

Mosaic is a **rebrand of excalidraw/excalidraw**, and upstream is merged in automatically every six hours. Most of this codebase is therefore not ours to reshape — it is upstream's, renamed. Anything that makes a future upstream merge conflict is a cost we pay repeatedly.

**Bias towards changes that are local, additive, and easy to undo.** Prefer wrapping upstream code in our own layer over editing its internals.

## Where the seam is

| Ours | Upstream's |
| --- | --- |
| `branding/`, `BRANDING.md` | `packages/mosaic/` (everything else) |
| `mosaic-app/brand.ts` | `mosaic-app/App.tsx`, `collab/`, `data/` |
| `mosaic-app/app_constants.ts` | `scripts/`, `packages/element` |
| `scripts/rebrand.cjs` + siblings | `packages/common`, `packages/math` |
| `mosaic-app/index.html` branding block | `dev-docs/` |

When you need upstream behaviour to differ, change it in the `mosaic-app` layer or in a package we already own, not inside the vendored library.

## What was renamed, and what deliberately was not

The rename was applied by script, not by hand, so it can be re-verified:

```bash
node scripts/rebrand.cjs --test    # 70+ assertions; run before trusting changes
```

**Do not "tidy up" the remaining `excalidraw` strings.** Most are load-bearing:

- `.excalidraw` / `.excalidrawlib` — a file format other tools read
- `application/vnd.excalidraw+json` — MIME type, appears in exported SVGs
- `svg-source:excalidraw` — the marker `exportToSvg` matches on re-import
- `MIME_TYPES.excalidraw`, `EXPORT_DATA_TYPES.excalidraw` — keys _are_ extensions
- `localStorage` keys (`excalidraw-state`, `excalidraw-theme`, …) — renaming orphans every returning user's saved work
- i18n keys (`madeWithExcalidraw`, `excalidrawLib`, …) — 58 Crowdin files are keyed on them; only translated _values_ are branded
- CSS class names (`.excalidraw`, `.excalidraw-modal-container`, …) — a documented public styling API
- `@excalidraw/eslint-config`, `@excalidraw/prettier-config`, `@excalidraw/mermaid-to-excalidraw`, `@excalidraw/random-username` — third party, only exist on npm under those names
- `LICENSE`, copyright headers, `Excalifont`, `CHANGELOG.md`

Full table with reasons: [BRANDING.md](../BRANDING.md).

## Feature flags: gate, do not delete

Upstream promo surfaces are hidden behind a flag rather than removed:

```ts
// packages/common/src/constants.ts
export const SHOW_UPSTREAM_PROMOS = false;
```

It lives in `@mosaic/common`, not in the app, because the surfaces span two packages. `mosaic-app/app_constants.ts` re-exports it:

```ts
import { SHOW_UPSTREAM_PROMOS } from "../app_constants"; // in mosaic-app
import { SHOW_UPSTREAM_PROMOS } from "@mosaic/common"; // in packages/mosaic
```

It gates the paid-workspace button and promo banner, the sidebar promo tabs, the main-menu items, the command palette links, the export dialog card and its overwrite confirmation, the welcome screen, the footer shield, the AI rate-limit upsell, the crash screen's bug-tracker paragraph, the help dialog header, the Brave error dialog, the library publish dialog, and the text-to-diagram chat's upgrade button. Full table: [BRANDING.md](../BRANDING.md).

**Why keep the code:** it comes back on the next upstream merge otherwise, as a conflict, and re-resolving that is more expensive than flipping a boolean. A fork that _does_ resell a hosted tier needs them.

If you add another such surface, gate it on this same flag -- and import it from `@mosaic/common` if the file is in `packages/mosaic`, so there is still exactly one definition.

## Gotchas that cost real time

- **`$ErrorActionPreference = 'Stop'` breaks native git commands in PowerShell.** Git writes progress to stderr, PowerShell turns that into a terminating `NativeCommandError`. `scripts/sync-upstream.ps1` relaxes it around the call. If you write more PowerShell tooling here, do the same.

- **Never bulk-replace a brand string with a plain search-and-replace.** That is how `@excalidraw/eslint-config` (a package that does not exist) and `https://excalidraw.com` (upstream's domain) get rewritten. Mask first, rename second, restore last. `scripts/rebrand.cjs` shows the pattern, and its self-test is the guard.

- **`rebrand.cjs` is NOT idempotent. Run it once, on a fresh upstream merge, never on a tree that has already been rebranded.** It is a plain string substitution, so it cannot tell "Excalidraw" meaning _our product_ from "Excalidraw" meaning _upstream, the project we forked from_ -- the difference is an explicit `PROTECT` allowlist, and that allowlist is not exhaustive. Re-running it over its own output corrupts the tree and still reports success. Observed damage: prose that means upstream was rewritten to mean us ("Excalidraw's Sentry org. That is other people's data store" -> "Mosaic's Sentry org. That is other people's data store"); the historical path literals in `check-stale-paths.cjs` were rewritten, silently disarming the stale-path check; the `MIME_TYPES.excalidraw` / `EXPORT_DATA_TYPES.excalidraw` / `VERSIONS.excalidraw` keys were renamed, which breaks every `.excalidraw` file lookup. The `fix-*` scripts _are_ idempotent; `rebrand.cjs` is not, and the difference matters. `check:brand` runs only the self-test, which passes in either case -- so it is not a guard against this.

- **The rebrand scripts must never rewrite themselves.** Their `PROTECT` list contains the literal strings they are protecting; a run that renames them turns the script into a no-op that looks like it worked. They are in the skip list. Keep it that way.

- **Rebranding test fixture text silently breaks text-measurement tests.** Several tests use the product name as sample text and assert on measured line breaks or element heights. `"Excalidraw"` → `"Mosaic"` is four characters narrower, so the assertions move. `scripts/fix-test-fixture-text.cjs` restores them. If you add a text-measurement test, do not brand its fixture string.

- **`test:update` on Windows corrupts snapshots.** The suite is flaky under parallel load, and a failing run writes a broken snapshot — it truncated `regressionTests` by 696 lines once. Update one file at a time, and check the diff afterwards. Prefer running the specific test file over the whole suite.

- **PowerShell mangling.** `$t.Replace("new", ...)` in a double-quoted PowerShell string will happily turn every `new` into `nei`, `window` into `iindoi`, and `throw` into `throi`. It happened, it broke four files at once. Use the edit tool for anything nontrivial, or a Node script.

## Verifying a change

```bash
yarn test:typecheck                        # must be 0 errors
yarn test:code && yarn test:other          # lint, both must be clean
npx vitest run --no-file-parallelism       # the suite; serial avoids the flakes
yarn build                                # must exit 0
```

Typecheck and lint are fast and catch most rebrand mistakes. The test suite takes ~15 minutes serially, so run it when you have touched fixtures, snapshots or anything that affects rendering.

## After an upstream merge

The workflow in `.github/workflows/sync-upstream.yml` does this automatically when the merge is clean. When it opens a conflict PR, work through it in this order:

```bash
git checkout upstream-sync
# resolve conflicts, preferring upstream's code shape but our renames
# NOTE: rebrand.cjs is not idempotent. It is correct here only because an
# upstream merge is what reintroduces "Excalidraw" in the first place.
node scripts/rebrand.cjs
node scripts/fix-rebrand-consistency.cjs
node scripts/fix-test-fixture-text.cjs
node scripts/sync-brand-into-html.cjs --check
yarn test:typecheck
npx vitest run --no-file-parallelism
```

The two `fix-*` scripts are idempotent — running them twice changes nothing. `rebrand.cjs` is not: run it exactly once per merge, before any local work is on top, and read the whole diff afterwards rather than trusting the exit code. See [MOSAIC-SYNC-GUIDE.md](../MOSAIC-SYNC-GUIDE.md) for the conflict-resolution workflow and `scripts/sync-upstream.ps1` for the local commands.

## Before launching

- `siteUrl` in `branding/mosaic-brand.json` is a **placeholder**. Set it to the real domain or the canonical link, OG tags, sitemap and manifest all point at a domain we do not own.
- `.env.production` still points at upstream's hosted backend, library service and Firebase project. Point them at your own.
- `vercel.json` headers and host matchers still reference upstream's domain.
