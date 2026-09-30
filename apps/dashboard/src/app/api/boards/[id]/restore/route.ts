import { restoreBoard } from "@/lib/server/db";
import { json, notFound } from "@/lib/server/http";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** `POST /api/boards/[id]/restore` */
export function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const board = restoreBoard(params.id);
  return board ? json(board) : notFound("Board not found");
}
