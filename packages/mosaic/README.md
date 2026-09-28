# Mosaic

**Mosaic** is exported as a React component that you can embed directly in your app.

## Installation

Install the package together with its React peer dependencies.

```bash
npm install react react-dom @mosaic/mosaic
# or
yarn add react react-dom @mosaic/mosaic
```

> **Note**: If you want to try unreleased changes, use `@mosaic/mosaic@next`.

## Quick start

The minimum working setup has two easy-to-miss requirements:

1. Import the package CSS:

```ts
import "@mosaic/mosaic/index.css";
```

2. Render Mosaic inside a container with a non-zero height.

```tsx
import { Mosaic } from "@mosaic/mosaic";
import "@mosaic/mosaic/index.css";

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Mosaic />
    </div>
  );
}
```

Mosaic fills `100%` of the width and height of its parent. If the parent has no height, the canvas will not be visible.

## Next.js / SSR frameworks

Mosaic should be rendered on the client. In SSR frameworks such as Next.js, use a client component and load it dynamically with SSR disabled.

```tsx
// app/components/MosaicClient.tsx
"use client";

import { Mosaic } from "@mosaic/mosaic";
import "@mosaic/mosaic/index.css";

export default function MosaicClient() {
  return (
    <div style={{ height: "100vh" }}>
      <Mosaic />
    </div>
  );
}
```

```tsx
// app/page.tsx
import dynamic from "next/dynamic";

const MosaicClient = dynamic(() => import("./components/MosaicClient"), {
  ssr: false,
});

export default function Page() {
  return <MosaicClient />;
}
```

See the local examples for complete setups:

- [examples/with-nextjs](https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs)
- [examples/with-script-in-browser](https://github.com/excalidraw/excalidraw/tree/master/examples/with-script-in-browser)

## LLM / agent tips

If an LLM or coding agent is setting up Mosaic, these shortcuts usually save more time than re-prompting:

- Start with a plain `<Mosaic />` in a `100vh` container. Add refs, `initialData`, persistence, or custom UI only after the base embed works.
- If the canvas is blank, check the CSS import and parent height first. Those are the two most common integration failures.
- In Next.js or other SSR frameworks, assume client-only rendering first. Use `"use client"` and `dynamic(..., { ssr: false })` before debugging hydration or `window is not defined` errors.
- If imports or entrypoints are unclear, inspect `node_modules/@mosaic/mosaic/package.json`. The installed package exports are the source of truth.
- Do not set `window.EXCALIDRAW_ASSET_PATH` unless you are intentionally self-hosting fonts/assets.
- When docs and generated code drift, copy the nearest working example from this repo, especially `examples/with-nextjs` or `examples/with-script-in-browser`.

## Migrating to `@mosaic/mosaic@0.18.x`

Version `0.18.x` removes the old `types/`-prefixed deep import paths. If you were importing types from `@mosaic/mosaic/types/...`, switch to the new type-only subpaths below.

| Old path | New path |
| --- | --- |
| `@mosaic/mosaic/types/data/transform.js` | `@mosaic/mosaic/element/transform` |
| `@mosaic/mosaic/types/data/types.js` | `@mosaic/mosaic/data/types` |
| `@mosaic/mosaic/types/element/types.js` | `@mosaic/mosaic/element/types` |
| `@mosaic/mosaic/types/utility-types.js` | `@mosaic/mosaic/common/utility-types` |
| `@mosaic/mosaic/types/types.js` | `@mosaic/mosaic/types` |

Drop the `.js` extension. The new package `exports` map resolves these paths without it.

These deep subpaths are for `import type` only. Runtime imports should come from the package root, plus `@mosaic/mosaic/index.css` for styles.

For example:

```ts
import { exportToSvg } from "@mosaic/mosaic";
```

## Self-hosting fonts

By default, Mosaic downloads the fonts it needs from the [CDN](https://esm.run/@mosaic/mosaic/dist/prod).

For self-hosting, copy the contents of `node_modules/@mosaic/mosaic/dist/prod/fonts` into the path where your app serves static assets, for example `public/`. Then set `window.EXCALIDRAW_ASSET_PATH` to that same path:

```html
<script>
  window.EXCALIDRAW_ASSET_PATH = "/";
</script>
```

## Demo

Try the [CodeSandbox example](https://codesandbox.io/p/sandbox/github/excalidraw/excalidraw/tree/master/examples/with-script-in-browser).

## Integration

Read the [integration docs](https://docs.excalidraw.com/docs/@mosaic/mosaic/integration).

## API

Read the [API docs](https://docs.excalidraw.com/docs/@mosaic/mosaic/api).

## Contributing

Read the [contributing docs](https://docs.excalidraw.com/docs/@mosaic/mosaic/contributing).
