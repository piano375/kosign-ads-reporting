import { z } from "zod";

export type Availability = "available" | "unavailable";
export type SourceStatus = "live" | "stale" | "notConfigured";

export type Totals = {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number | null;
  qualifiedLeads: number | null;
  acceptances: number | null;
};

export type DerivedMetrics = Totals & {
  costPerAcceptance: number | null;
  costPerApplication: number | null;
  costPerQualifiedLead: number | null;
  cpcAll: number | null;
  ctrAll: number | null;
  qualifiedLeadToAcceptanceRate: number | null;
  acceptanceToLeadRate: number | null;
};

export type Period = {
  start: string;
  end: string;
  label: string;
  note: string;
};

export type WeeklyPoint = DerivedMetrics & {
  start: string;
  end: string;
  label: string;
  maturity: "complete" | "provisional" | "unavailable";
};

export type SupportingMetricKey = "spend" | "qualifiedLeads" | "costPerQualifiedLead" | "leads" | "costPerApplication" | "cpcAll" | "ctrAll" | "qualifiedLeadToAcceptanceRate";

export type MedianComparison = {
  median: number | null;
  percentFromMedian: number | null;
};

export type DashboardPayload = {
  account: { name: string; id: string; currency: string; timezone: string };
  source: { meta: SourceStatus; funnel: "notConfigured"; note: string };
  refreshedAt: string;
  cutoff: string;
  hero: {
    period: Period;
    metrics: DerivedMetrics;
    previous: DerivedMetrics;
  };
  weekly: WeeklyPoint[];
  provisionalWeek: WeeklyPoint | null;
  supportingComparisons: Record<SupportingMetricKey, MedianComparison>;
  currentRatio: WeeklyPoint;
  medianAcceptanceToLeadRate: number | null;
};

export const dashboardPayloadSchema = z.object({
  account: z.object({ name: z.string(), id: z.string(), currency: z.string(), timezone: z.string() }),
  source: z.object({ meta: z.enum(["live", "stale", "notConfigured"]), funnel: z.literal("notConfigured"), note: z.string() }),
  refreshedAt: z.string(),
  cutoff: z.string(),
  hero: z.object({
    period: z.object({ start: z.string(), end: z.string(), label: z.string(), note: z.string() }),
    metrics: z.record(z.string(), z.number().nullable()),
    previous: z.record(z.string(), z.number().nullable()),
  }),
  weekly: z.array(z.record(z.string(), z.unknown())),
  provisionalWeek: z.record(z.string(), z.unknown()).nullable(),
  supportingComparisons: z.record(z.string(), z.object({ median: z.number().nullable(), percentFromMedian: z.number().nullable() })),
  currentRatio: z.record(z.string(), z.unknown()),
  medianAcceptanceToLeadRate: z.number().nullable(),
});
