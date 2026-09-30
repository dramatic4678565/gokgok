import { createFolder, listFolders } from "@/lib/server/db";
import { fail, json, readJson } from "@/lib/server/http";

import type { NextRequest } from "next/server";

import type { FolderColor } from "@/lib/types";

export const dynamic = "force-dynamic";

/** `GET /api/folders` */
export function GET() {
  return json(listFolders());
}

/** `POST /api/folders` — `{ name, color }` */
export async function POST(request: NextRequest) {
  const body = await readJson<{ name?: string; color?: FolderColor }>(request);

  if (body === null) {
    return fail("Expected a JSON body", 400);
  }
  if (!body.name?.trim()) {
    return fail("A folder name is required", 400);
  }

  return json(createFolder(body), { status: 201 });
}
