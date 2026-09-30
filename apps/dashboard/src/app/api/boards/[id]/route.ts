import { getBoard, softDeleteBoard, updateBoard } from "@/lib/server/db";
import { fail, json, notFound, readJson } from "@/lib/server/http";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

/** `GET /api/boards/[id]` */
export function GET(_request: NextRequest, { params }: RouteContext) {
  const board = getBoard(params.id);
  return board ? json(board) : notFound("Board not found");
}

/** `PATCH /api/boards/[id]` — `{ title?, isFavorite?, folderId? }` */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const body = await readJson<{
    title?: string;
    isFavorite?: boolean;
    folderId?: string | null;
  }>(request);

  if (body === null) {
    return fail("Expected a JSON body", 400);
  }
  if (
    body.title === undefined &&
    body.isFavorite === undefined &&
    body.folderId === undefined
  ) {
    return fail("Nothing to update", 400);
  }

  const board = updateBoard(params.id, body);
  return board ? json(board) : notFound("Board not found");
}

/** `DELETE /api/boards/[id]` — soft delete; the board moves to Trash. */
export function DELETE(_request: NextRequest, { params }: RouteContext) {
  const board = softDeleteBoard(params.id);
  return board ? json(board) : notFound("Board not found");
}
