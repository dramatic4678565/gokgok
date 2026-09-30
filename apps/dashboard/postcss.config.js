/**
 * CommonJS on purpose.
 *
 * Next 14.1's PostCSS config loader silently ignores an ESM `postcss.config.mjs`
 * — it registers no plugins, the `@tailwind` directives survive into the output
 * verbatim, the browser discards them as unknown at-rules, and the page renders
 * completely unstyled with no build error. `postcss.config.js` with
 * `module.exports` is the format this Next version actually picks up.
 *
 * Symptom to watch for if this ever regresses: a suspiciously small CSS bundle
 * (a few KB) instead of tens of KB.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
