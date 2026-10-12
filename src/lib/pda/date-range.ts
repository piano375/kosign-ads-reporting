const DAY = 86_400_000;
export const PDA_MAX_RANGE_DAYS = 90;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: string, amount: number) {
  return formatDate(new Date(new Date(`${date}T12:00:00Z`).getTime() + amount * DAY));
}

function isCalendarDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && formatDate(new Date(`${value}T12:00:00Z`)) === value;
}

export function resolvePdaDateRange(sinceInput: string | null, untilInput: string | null, accountToday: string) {
  if (!isCalendarDate(accountToday)) throw new Error("Account date must be a valid calendar date.");
  const latestCompleteDay = shiftDate(accountToday, -1);
  const since = sinceInput ?? shiftDate(latestCompleteDay, -27);
  const until = untilInput ?? latestCompleteDay;

  if (!isCalendarDate(since) || !isCalendarDate(until)) throw new Error("Use valid calendar dates.");
  if (since > until) throw new Error("Start date must be on or before end date.");
  if (until > latestCompleteDay) throw new Error("End date must be a complete account day.");
  const days = Math.round((new Date(`${until}T12:00:00Z`).getTime() - new Date(`${since}T12:00:00Z`).getTime()) / DAY) + 1;
  if (days > PDA_MAX_RANGE_DAYS) throw new Error(`PDA reporting is limited to ${PDA_MAX_RANGE_DAYS} days.`);
  return { since, until };
}
