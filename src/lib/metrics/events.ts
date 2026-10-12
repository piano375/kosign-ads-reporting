export const EVENT_KEYS = {
  acceptance: "offsite_conversion.fb_pixel_custom.application_staged",
  qualifiedLead: "offsite_conversion.fb_pixel_custom.Qualified Lead",
  lead: "lead",
  typeformSubmit: "offsite_conversion.fb_pixel_custom.TypeformSubmit",
} as const;

export type MetaEvent = { action_type: string; value: string };

export type ExtractedEvent = {
  value: number | null;
  observed: boolean;
  source: "actions" | "conversions";
  actionType: string;
};

export function extractEvent(events: MetaEvent[] | undefined, actionType: string, source: ExtractedEvent["source"]): ExtractedEvent {
  const matches = events?.filter((event) => event.action_type === actionType) ?? [];
  if (!matches.length) return { value: null, observed: false, source, actionType };

  const value = matches.reduce((sum, match) => {
    if (!match.value.trim()) throw new Error("Meta Insights returned an invalid event value.");
    const numericValue = Number(match.value);
    if (!Number.isFinite(numericValue)) throw new Error("Meta Insights returned an invalid event value.");
    return sum + numericValue;
  }, 0);

  return { value, observed: true, source, actionType };
}
