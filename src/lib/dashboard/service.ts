import "server-only";

import { aggregateRows, deriveMetrics, median, toWeeklyPoint } from "@/lib/metrics/aggregate";
import { periodLabel } from "@/lib/metrics/format";
import { fetchMetaDailyInsights } from "@/lib/meta/client";
import { getServerConfig } from "@/lib/env";
import type { DailyRow } from "@/lib/meta/insights";
import type { DashboardPayload, DerivedMetrics, SupportingMetricKey, WeeklyPoint } from "@/lib/dashboard/types";

const DAY = 86_400_000;
let cached: { expiresAt: number; payload: DashboardPayload } | undefined;
let lastSuccess: DashboardPayload | undefined;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const shiftDay = (date: string, amount: number) => formatDate(new Date(new Date(`${date}T12:00:00Z`).getTime() + amount * DAY));

function accountDateNow() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const read = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function mondayOf(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  const offset = (value.getUTCDay() + 6) % 7;
  return shiftDay(date, -offset);
}

function dateRangeRows(rows: DailyRow[], start: string, end: string) {
  return rows.filter((row) => row.date >= start && row.date <= end);
}

function isCompleteRange(rows: DailyRow[], start: string, end: string) {
  const expectedDays = Math.round((new Date(`${end}T12:00:00Z`).getTime() - new Date(`${start}T12:00:00Z`).getTime()) / DAY) + 1;
  return rows.length === expectedDays && new Set(rows.map((row) => row.date)).size === expectedDays;
}

const supportingMetricKeys: SupportingMetricKey[] = ["spend", "qualifiedLeads", "costPerQualifiedLead", "leads", "costPerApplication", "cpcAll", "ctrAll", "qualifiedLeadToAcceptanceRate"];

function buildSupportingComparisons(current: DerivedMetrics, weeks: WeeklyPoint[]): DashboardPayload["supportingComparisons"] {
  return Object.fromEntries(supportingMetricKeys.map((key) => {
    const benchmark = median(weeks.map((week) => week[key]));
    const value = current[key];
    const percentFromMedian = value !== null && benchmark !== null && benchmark !== 0
      ? ((value - benchmark) / benchmark) * 100
      : null;
    return [key, { median: benchmark, percentFromMedian }];
  })) as DashboardPayload["supportingComparisons"];
}

function buildLivePayload(rows: DailyRow[]): DashboardPayload {
  const cutoff = shiftDay(accountDateNow(), -1);
  const start = shiftDay(cutoff, -6);
  const priorStart = shiftDay(start, -7);
  const priorEnd = shiftDay(start, -1);
  const latestSunday = shiftDay(cutoff, -((new Date(`${cutoff}T12:00:00Z`).getUTCDay() + 0) % 7));
  const weekly: WeeklyPoint[] = [];
  const trailingWeeks: WeeklyPoint[] = [];
  const trailingYearStart = shiftDay(cutoff, -364);

  for (let week = mondayOf(`${cutoff.slice(0, 4)}-01-01`); week <= latestSunday; week = shiftDay(week, 7)) {
    const end = shiftDay(week, 6);
    if (end > cutoff) continue;
    const weekRows = dateRangeRows(rows, week, end);
    if (isCompleteRange(weekRows, week, end)) weekly.push(toWeeklyPoint(week, end, weekRows, "complete"));
  }

  for (let week = mondayOf(trailingYearStart); week <= latestSunday; week = shiftDay(week, 7)) {
    const end = shiftDay(week, 6);
    if (week < trailingYearStart || end > cutoff) continue;
    const weekRows = dateRangeRows(rows, week, end);
    if (isCompleteRange(weekRows, week, end)) trailingWeeks.push(toWeeklyPoint(week, end, weekRows, "complete"));
  }

  const currentRows = dateRangeRows(rows, start, cutoff);
  const previousRows = dateRangeRows(rows, priorStart, priorEnd);
  if (!isCompleteRange(currentRows, start, cutoff) || !isCompleteRange(previousRows, priorStart, priorEnd)) {
    throw new Error("Meta did not return complete hero reporting windows.");
  }
  const metrics = aggregateRows(currentRows);
  const previous = aggregateRows(previousRows);
  const currentRatio = toWeeklyPoint(start, cutoff, currentRows, "provisional");
  const currentWeekStart = mondayOf(cutoff);
  const currentWeekRows = dateRangeRows(rows, currentWeekStart, cutoff);
  const currentWeekPoint = toWeeklyPoint(currentWeekStart, cutoff, currentWeekRows, "provisional");
  const provisionalWeek = new Date(`${cutoff}T12:00:00Z`).getUTCDay() === 0
    ? null
    : isCompleteRange(currentWeekRows, currentWeekStart, cutoff)
      ? { ...currentWeekPoint, label: `${currentWeekPoint.label} WTD` }
      : null;
  return {
    account: { name: "Kosign Music", id: "act_617887027795895", currency: "USD", timezone: "America/Los_Angeles" },
    source: { meta: "live", funnel: "notConfigured", note: "Meta is live. Funnel integration not configured." },
    refreshedAt: new Date().toISOString(),
    cutoff,
    hero: { period: { start, end: cutoff, label: `${periodLabel(start, cutoff)} | last 7 complete days`, note: "Acceptance staging can backfill for 24 to 72 hours." }, metrics, previous },
    weekly,
    provisionalWeek,
    supportingComparisons: buildSupportingComparisons(metrics, trailingWeeks),
    currentRatio,
    medianAcceptanceToLeadRate: median(weekly.map((point) => point.acceptanceToLeadRate)),
  };
}

type Fixture = [string, number, number, number, number, number, number];
const fixtureWeeks: Fixture[] = [
  ["2026-05-04", 9776, 793441, 16256, 1812, 75, 25], ["2026-05-11", 10199, 818511, 14769, 1742, 418, 14],
  ["2026-05-18", 11748, 1299536, 26895, 2676, 683, 15], ["2026-05-25", 11676, 1590393, 31716, 2936, 701, 25],
  ["2026-06-01", 16002, 2158350, 44569, 3929, 847, 32], ["2026-06-08", 12890, 1285552, 21770, 2310, 588, 19],
  ["2026-06-15", 11106, 933190, 17952, 1724, 433, 11], ["2026-06-22", 12174, 968421, 20118, 1866, 488, 21],
  ["2026-06-29", 13050, 1032925, 21805, 1970, 549, 31], ["2026-07-06", 11804, 902861, 19034, 1718, 451, 23],
  ["2026-07-13", 12642, 975550, 20433, 1817, 506, 20], ["2026-07-20", 13721, 1053708, 22410, 1969, 571, 16],
  ["2026-07-27", 14233, 1118690, 23492, 2116, 625, 26], ["2026-08-03", 15118, 1152944, 24131, 2207, 672, 29],
  ["2026-08-10", 14696, 1082701, 22617, 2084, 643, 24],
];

function fixturePoint([start, spend, impressions, clicks, leads, qualifiedLeads, acceptances]: Fixture): WeeklyPoint {
  const end = shiftDay(start, 6);
  return { ...deriveMetrics({ spend, impressions, clicks, leads, qualifiedLeads, acceptances }), start, end, label: periodLabel(start, start), maturity: "complete" };
}

function fallbackPayload(): DashboardPayload {
  const weekly = fixtureWeeks.map(fixturePoint);
  const metrics = deriveMetrics({ spend: 10618.57, impressions: 1237357, clicks: 19597, leads: 1442, qualifiedLeads: 360, acceptances: 21 });
  const previous = deriveMetrics({ spend: 10786.52, impressions: 1532040, clicks: 21078, leads: 1426, qualifiedLeads: 379, acceptances: 15 });
  const currentRatio: WeeklyPoint = { ...metrics, start: "2026-08-13", end: "2026-08-19", label: "Aug 13", maturity: "provisional" };
  const supportingComparisons = Object.fromEntries(supportingMetricKeys.map((key) => [key, { median: null, percentFromMedian: null }])) as DashboardPayload["supportingComparisons"];
  return {
    account: { name: "Kosign Music", id: "act_617887027795895", currency: "USD", timezone: "America/Los_Angeles" },
    source: { meta: "stale", funnel: "notConfigured", note: "Showing a sanitized last-known snapshot because Meta could not be reached. Funnel integration not configured." },
    refreshedAt: "2026-08-20T17:59:00.079Z",
    cutoff: "2026-08-19",
    hero: { period: { start: "2026-08-13", end: "2026-08-19", label: "Aug 13-19 | last 7 complete days", note: "Acceptance staging can backfill for 24 to 72 hours." }, metrics, previous },
    weekly,
    provisionalWeek: null,
    supportingComparisons,
    currentRatio,
    medianAcceptanceToLeadRate: median(weekly.map((point) => point.acceptanceToLeadRate)),
  };
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  if (cached && cached.expiresAt > Date.now()) return cached.payload;
  const cutoff = shiftDay(accountDateNow(), -1);
  const heroStart = shiftDay(cutoff, -6);
  const priorStart = shiftDay(heroStart, -7);
  const queryStart = shiftDay(cutoff, -364) < priorStart ? shiftDay(cutoff, -364) : priorStart;
  try {
    const rows = await fetchMetaDailyInsights(queryStart, cutoff);
    if (!rows.length) throw new Error("No daily rows");
    const payload = buildLivePayload(rows);
    lastSuccess = payload;
    cached = { expiresAt: Date.now() + getServerConfig().META_CACHE_TTL_SECONDS * 1000, payload };
    return payload;
  } catch {
    const payload = lastSuccess ? { ...lastSuccess, source: { ...lastSuccess.source, meta: "stale" as const, note: "Showing the last successful sanitized Meta payload." } } : fallbackPayload();
    cached = { expiresAt: Date.now() + 5 * 60 * 1000, payload };
    return payload;
  }
}
