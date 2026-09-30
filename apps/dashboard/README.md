# Mosaic dashboard

The Mosaic control centre: boards, folders, favorites, trash, activity and settings, plus the `/board/[id]` editor route that opens a board in the Mosaic canvas.

Next.js 14 (App Router) · TypeScript · Tailwind + shadcn/ui · Zustand · TanStack Query · NextAuth · dnd-kit · Framer Motion · sonner.

## Running it

From the repository root:

```bash
yarn install
yarn dev:dashboard      # http://localhost:3100
```

`dev` and `build` run `scripts/ensure-packages.mjs` first. The editor route imports `@mosaic/mosaic`, which the monorepo publishes as build artefacts, so on a fresh clone that script runs `yarn build:packages` once (a few minutes). After that it is a no-op and iteration is normal.

Sign in with any email — this build has no identity provider, so the credentials provider accepts anything well-formed. It exists so `useSession()` is real (it gates the routes and backs the UserMenu), not to model sign-up.

## Environment

See `.env.example`. Everything is optional for local development:

| Variable | Effect when unset |
| --- | --- |
| `NEXTAUTH_SECRET` | Falls back to a fixed development secret, with a warning printed at build and boot. **Set this before deploying** — NextAuth signs the session JWT with it. |
| `NEXTAUTH_URL` | Uses the incoming request's origin. |
| `NEXT_PUBLIC_API_BASE_URL` | Uses this app's own route handlers, i.e. the mock store. Point it at a real backend to swap the mock out. |

## Layout

```
src/
├── app/
│   ├── (dashboard)/        # the shell: Sidebar + Topbar + content
│   │   ├── page.tsx            Home — every board, with folders above
│   │   ├── favorites/ recent/ trash/ activity/ settings/
│   │   └── folders/[id]/       folder detail; the header is a drop target
│   ├── board/[id]/         the editor route
│   ├── login/              sign in
│   └── api/                the mock backend — the contract, implemented
├── components/
│   ├── board/MosaicEditor.tsx   the only file that imports @mosaic/mosaic
│   ├── dashboard/               everything under the shell
│   └── ui/                      shadcn/ui primitives, hand-written
└── lib/
    ├── api/                 one function per endpoint
    ├── hooks/               React Query hooks, optimistic updates
    ├── server/              in-memory store, seed data, scene templates
    ├── store/               Zustand store (persisted preferences)
    └── dashboard/           formatting, colours, dnd ids, query composition
```

## The data layer

There is no boards/folders backend in this repository, so `src/lib/server/db.ts` is an in-memory store seeded with 23 boards, 5 folders and a plausible activity history. State lives for the lifetime of the Node process, so a restart resets to the seed.

**The point is that the app never knows.** Every call goes through `src/lib/api/*` → `apiFetch`, and the shapes are the documented contract:

| Method | Endpoint | Body / query | Returns |
| --- | --- | --- | --- |
| GET | `/api/boards` | `?folder=&favorite=&search=&sort=&deleted=` | `Board[]` |
| POST | `/api/boards` | `{ title, folderId?, template? }` | `Board` |
| PATCH | `/api/boards/[id]` | `{ title?, isFavorite?, folderId? }` | `Board` |
| DELETE | `/api/boards/[id]` | — | `Board` (soft delete) |
| POST | `/api/boards/[id]/restore` | — | `Board` |
| DELETE | `/api/boards/[id]/permanent` | — | 204 |
| GET | `/api/folders` | — | `Folder[]` |
| POST | `/api/folders` | `{ name, color }` | `Folder` |
| PATCH | `/api/folders/[id]` | `{ name?, color? }` | `Folder` |
| DELETE | `/api/folders/[id]` | — | 204 |
| GET | `/api/activity` | `?page=&type=&pageSize=` | `ActivityPage` |

Four endpoints are additive, because the UI needs them and the base contract does not cover them: `POST /api/boards/[id]/duplicate`, `POST /api/boards/[id]/open` (records `lastOpenedAt`, which "Last opened" and Recent both read), `GET|PUT /api/boards/[id]/scene` (the editor's scene, kept off the `Board` DTO) and `DELETE /api/trash` (bulk purge).

To point this at a real backend, set `NEXT_PUBLIC_API_BASE_URL` to its origin. That is the whole change: the route handlers become unused, and nothing in `components/` or `lib/hooks/` moves.

### Two filters are client-side

`favorites` is a server-side filter because it is in the contract. `recent` (opened in the last seven days) and `shared` have no server-side counterpart, so `useBoardCollection` applies them to the returned rows. All four chips are composed in one place — `src/lib/dashboard/queries.ts` — so the chips and the request cannot drift apart.

`Board.isShared` is declared **optional** for the same reason: the dashboard needs it, but a backend that omits it still typechecks against `Board`.

## Optimistic updates

`src/lib/hooks/useBoards.ts` and `useFolders.ts` update every cached list optimistically and roll back on error. Note `updateBoardCaches`: it matches on the `["boards"]` prefix via `setQueriesData`, not `setQueryData(["boards"])`. The naive version only fixes the unfiltered list, so starring a board on Home would leave the sidebar badge and any open folder page stale.

## Keyboard

| Key            | Action                        |
| -------------- | ----------------------------- |
| `Cmd/Ctrl + K` | Command palette               |
| `N`            | New board                     |
| `F`            | New folder                    |
| `/`            | Focus search                  |
| `Esc`          | Close the open dialog (Radix) |

Letter shortcuts are suppressed while you are typing in a field.

## Verifying

```bash
yarn test:typecheck:dashboard   # tsc, 0 errors
yarn lint:dashboard             # eslint, 0 warnings
yarn --cwd apps/dashboard test  # vitest, 50 tests
yarn build:dashboard            # next build, then the CSS guard
```

`build` runs three steps: `ensure-packages` (builds the editor packages if missing), `next build`, then `check:css`.

### The CSS guard

`check:css` exists because a silent Tailwind failure shipped once already. An ESM `postcss.config.mjs` is ignored by Next 14 with no warning, so no plugin was registered, the `@tailwind` directives survived into the output verbatim, the browser discarded them, and **the entire app rendered unstyled** — while `tsc`, `eslint`, `next build` and every HTTP request all passed.

So the guard asserts on the artefact instead of trusting the build to complain: it fails if any bundle still contains raw `@tailwind` directives, or if the total CSS is under 40 KB. Current output is ~230 KB. Keep `postcss.config.js` as CommonJS; the file explains why.

## Tests

50 tests over the parts where a silent regression is cheapest:

| File | Covers |
| --- | --- |
| `src/lib/dashboard/format.test.ts` | `relativeTime`, `shortDate`, `dateGroup`, `groupByDate`, `daysUntil`, `timeOfDay` — with the clock pinned via fake timers, so an assertion written today does not rot next year |
| `src/lib/dashboard/dnd.test.ts` | drag-id round-trips, and that the `board:`/`folder:` namespaces cannot be confused during a drop |
| `src/lib/server/db.test.ts` | board filters and sorts, the soft/restore/permanent delete lifecycle, folder-delete cascading to Uncategorized with a count, activity pagination and filtering, and that the `Board` DTO never leaks `scene`/`deletedAt` |

The store is a module-level singleton so it survives dev hot reloads, which means tests need a reset seam: `resetStore({ seed: false })` gives a genuinely empty store (`resetStore()` restores the fixtures).

Tests run under `environment: "node"` — it is all pure logic, and a DOM per file costs ~30s each. A test that needs one should opt in with `// @vitest-environment jsdom` on the file.

The repository's root vitest config excludes `apps/**`, so `yarn test:app` still only covers `packages/` and `mosaic-app/`.

## Known gaps

- **No component tests.** Logic and the mock store are covered; the React components are not. A jsdom setup plus a couple of render tests for `BoardCard` and `CommandPalette` are the obvious next step.
- **The editor writes to the mock store.** The `/board/[id]` route autosaves through `PUT /api/boards/[id]/scene` on a 1.5s debounce. Against a real backend that endpoint needs replacing with whatever persistence it uses.
- **The scene templates are plain JSON**, cast once at the import boundary in `MosaicEditor.tsx`. The editor's `restore()` fills in missing defaults, but they are not typed as `MosaicElement` and so are not checked against the element schema.
- **Board thumbnails are generated.** `Board.thumbnail` is `null` everywhere in the seed, so cards render a deterministic gradient. Nothing generates real thumbnails from a scene yet.
