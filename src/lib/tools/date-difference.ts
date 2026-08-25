/**
 * Calendar difference between two dates.
 *
 * All math runs on UTC midnights so a difference never shifts with the user's
 * timezone, and every field is counted in whole units — "3 months and 2 days"
 * is what people mean, not 92.67 days.
 */

export type DateDifference = {
  /** Total whole days between the dates, always zero or positive. */
  totalDays: number;
  /** totalDays split into whole weeks + leftover days. */
  weeks: number;
  weekRemainderDays: number;
  /** Calendar breakdown: year/month/day units as a human would count them. */
  years: number;
  months: number;
  days: number;
  /** Monday–Friday days inside the inclusive range. */
  weekdays: number;
  /** Saturday/Sunday days inside the inclusive range. */
  weekendDays: number;
  /** False when the inputs were reversed, so the UI can say "backwards". */
  startBeforeEnd: boolean;
};

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses a `YYYY-MM-DD` string to a UTC midnight; throws with a UI-ready message. */
export function parseDateInput(value: string, field: string): Date {
  if (!ISO_DATE.test(value)) {
    throw new Error(`Enter the ${field} as a date (YYYY-MM-DD).`);
  }
  const [year, month, day] = value.split("-").map(Number);
  // JS Date parsing rolls impossible dates forward ("2026-02-30" becomes
  // March 2nd), so the calendar has to be checked explicitly.
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    throw new Error(`“${value}” is not a real calendar date.`);
  }
  return new Date(Date.UTC(year, month - 1, day));
}

function countWeekdays(start: Date, totalDays: number): { weekdays: number; weekendDays: number } {
  let weekdays = 0;
  let weekendDays = 0;
  let cursor = start.getUTCDay(); // 0 = Sunday
  for (let index = 0; index <= totalDays; index += 1) {
    if (cursor === 0 || cursor === 6) weekendDays += 1;
    else weekdays += 1;
    cursor = (cursor + 1) % 7;
  }
  return { weekdays, weekendDays };
}

export function diffDates(start: Date, end: Date): DateDifference {
  const startBeforeEnd = start.getTime() <= end.getTime();
  const [from, to] = startBeforeEnd ? [start, end] : [end, start];

  const totalDays = Math.round((to.getTime() - from.getTime()) / DAY_MS);

  // Calendar breakdown, borrowing from the previous month when days go
  // negative — the same subtraction-with-borrow people do by hand.
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();
  if (days < 0) {
    months -= 1;
    const previousMonthDays = new Date(
      Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0),
    ).getUTCDate();
    days += previousMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    totalDays,
    weeks: Math.floor(totalDays / 7),
    weekRemainderDays: totalDays % 7,
    years,
    months,
    days,
    ...countWeekdays(from, totalDays),
    startBeforeEnd,
  };
}
