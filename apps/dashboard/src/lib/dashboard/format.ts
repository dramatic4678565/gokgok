import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isThisYear,
  isYesterday,
  startOfDay,
} from "date-fns";

/** "2 hours ago", "3 days ago" — used on cards, rows and the activity feed. */
export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) {
    return "Never";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

/** "14 Mar" or "14 Mar 2024" when the board is from a previous year. */
export function shortDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy");
}

/** "14:32" — used by the Recent page, where the date is already in the header. */
export function timeOfDay(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "HH:mm");
}

export type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

/** Bucket used by both the Recent page and the activity feed. */
export function dateGroup(value: string | Date): DateGroup {
  const date = typeof value === "string" ? new Date(value) : value;

  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (differenceInCalendarDays(startOfDay(new Date()), startOfDay(date)) < 7) {
    return "This Week";
  }
  return "Earlier";
}

export const DATE_GROUP_ORDER: readonly DateGroup[] = [
  "Today",
  "Yesterday",
  "This Week",
  "Earlier",
];

/** Groups records into the four buckets above, preserving input order within a
 *  bucket. Returns groups in chronological order, omitting empty ones. */
export function groupByDate<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
): Array<{ group: DateGroup; items: T[] }> {
  const buckets = new Map<DateGroup, T[]>();

  for (const item of items) {
    const value = getDate(item);
    if (!value) {
      continue;
    }
    const group = dateGroup(value);
    const list = buckets.get(group);
    if (list) {
      list.push(item);
    } else {
      buckets.set(group, [item]);
    }
  }

  return DATE_GROUP_ORDER.filter((group) => buckets.has(group)).map((group) => ({
    group,
    items: buckets.get(group) ?? [],
  }));
}

/** Whole days between a past timestamp and now — the trash retention countdown. */
export function daysUntil(from: string, now: number, total: number): number {
  const elapsed = differenceInCalendarDays(new Date(now), new Date(from));
  return Math.max(0, total - elapsed);
}
