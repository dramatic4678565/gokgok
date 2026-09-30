import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  dateGroup,
  daysUntil,
  groupByDate,
  relativeTime,
  shortDate,
  timeOfDay,
} from "@/lib/dashboard/format";

/**
 * These helpers all read the real clock, so the clock is pinned. Without this
 * the suite rots silently: an assertion written against a hardcoded "now" keeps
 * passing on the day it was written and then fails two years later, or — worse —
 * fails immediately for anyone whose idea of "today" differs.
 */
const NOW = new Date("2024-06-15T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("relativeTime", () => {
  it("returns Never for a missing timestamp", () => {
    expect(relativeTime(null)).toBe("Never");
    expect(relativeTime(undefined)).toBe("Never");
    expect(relativeTime("")).toBe("Never");
  });

  it("describes a past timestamp with a suffix", () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
    // `formatDistanceToNowStrict` — no "about" hedge, unlike the non-strict
    // variant the editor uses elsewhere.
    expect(relativeTime(twoHoursAgo)).toBe("2 hours ago");
  });

  it("accepts an ISO string as well as a Date", () => {
    const iso = new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(iso)).toBe(relativeTime(new Date(iso)));
  });
});

describe("shortDate", () => {
  it("omits the year for the current year", () => {
    const thisYear = new Date(NOW.getFullYear(), 2, 14);
    expect(shortDate(thisYear)).toBe("14 Mar");
  });

  it("includes the year for an earlier year", () => {
    expect(shortDate(new Date(2020, 2, 14))).toBe("14 Mar 2020");
  });

  it("falls back to an em dash", () => {
    expect(shortDate(null)).toBe("—");
  });
});

describe("dateGroup", () => {
  const daysBeforeNow = (days: number) =>
    new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

  it("buckets today, yesterday, this week and earlier", () => {
    expect(dateGroup(NOW)).toBe("Today");
    expect(dateGroup(daysBeforeNow(1))).toBe("Yesterday");
    expect(dateGroup(daysBeforeNow(3))).toBe("This Week");
    expect(dateGroup(daysBeforeNow(30))).toBe("Earlier");
  });

  it("puts a date six days back in this week, not earlier", () => {
    expect(dateGroup(daysBeforeNow(6))).toBe("This Week");
  });
});

describe("groupByDate", () => {
  // `groupByDate` reads ISO strings because that is what the API returns; the
  // activity feed and the Recent page both hand it `createdAt` / `lastOpenedAt`.
  it("orders groups chronologically regardless of input order", () => {
    const rows = [
      { id: "old", at: new Date("2024-01-01T10:00:00Z").toISOString() },
      { id: "today", at: NOW.toISOString() },
      { id: "mid", at: new Date("2024-06-13T10:00:00Z").toISOString() },
    ];

    expect(groupByDate(rows, (row) => row.at).map((g) => g.group)).toEqual([
      "Today",
      "This Week",
      "Earlier",
    ]);
  });

  it("preserves input order within a group", () => {
    const rows = [
      { id: "a", at: new Date("2024-06-15T09:00:00Z").toISOString() },
      { id: "b", at: new Date("2024-06-15T08:00:00Z").toISOString() },
    ];

    expect(groupByDate(rows, (row) => row.at)[0].items.map((r) => r.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("skips rows with no date rather than bucketing them as Earlier", () => {
    const rows: Array<{ id: string; at: string | null }> = [
      { id: "no-date", at: null },
      { id: "today", at: NOW.toISOString() },
    ];

    const groups = groupByDate(rows, (row) => row.at);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
  });

  it("omits empty groups entirely", () => {
    const groups = groupByDate([{ at: NOW.toISOString() }], (row) => row.at);
    expect(groups.map((g) => g.group)).toEqual(["Today"]);
  });
});

describe("daysUntil", () => {
  it("counts whole days remaining and never goes negative", () => {
    const threeDaysAgo = new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntil(threeDaysAgo, NOW.getTime(), 30)).toBe(27);
  });

  it("clamps to zero once the window has passed", () => {
    const old = new Date(NOW.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntil(old, NOW.getTime(), 30)).toBe(0);
  });
});

describe("timeOfDay", () => {
  it("formats a 24-hour clock time", () => {
    const value = new Date(2024, 5, 15, 14, 32);
    expect(timeOfDay(value)).toBe("14:32");
  });
});
