import { ACTIVITY_PAGE_SIZE, listActivity } from "@/lib/server/db";
import { json } from "@/lib/server/http";

import type { NextRequest } from "next/server";

import type { ActivityType } from "@/lib/types";

export const dynamic = "force-dynamic";

const ACTIVITY_TYPES: readonly ActivityType[] = [
  "created",
  "renamed",
  "deleted",
  "opened",
  "favorited",
  "moved",
];

/** `GET /api/activity?page=&type=` */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(
    params.get("pageSize") ?? String(ACTIVITY_PAGE_SIZE),
    10,
  );
  const typeParam = params.get("type") as ActivityType | null;

  return json(
    listActivity({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : ACTIVITY_PAGE_SIZE,
      ...(typeParam && ACTIVITY_TYPES.includes(typeParam) ? { type: typeParam } : {}),
    }),
  );
}
