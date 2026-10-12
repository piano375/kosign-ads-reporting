import "server-only";

import { fetchMetaAdInsights } from "@/lib/meta/client";
import { summarizePdaAds, type PdaAd, type PdaSummary } from "@/lib/pda/classify";
import { resolvePdaDateRange } from "@/lib/pda/date-range";
import { toPdaAdRows } from "@/lib/pda/insights";
import { suggestPdaReview, type PdaReviewSuggestion } from "@/lib/pda/review";

export type PdaPayload = {
  source: "live" | "stale";
  since: string;
  until: string;
  mappedAds: number;
  unmappedAds: number;
  segments: PdaSummary[];
  ads: PdaAd[];
  reviewSuggestions: Record<string, PdaReviewSuggestion>;
  note: string;
};

let cached: { expiresAt: number; payload: PdaPayload } | undefined;
let lastSuccess: PdaPayload | undefined;

function accountDateNow() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const read = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${read("year")}-${read("month")}-${read("day")}`;
}

export async function getPdaPayload(sinceInput: string | null, untilInput: string | null): Promise<PdaPayload> {
  const { since, until } = resolvePdaDateRange(sinceInput, untilInput, accountDateNow());
  const cacheKey = `${since}:${until}`;
  if (cached?.expiresAt && cached.payload.since === since && cached.payload.until === until && cached.expiresAt > Date.now()) return cached.payload;

  try {
    const ads = toPdaAdRows(await fetchMetaAdInsights(since, until));
    const reviewSuggestions = Object.fromEntries(ads.filter((ad) => !ad.mapped).map((ad) => [ad.id, suggestPdaReview(ad.name)]));
    const payload: PdaPayload = {
      source: "live",
      since,
      until,
      mappedAds: ads.filter((ad) => ad.mapped).length,
      unmappedAds: ads.filter((ad) => !ad.mapped).length,
      segments: summarizePdaAds(ads),
      ads,
      reviewSuggestions,
      note: "Meta Insights, impression-time. Acceptance is application_staged; Lead switches from native Lead to TypeformSubmit after the Sep 28 web-flow cutover. PDA classification uses an explicit approved-ad-ID map; all other ads remain Unmapped.",
    };
    lastSuccess = payload;
    cached = { expiresAt: Date.now() + 30 * 60_000, payload };
    return payload;
  } catch {
    if (lastSuccess && `${lastSuccess.since}:${lastSuccess.until}` === cacheKey) {
      return { ...lastSuccess, source: "stale", note: "Showing the last successful sanitized PDA snapshot because Meta could not be reached." };
    }
    throw new Error("PDA matrix data is temporarily unavailable.");
  }
}
