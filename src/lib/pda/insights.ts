import { z } from "zod";
import { EVENT_KEYS, extractEvent, type MetaEvent } from "@/lib/metrics/events";
import { classifyPdaAd, type PdaAd } from "@/lib/pda/classify";

const TYPEFORM_LEAD_CUTOVER = "2026-09-28";
const eventSchema = z.object({ action_type: z.string(), value: z.string() });
const pdaInsightSchema = z.object({
  date_start: z.string(),
  date_stop: z.string(),
  ad_id: z.string(),
  ad_name: z.string(),
  spend: z.string(),
  actions: z.array(eventSchema).optional(),
  conversions: z.array(eventSchema).optional(),
});

type ParsedRow = z.infer<typeof pdaInsightSchema>;

function numberOrZero(value: string) {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed)) throw new Error("Meta Insights returned an invalid PDA numeric field.");
  return parsed;
}

function isObserved(rows: ParsedRow[], source: "actions" | "conversions", actionType: string, predicate: (row: ParsedRow) => boolean) {
  return rows.some((row) => predicate(row) && row[source]?.some((event) => event.action_type === actionType));
}

function eventValue(events: MetaEvent[] | undefined, source: "actions" | "conversions", actionType: string, observedInRegime: boolean) {
  const extracted = extractEvent(events, actionType, source);
  return extracted.observed ? extracted.value : observedInRegime ? 0 : null;
}

function sumNullable(values: Array<number | null>) {
  if (values.some((value) => value === null)) return null;
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

export function toPdaAdRows(inputs: unknown[]): PdaAd[] {
  const rows = inputs.map((input) => pdaInsightSchema.parse(input));
  const preCutover = (row: ParsedRow) => row.date_start < TYPEFORM_LEAD_CUTOVER;
  const postCutover = (row: ParsedRow) => row.date_start >= TYPEFORM_LEAD_CUTOVER;
  const observed = {
    nativeLead: isObserved(rows, "actions", EVENT_KEYS.lead, preCutover),
    typeformSubmit: isObserved(rows, "conversions", EVENT_KEYS.typeformSubmit, postCutover),
    qualifiedLead: isObserved(rows, "conversions", EVENT_KEYS.qualifiedLead, () => true),
    acceptance: isObserved(rows, "conversions", EVENT_KEYS.acceptance, () => true),
  };
  const byAd = new Map<string, ParsedRow[]>();
  for (const row of rows) byAd.set(row.ad_id, [...(byAd.get(row.ad_id) ?? []), row]);

  return Array.from(byAd.entries()).map(([id, adRows]) => {
    const name = adRows[0]?.ad_name ?? "Unknown ad";
    const leads = sumNullable(adRows.map((row) => row.date_start < TYPEFORM_LEAD_CUTOVER
      ? eventValue(row.actions, "actions", EVENT_KEYS.lead, observed.nativeLead)
      : eventValue(row.conversions, "conversions", EVENT_KEYS.typeformSubmit, observed.typeformSubmit)));
    return {
      id,
      name,
      ...classifyPdaAd({ id, name }),
      spend: adRows.reduce((sum, row) => sum + numberOrZero(row.spend), 0),
      leads,
      qualifiedLeads: sumNullable(adRows.map((row) => eventValue(row.conversions, "conversions", EVENT_KEYS.qualifiedLead, observed.qualifiedLead))),
      acceptances: sumNullable(adRows.map((row) => eventValue(row.conversions, "conversions", EVENT_KEYS.acceptance, observed.acceptance))),
    };
  });
}
