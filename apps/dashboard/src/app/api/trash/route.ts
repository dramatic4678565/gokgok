import { emptyTrash } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** `DELETE /api/trash` — permanently removes every soft-deleted board. */
export function DELETE() {
  return json({ deleted: emptyTrash() });
}
