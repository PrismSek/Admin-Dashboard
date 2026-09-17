/**
 * Format an ISO 8601 timestamp as a short relative phrase for the Policy
 * list's "Last change" column (e.g. "2 days ago", "4 hours ago") — the
 * gateway sends `updatedAt` as an absolute time, the Figma list draws it
 * relative. `numeric: "always"` keeps the Figma phrasing ("1 day ago", not
 * "yesterday"); an unparseable value renders as the same "—" placeholder the
 * empty cells use.
 */

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "always" });

const DIVISIONS: readonly { readonly amount: number; readonly unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Absent/blank timestamps and empty cells share this glyph-free placeholder. */
export const RELATIVE_TIME_PLACEHOLDER = "—";

export function formatRelativeTime(iso: string | undefined, now: number = Date.now()): string {
  if (!iso) return RELATIVE_TIME_PLACEHOLDER;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return RELATIVE_TIME_PLACEHOLDER;

  let duration = (then - now) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormat.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return RELATIVE_TIME_PLACEHOLDER;
}
