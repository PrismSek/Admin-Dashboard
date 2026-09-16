import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/features/policies/relative-time";

const NOW = Date.parse("2026-09-15T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it("formats past timestamps in the Figma phrasing", () => {
    expect(formatRelativeTime(ago(25 * MINUTE), NOW)).toBe("25 minutes ago");
    expect(formatRelativeTime(ago(4 * HOUR), NOW)).toBe("4 hours ago");
    expect(formatRelativeTime(ago(1 * DAY), NOW)).toBe("1 day ago");
    expect(formatRelativeTime(ago(2 * DAY), NOW)).toBe("2 days ago");
    expect(formatRelativeTime(ago(21 * DAY), NOW)).toBe("3 weeks ago");
  });

  it("renders the placeholder for missing or unparseable input", () => {
    expect(formatRelativeTime(undefined, NOW)).toBe("—");
    expect(formatRelativeTime("not-a-date", NOW)).toBe("—");
  });
});
