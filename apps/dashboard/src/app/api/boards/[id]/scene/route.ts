import { getBoardScene, saveBoardScene } from "@/lib/server/db";
import { fail, json, notFound, readJson } from "@/lib/server/http";

import type { NextRequest } from "next/server";

import type { BoardScene } from "@/lib/server/templates";

export const dynamic = "force-dynamic";

/**
 * `GET /api/boards/[id]/scene` — the board's editor scene, consumed by
 * `/board/[id]`. Kept off the `Board` DTO so the boards contract stays
 * exactly as specified.
 */
export function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const scene = getBoardScene(params.id);
  return scene ? json(scene) : notFound("Board not found");
}

/** `PUT /api/boards/[id]/scene` */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const scene = await readJson<BoardScene>(request);

  if (scene === null || !Array.isArray(scene.elements)) {
    return fail("Expected a scene with an `elements` array", 400);
  }

  return saveBoardScene(params.id, scene)
    ? json({ saved: true })
    : notFound("Board not found");
}
