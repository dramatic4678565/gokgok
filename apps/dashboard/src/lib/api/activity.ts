import { apiFetch, apiUrl } from "./client";

import type { ActivityPage, ActivityQuery } from "@/lib/types";

export function fetchActivity(
  params: ActivityQuery = {},
  signal?: AbortSignal,
): Promise<ActivityPage> {
  return apiFetch<ActivityPage>(
    apiUrl("/api/activity", {
      ...(params.page ? { page: params.page } : {}),
      ...(params.type && params.type !== "all" ? { type: params.type } : {}),
      ...(params.pageSize ? { pageSize: params.pageSize } : {}),
    }),
    { signal },
  );
}
