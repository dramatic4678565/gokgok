/**
 * Reverts rebranded *test fixture strings* back to their original text.
 *
 * A number of tests use the product name as sample text and then assert on
 * measured line breaks, glyph offsets or element heights. Those assertions are
 * tied to the exact width of the original word, so shortening the word from
 * "Excalidraw" to "Mosaic" silently breaks them.
 *
 * Test *identifiers* (imports, types, component names) stay rebranded -- only
 * the literal text payloads are restored.
 *
 * Run: node scripts/fix-test-fixture-text.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

/** Literal payloads that must keep their original width. */
const PAYLOADS = [
  // textWrapping asserts exact glyph offsets for a single long token
  ['"Mosaic", font, 50', '"Excalidraw", font, 50'],
  ['Length of "Mosaic" is 100', 'Length of "Excalidraw" is 100'],
  ['let text = "Mosaic is a virtual collaborative whiteboard"',
   'let text = "Excalidraw is a virtual collaborative whiteboard"'],
  // parseTokens compares the tokenised result against a literal list, so the
  // expected tokens have to be restored alongside the input string.
  ['expect(parseTokens(text)).toEqual([\n        "Mosaic",',
   'expect(parseTokens(text)).toEqual([\n        "Excalidraw",'],

  // resize.test measures wrapped heights against hard-coded numbers
  ['"Mosaic\\nEditor"', '"Excalidraw\\nEditor"'],

  // bound-text fixtures whose container width drives the assertions
  ['text: "Hello Mosaic"', 'text: "Hello Excalidraw"'],

  // clipboard bound-text fixtures: the line breaks are hard-coded, so the
  // width of the first line drives the asserted container height.
  [
    '"Mosaic is a\\nvirtual \\nopensource \\nwhiteboard for \\nsketching \\nhand-drawn like\\ndiagrams"',
    '"Excalidraw is a\\nvirtual \\nopensource \\nwhiteboard for \\nsketching \\nhand-drawn like\\ndiagrams"',
  ],
  [
    '"Mosaic is a virtual opensource whiteboard for sketching hand-drawn like diagrams"',
    '"Excalidraw is a virtual opensource whiteboard for sketching hand-drawn like diagrams"',
  ],

  // textWysiwyg wrapping / viewport-clipping fixtures
  ['"Mosaic\\neditor\\nis great!"', '"Excalidraw\\neditor\\nis great!"'],
  ['"Mosaic is an opensource virtual collaborative whiteboard for sketching hand-drawn like diagrams!"',
   '"Excalidraw is an opensource virtual collaborative whiteboard for sketching hand-drawn like diagrams!"'],
  ['"Mosaic is an opensource virtual collaborative whiteboard"',
   '"Excalidraw is an opensource virtual collaborative whiteboard"'],
  ['text: "Mosaic is an opensource virtual collaborative whiteboard"',
   'text: "Excalidraw is an opensource virtual collaborative whiteboard"'],
  ['updateTextEditor(editor, "Mosaic")', 'updateTextEditor(editor, "Excalidraw")'],
  ['expect(text.text).toBe("Mosaic")', 'expect(text.text).toBe("Excalidraw")'],
];

const FILES = [
  "packages/element/tests/textWrapping.test.ts",
  "packages/element/tests/resize.test.tsx",
  "packages/element/tests/linearElementEditor.test.tsx",
  "packages/mosaic/wysiwyg/textWysiwyg.test.tsx",
  "packages/mosaic/tests/clipboard.test.tsx",
  "packages/element/tests/collision.test.tsx",
  "packages/element/tests/flip.test.tsx",
];

let total = 0;
for (const rel of FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.log(`  skip  ${rel}`);
    continue;
  }
  let text = fs.readFileSync(abs, "utf8");
  const before = text;
  for (const [from, to] of PAYLOADS) {
    text = text.split(from).join(to);
  }
  if (text !== before) {
    fs.writeFileSync(abs, text, "utf8");
    const n = before.split(/\n/).length;
    console.log(`  fix   ${rel}`);
    total++;
  }
}
console.log(total ? `\nreverted fixture text in ${total} files` : "\nnothing to do");
