import { describe, expect, it } from "vitest";
import { normalizeInsightRows } from "../../src/lib/meta/insights";
import { aggregateRows } from "../../src/lib/metrics/aggregate";
import { EVENT_KEYS } from "../../src/lib/metrics/events";

const daily = [
  ["2026-08-13", "1504.95", "2"],
  ["2026-08-14", "1377.28", "1"],
  ["2026-08-15", "1447.94", "4"],
  ["2026-08-16", "1550.10", null],
  ["2026-08-17", "1627.82", "1"],
  ["2026-08-18", "1676.88", "7"],
  ["2026-08-19", "541.08", "6"],
] as const;

function rawRow(date: string, spend: string, acceptances: string | null) {
  return {
    date_start: date,
    date_stop: date,
    spend,
    impressions: "1000",
    clicks: "100",
    actions: [{ action_type: EVENT_KEYS.lead, value: "10" }],
    conversions: [
      { action_type: EVENT_KEYS.qualifiedLead, value: "5" },
      ...(acceptances === null ? [] : [{ action_type: EVENT_KEYS.acceptance, value: acceptances }]),
    ],
  };
}

function typeformRow(date: string, nativeLead: string, typeformSubmit: string) {
  return {
    ...rawRow(date, "100", "1"),
    actions: [{ action_type: EVENT_KEYS.lead, value: nativeLead }],
    conversions: [
      { action_type: EVENT_KEYS.typeformSubmit, value: typeformSubmit },
      { action_type: EVENT_KEYS.qualifiedLead, value: "1" },
      { action_type: EVENT_KEYS.acceptance, value: "1" },
    ],
  };
}

describe("normalizeInsightRows", () => {
  it("treats sparse daily omissions as zero after validating the mapping across the response", () => {
    const rows = normalizeInsightRows(daily.map(([date, spend, acceptances]) => rawRow(date, spend, acceptances)));
    const metrics = aggregateRows(rows);

    expect(rows[3].acceptances).toBe(0);
    expect(metrics.spend).toBeCloseTo(9726.05);
    expect(metrics.acceptances).toBe(21);
    expect(metrics.costPerAcceptance).toBeCloseTo(463.145238);
  });

  it("uses TypeformSubmit as Lead from the verified web-flow cutover without double counting native Leads", () => {
    const rows = normalizeInsightRows([
      typeformRow("2026-09-27", "10", "4"),
      typeformRow("2026-09-28", "8", "3"),
    ]);
    expect(rows.map((row) => row.leads)).toEqual([10, 3]);
  });

  it("keeps an event unavailable when its exact mapping is never observed", () => {
    const rows = normalizeInsightRows([rawRow("2026-08-16", "100", null)]);
    expect(rows[0].acceptances).toBeNull();
  });

  it("does not backfill zero before an event mapping is first observed", () => {
    const rows = normalizeInsightRows([
      rawRow("2026-08-12", "100", null),
      rawRow("2026-08-13", "100", "2"),
      rawRow("2026-08-14", "100", null),
    ]);
    expect(rows.map((row) => row.acceptances)).toEqual([null, 2, 0]);
  });
});
