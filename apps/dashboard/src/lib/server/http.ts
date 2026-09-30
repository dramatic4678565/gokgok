import { NextResponse } from "next/server";

/** Every board/folder/activity read is backed by the in-memory mock, which is
 *  process-local, so nothing here may be statically cached. */
export const NO_STORE = "no-store";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": NO_STORE, ...init?.headers },
  });
}

export function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: { "Cache-Control": NO_STORE } },
  );
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** `?favorite=true` / `?deleted=false` — absent means "not specified". */
export function readBoolean(value: string | null): boolean | undefined {
  if (value === null) {
    return undefined;
  }
  return value === "true" || value === "1";
}
