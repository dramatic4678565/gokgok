import { deleteFolder, getFolder, updateFolder } from "@/lib/server/db";
import { fail, json, notFound, readJson } from "@/lib/server/http";

import type { NextRequest } from "next/server";

import type { FolderColor } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

/** `GET /api/folders/[id]` */
export function GET(_request: NextRequest, { params }: RouteContext) {
  const folder = getFolder(params.id);
  return folder ? json(folder) : notFound("Folder not found");
}

/** `PATCH /api/folders/[id]` — `{ name?, color? }` */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const body = await readJson<{ name?: string; color?: FolderColor }>(request);

  if (body === null) {
    return fail("Expected a JSON body", 400);
  }
  if (body.name === undefined && body.color === undefined) {
    return fail("Nothing to update", 400);
  }

  const folder = updateFolder(params.id, body);
  return folder ? json(folder) : notFound("Folder not found");
}

/** `DELETE /api/folders/[id]` — 204 on success. Contained boards are not
 *  deleted; they fall back to Uncategorized. The response body is therefore
 *  empty, so callers reconcile from the boards list. */
export function DELETE(_request: NextRequest, { params }: RouteContext) {
  return deleteFolder(params.id)
    ? new Response(null, { status: 204 })
    : notFound("Folder not found");
}
