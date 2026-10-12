import { describe, expect, it } from "vitest";
import { toPdaAdRows } from "../../src/lib/pda/insights";
import { EVENT_KEYS } from "../../src/lib/metrics/events";

function rawAd(date: string, id: string, name: string, { nativeLead = "12", typeformSubmit, acceptances = "1" }: { nativeLead?: string; typeformSubmit?: string; acceptances?: string | null } = {}) {
  return {
    date_start: date,
    date_stop: date,
    ad_id: id,
    ad_name: name,
    spend: "100",
    impressions: "1000",
    clicks: "80",
    actions: [{ action_type: EVENT_KEYS.lead, value: nativeLead }],
    conversions: [
      ...(typeformSubmit === undefined ? [] : [{ action_type: EVENT_KEYS.typeformSubmit, value: typeformSubmit }]),
      { action_type: EVENT_KEYS.qualifiedLead, value: "4" },
      ...(acceptances === null ? [] : [{ action_type: EVENT_KEYS.acceptance, value: acceptances }]),
    ],
  };
}

describe("toPdaAdRows", () => {
  it("uses native Lead before the Typeform cutover", () => {
    const rows = toPdaAdRows([rawAd("2026-09-27", "unmapped", "Unclassified", { nativeLead: "12", typeformSubmit: "3" })]);
    expect(rows[0]).toMatchObject({ leads: 12, acceptances: 1 });
  });

  it("uses TypeformSubmit instead of native Lead from the Typeform cutover", () => {
    const rows = toPdaAdRows([rawAd("2026-09-28", "unmapped", "Unclassified", { nativeLead: "12", typeformSubmit: "3" })]);
    expect(rows[0]).toMatchObject({ leads: 3, acceptances: 1 });
  });

  it("does not treat a missing TypeformSubmit mapping as zero after the cutover", () => {
    const rows = toPdaAdRows([rawAd("2026-09-29", "unmapped", "Unclassified", { typeformSubmit: undefined })]);
    expect(rows[0]?.leads).toBeNull();
  });

  it("keeps an unmapped ad in the response when the business event is observed elsewhere", () => {
    const rows = toPdaAdRows([
      rawAd("2026-09-27", "120240047047070621", "Known songwriter", { acceptances: "2" }),
      rawAd("2026-09-27", "unmapped", "Unclassified", { acceptances: null }),
    ]);
    expect(rows[0]).toMatchObject({ mapped: true, acceptances: 2 });
    expect(rows[1]).toMatchObject({ mapped: false, acceptances: 0 });
  });

  it("treats a missing acceptance key as zero only once the key is observed in the same response", () => {
    const rows = toPdaAdRows([
      rawAd("2026-09-27", "120240047047070621", "Known songwriter", { acceptances: "2" }),
      rawAd("2026-09-27", "120241507273270621", "Known manager", { acceptances: null }),
    ]);
    expect(rows[1]?.acceptances).toBe(0);
  });
});
