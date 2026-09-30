# Guidelines

- For new DOM/browser API usage, use `app.ownerDocument` and `app.ownerWindow` instead of globals; without `app`, derive them from the mounted node's `ownerDocument` and its `defaultView`.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@mosaic/common/utility-types` over `Omit<Base, keyof Overrides> & Overrides`.

## Upstream references

- Any UI that links to something we do not host — the paid workspace, upstream's social accounts, its docs, its issue tracker — goes behind `SHOW_UPSTREAM_PROMOS`. Gate it, do not delete it: upstream merges every six hours, so a deleted block returns as a conflict. In `mosaic-app` import it from `../app_constants`; in `packages/mosaic` import it from `@mosaic/common`, where it is defined. There is exactly one definition — do not add a second.
- Gate the _link_, not automatically the whole sentence. Where the link sat inside copy that was still true (rate limits, error explanations, publishing terms), keep the copy; otherwise the user is left with no explanation and no warning.
- Never run `scripts/rebrand.cjs` on an already-rebranded tree. It is a plain string substitution with an explicit protect list, it is not idempotent, and it reports success even when it corrupts things. See BRANDING.md.
- `BRANDING.md` is the source of truth for both of the above. Read it before changing anything user-visible that mentions upstream.
