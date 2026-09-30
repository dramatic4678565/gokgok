import { createBoard, listBoards } from "@/lib/server/db";
import { fail, json, readBoolean, readJson } from "@/lib/server/http";

import type { NextRequest } from "next/server";

import type { BoardQuery, BoardTemplateId, SortBy } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORTS: readonly SortBy[] = ["modified", "name", "created", "opened"];

/** `GET /api/boards?folder=&favorite=&search=&sort=&deleted=` */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sortParam = params.get("sort") as SortBy | null;
  const folder = params.get("folder");
  const search = params.get("search");
  const favorite = readBoolean(params.get("favorite"));
  const deleted = readBoolean(params.get("deleted"));

  const query: BoardQuery = {
    ...(sortParam && SORTS.includes(sortParam) ? { sort: sortParam } : {}),
    ...(folder ? { folder } : {}),
    ...(search ? { search } : {}),
    ...(favorite !== undefined ? { favorite } : {}),
    ...(deleted !== undefined ? { deleted } : {}),
  };

  return json(listBoards(query));
}

/** `POST /api/boards` — `{ title }`, plus optional `folderId` and `template`. */
export async function POST(request: NextRequest) {
  const body = await readJson<{
    title?: string;
    folderId?: string | null;
    template?: BoardTemplateId;
  }>(request);

  if (body === null) {
    return fail("Expected a JSON body", 400);
  }

  return json(createBoard(body), { status: 201 });
}
