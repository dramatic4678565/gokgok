/**
 * Feature flags for the dashboard.
 *
 * Mirrors the repository-wide rule: surfaces that point at something we do not
 * host are gated behind a flag rather than deleted, so an upstream-style block
 * can be re-enabled without being rewritten. `SHOW_UPSTREAM_PROMOS` is defined
 * once in `@mosaic/common` for the editor package; this dashboard keeps its own
 * copy because it has no dependency on the editor's build.
 */
export const showUpstreamPromos = false;
