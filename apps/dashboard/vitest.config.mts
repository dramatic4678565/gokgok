import { fileURLToPath } from "node:url";
import path from "node:path";

import { defineConfig } from "vitest/config";

/**
 * The dashboard's own vitest project.
 *
 * It is separate from the repository's root `vitest.config.mts` on purpose:
 * that one aliases the `@mosaic/*` packages and loads `setupTests.ts`, which
 * stubs the canvas and IndexedDB for the editor. None of that applies here, and
 * the root config's `include` would otherwise pick up these files and fail on
 * the missing `@/` alias.
 *
 * The root config excludes `apps/**` for the same reason.
 */
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: `${path.resolve(root, "src")}/` }],
  },
  test: {
    globals: true,
    // `node`, not `jsdom`: everything covered here is pure logic, and standing
    // up a DOM per test file costs about 30s each. A test that needs a DOM
    // should opt in with `// @vitest-environment jsdom` on the file.
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
