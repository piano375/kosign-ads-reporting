import { z } from "zod";
import { EVENT_KEYS, extractEvent, type MetaEvent } from "@/lib/metrics/events";

const eventSchema = z.object({ action_type: z.string(), value: z.string() });

export const insightRowSchema = z.object({
  date_start: z.string(),
  date_stop: z.string(),
  spend: z.string(),
  impressions: z.string(),
  clicks: z.string(),
  actions: z.array(eventSchema).optional(),
  conversions: z.array(eventSchema).optional(),
});

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency: z.string(),
  timezone_name: z.string(),
});

export type DailyRow = {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number | null;
  qualifiedLeads: number | null;
  acceptances: number | null;
};

function numberOrZero(value: string) {
  if (!value.trim()) throw new Error("Meta Insights returned an invalid numeric field.");
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Meta Insights returned an invalid numeric field.");
  return parsed;
}

type EventMapping = { source: "actions" | "conversions"; actionType: string };

const mappings = {
  nativeLead: { source: "actions", actionType: EVENT_KEYS.lead },
  typeformSubmit: { source: "conversions", actionType: EVENT_KEYS.typeformSubmit },
  qualifiedLeads: { source: "conversions", actionType: EVENT_KEYS.qualifiedLead },
  acceptances: { source: "conversions", actionType: EVENT_KEYS.acceptance },
} satisfies Record<string, EventMapping>;

// The verified switch from Meta Instant Forms to the Typeform web flow.
// Do not add the two events: both can appear in Insights before the cutover.
const TYPEFORM_LEAD_CUTOVER = "2026-09-28";

function mappingFirstObserved(rows: Array<z.infer<typeof insightRowSchema>>, mapping: EventMapping) {
  return rows
    .filter((row) => row[mapping.source]?.some((event) => event.action_type === mapping.actionType))
    .map((row) => row.date_start)
    .sort()[0] ?? null;
}

function resolveSparseEvent(events: MetaEvent[] | undefined, mapping: EventMapping, rowDate: string, firstObservedDate: string | null) {
  const extracted = extractEvent(events, mapping.actionType, mapping.source);
  if (extracted.observed) return extracted.value;
  return firstObservedDate !== null && rowDate >= firstObservedDate ? 0 : null;
}

export function normalizeInsightRows(inputs: unknown[]): DailyRow[] {
  const rows = inputs.map((input) => insightRowSchema.parse(input));
  const firstObserved = {
    nativeLead: mappingFirstObserved(rows, mappings.nativeLead),
    typeformSubmit: mappingFirstObserved(rows, mappings.typeformSubmit),
    qualifiedLeads: mappingFirstObserved(rows, mappings.qualifiedLeads),
    acceptances: mappingFirstObserved(rows, mappings.acceptances),
  };

  return rows.map((row) => {
    const leads = row.date_start >= TYPEFORM_LEAD_CUTOVER
      ? resolveSparseEvent(row.conversions, mappings.typeformSubmit, row.date_start, firstObserved.typeformSubmit)
      : resolveSparseEvent(row.actions, mappings.nativeLead, row.date_start, firstObserved.nativeLead);
    return {
      date: row.date_start,
      spend: numberOrZero(row.spend),
      impressions: numberOrZero(row.impressions),
      clicks: numberOrZero(row.clicks),
      leads,
      qualifiedLeads: resolveSparseEvent(row.conversions, mappings.qualifiedLeads, row.date_start, firstObserved.qualifiedLeads),
      acceptances: resolveSparseEvent(row.conversions, mappings.acceptances, row.date_start, firstObserved.acceptances),
    };
  });
}

export function normalizeInsightRow(input: unknown): DailyRow {
  const row = normalizeInsightRows([input])[0];
  return {
    ...row,
  };
}
