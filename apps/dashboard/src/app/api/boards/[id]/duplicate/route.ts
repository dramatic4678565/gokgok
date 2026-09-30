import { duplicateBoard } from "@/lib/server/db";
import { json, notFound } from "@/lib/server/http";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** `POST /api/boards/[id]/duplicate` — additive: not part of the base
 *  contract, but the board menu's "Duplicate" action needs it. */
export function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const board = duplicateBoard(params.id);
  return board ? json(board, { status: 201 }) : notFound("Board not found");
}
