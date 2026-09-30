import { touchBoard } from "@/lib/server/db";
import { json, notFound } from "@/lib/server/http";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** `POST /api/boards/[id]/open` — records `lastOpenedAt`, which the "Last
 *  opened" sort and the Recent page both read. Additive to the contract. */
export function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const board = touchBoard(params.id);
  return board ? json(board) : notFound("Board not found");
}
