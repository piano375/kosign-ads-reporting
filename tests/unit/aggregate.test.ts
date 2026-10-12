import { describe, expect, it } from "vitest";
import { aggregateRows } from "../../src/lib/metrics/aggregate";

describe("aggregateRows", () => {
  it("calculates ratios from aggregated numerators and denominators", () => {
    const metrics = aggregateRows([
      { date: "2026-08-10", spend: 100, impressions: 1000, clicks: 100, leads: 10, qualifiedLeads: 2, acceptances: 1 },
      { date: "2026-08-11", spend: 100, impressions: 100, clicks: 10, leads: 90, qualifiedLeads: 18, acceptances: 9 },
    ]);
    expect(metrics.costPerAcceptance).toBe(20);
    expect(metrics.ctrAll).toBeCloseTo(10);
    expect(metrics.acceptanceToLeadRate).toBe(10);
  });

  it("does not turn an absent event mapping into zero", () => {
    const metrics = aggregateRows([
      { date: "2026-08-10", spend: 100, impressions: 1000, clicks: 100, leads: 10, qualifiedLeads: 2, acceptances: 1 },
      { date: "2026-08-11", spend: 100, impressions: 1000, clicks: 100, leads: 10, qualifiedLeads: 2, acceptances: null },
    ]);
    expect(metrics.acceptances).toBeNull();
    expect(metrics.costPerAcceptance).toBeNull();
  });
});
