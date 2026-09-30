import type { BoardTemplateId } from "@/lib/types";

/**
 * Starter scenes for the create-board modal.
 *
 * These are plain JSON rather than `MosaicElement`s: the editor's `restore()`
 * pipeline fills in any missing defaults on load, and keeping the templates
 * free of `@mosaic/element` branded types means this module stays usable from
 * the mock API without a cast at every call site. The one cast lives in
 * `src/components/board/MosaicEditor.tsx`, at the import boundary.
 */

type TemplateElement = Record<string, unknown>;

export type BoardScene = {
  elements: readonly TemplateElement[];
  appState: {
    viewBackgroundColor: string;
    gridSize: null;
  };
  files: Record<string, never>;
};

const INK = "#1e1e1e";
const INDIGO = "#6366f1";
const BLUE = "#1d4ed8";
const GREEN = "#15803d";
const AMBER = "#b45309";
const PURPLE = "#7e22ce";
const RED = "#b91c1c";

let seedState = 1;

/** Deterministic pseudo-random integer, so a given template always looks the same. */
const nextSeed = () => {
  seedState = (seedState * 9301 + 49297) % 233280;
  return seedState;
};

const nextNonce = () => Math.floor(nextSeed() * 100000);

type BaseOverrides = Partial<TemplateElement> & { type: string };

const baseElement = ({
  type,
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  strokeColor = INK,
  backgroundColor = "transparent",
  roundness = null,
  ...rest
}: BaseOverrides): TemplateElement => ({
  id: crypto.randomUUID(),
  type,
  x,
  y,
  width,
  height,
  angle: 0,
  strokeColor,
  backgroundColor,
  fillStyle: "solid",
  strokeWidth: 2,
  strokeStyle: "solid",
  roundness,
  roughness: 1,
  opacity: 100,
  seed: nextSeed(),
  version: 1,
  versionNonce: nextNonce(),
  index: null,
  isDeleted: false,
  groupIds: [],
  frameId: null,
  boundElements: null,
  updated: Date.now(),
  created: Date.now(),
  link: null,
  locked: false,
  ...rest,
});

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: Partial<TemplateElement> = {},
) =>
  baseElement({
    type: "rectangle",
    x,
    y,
    width,
    height,
    roundness: { type: 3 },
    ...opts,
  });

const ellipse = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: Partial<TemplateElement> = {},
) => baseElement({ type: "ellipse", x, y, width, height, ...opts });

const diamond = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: Partial<TemplateElement> = {},
) => baseElement({ type: "diamond", x, y, width, height, ...opts });

const text = (
  x: number,
  y: number,
  value: string,
  opts: Partial<TemplateElement> = {},
) =>
  baseElement({
    type: "text",
    x,
    y,
    width: Math.max(24, value.length * 8),
    height: 22,
    fontSize: 16,
    fontFamily: 1,
    baseFontSize: null,
    text: value,
    originalText: value,
    textAlign: "left",
    verticalAlign: "top",
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
    strokeColor: INK,
    ...opts,
  });

const arrow = (
  x: number,
  y: number,
  dx: number,
  dy: number,
  opts: Partial<TemplateElement> = {},
) =>
  baseElement({
    type: "arrow",
    x,
    y,
    width: dx,
    height: dy,
    points: [
      [0, 0],
      [dx, dy],
    ],
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
    strokeColor: INK,
    ...opts,
  });

const emptyScene: BoardScene = {
  elements: [],
  appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  files: {},
};

const flowchart: BoardScene = {
  elements: [
    ellipse(-60, 0, 140, 60, { backgroundColor: "#e0e7ff" }),
    text(-34, 20, "Start"),
    arrow(10, 30, 60, 0),
    rect(70, 0, 140, 60, { backgroundColor: "#dbeafe" }),
    text(112, 20, "Step one"),
    arrow(140, 60, 0, 50),
    diamond(80, 110, 120, 80, { backgroundColor: "#fef3c7" }),
    text(103, 142, "Valid?"),
    arrow(80, 150, -60, 60),
    rect(-100, 210, 140, 60, { backgroundColor: "#fee2e2" }),
    text(-78, 230, "Retry"),
    arrow(200, 150, 60, 60),
    rect(260, 210, 140, 60, { backgroundColor: "#dcfce7" }),
    text(283, 230, "Ship it"),
  ],
  appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  files: {},
};

const wireframe: BoardScene = {
  elements: [
    rect(0, 0, 480, 320, { strokeColor: INK }),
    rect(0, 0, 480, 40, { backgroundColor: "#f5f5f5" }),
    ellipse(16, 14, 12, 12, { strokeColor: RED, backgroundColor: RED }),
    ellipse(34, 14, 12, 12, { strokeColor: AMBER, backgroundColor: AMBER }),
    ellipse(52, 14, 12, 12, { strokeColor: GREEN, backgroundColor: GREEN }),
    rect(24, 64, 200, 28, { backgroundColor: "#e5e5e5" }),
    rect(24, 104, 432, 8, { backgroundColor: "#e5e5e5", strokeWidth: 1 }),
    rect(24, 124, 400, 8, { backgroundColor: "#e5e5e5", strokeWidth: 1 }),
    rect(24, 144, 360, 8, { backgroundColor: "#e5e5e5", strokeWidth: 1 }),
    rect(24, 184, 200, 112, { backgroundColor: "#fafafa" }),
    rect(248, 184, 208, 112, { backgroundColor: "#fafafa" }),
    rect(24, 276, 120, 28, { backgroundColor: INDIGO, strokeColor: INDIGO }),
  ],
  appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  files: {},
};

const mindmap: BoardScene = {
  elements: [
    ellipse(-70, -30, 140, 60, { backgroundColor: "#e0e7ff" }),
    text(-42, -6, "Idea"),
    arrow(70, 0, 90, -90, { strokeColor: INDIGO }),
    arrow(70, 0, 90, 0, { strokeColor: BLUE }),
    arrow(70, 0, 90, 90, { strokeColor: GREEN }),
    ellipse(160, -150, 130, 60, { backgroundColor: "#ede9fe", strokeColor: PURPLE }),
    text(196, -126, "Research"),
    ellipse(160, -30, 130, 60, { backgroundColor: "#dbeafe", strokeColor: BLUE }),
    text(184, -6, "Build"),
    ellipse(160, 90, 130, 60, { backgroundColor: "#dcfce7", strokeColor: GREEN }),
    text(190, 114, "Launch"),
  ],
  appState: { viewBackgroundColor: "#ffffff", gridSize: null },
  files: {},
};

const SCENES: Record<BoardTemplateId, BoardScene> = {
  blank: emptyScene,
  flowchart,
  wireframe,
  mindmap,
};

export function getTemplateScene(template: BoardTemplateId): BoardScene {
  // The clone is what keeps the module-level `SCENES` templates pristine: the
  // editor mutates the scene it is handed, and two boards built from the same
  // template must not end up sharing element objects. Note it deliberately does
  // *not* reassign element ids — ids only have to be unique within a single
  // document, and two separate boards sharing them is harmless.
  return structuredClone(SCENES[template] ?? emptyScene);
}
