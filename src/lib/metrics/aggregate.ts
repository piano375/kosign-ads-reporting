import type { DailyRow } from "@/lib/meta/insights";
import type { DerivedMetrics, Totals, WeeklyPoint } from "@/lib/dashboard/types";

// An omitted event mapping is unknown, not a zero-conversion day.
const sumKnown = (values: Array<number | null>) => values.every((value) => value !== null)
  ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  : null;

export function deriveMetrics(totals: Totals): DerivedMetrics {
  const { spend, impressions, clicks, leads, qualifiedLeads, acceptances } = totals;
  return {
    ...totals,
    costPerAcceptance: acceptances && acceptances > 0 ? spend / acceptances : null,
    costPerApplication: leads && leads > 0 ? spend / leads : null,
    costPerQualifiedLead: qualifiedLeads && qualifiedLeads > 0 ? spend / qualifiedLeads : null,
    cpcAll: clicks > 0 ? spend / clicks : null,
    ctrAll: impressions > 0 ? (clicks / impressions) * 100 : null,
    qualifiedLeadToAcceptanceRate: qualifiedLeads && qualifiedLeads > 0 && acceptances !== null ? (acceptances / qualifiedLeads) * 100 : null,
    acceptanceToLeadRate: leads && leads > 0 && acceptances !== null ? (acceptances / leads) * 100 : null,
  };
}

export function aggregateRows(rows: DailyRow[]): DerivedMetrics {
  return deriveMetrics({
    spend: rows.reduce((sum, row) => sum + row.spend, 0),
    impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
    clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    leads: sumKnown(rows.map((row) => row.leads)),
    qualifiedLeads: sumKnown(rows.map((row) => row.qualifiedLeads)),
    acceptances: sumKnown(rows.map((row) => row.acceptances)),
  });
}

export function median(values: Array<number | null>) {
  const sorted = values.filter((value): value is number => value !== null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function toWeeklyPoint(start: string, end: string, rows: DailyRow[], maturity: WeeklyPoint["maturity"]): WeeklyPoint {
  return {
    ...aggregateRows(rows),
    start,
    end,
    label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${start}T12:00:00Z`)),
    maturity,
  };
}
