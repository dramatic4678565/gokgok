import { deleteBoardForever } from "@/lib/server/db";
import { notFound } from "@/lib/server/http";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** `DELETE /api/boards/[id]/permanent` — 204 on success. */
export function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return deleteBoardForever(params.id)
    ? new Response(null, { status: 204 })
    : notFound("Board not found");
}
