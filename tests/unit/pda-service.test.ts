import { describe, expect, it } from "vitest";
import { resolvePdaDateRange } from "../../src/lib/pda/date-range";

describe("resolvePdaDateRange", () => {
  const accountToday = "2026-10-12";

  it("defaults to the last 28 complete account-timezone days", () => {
    expect(resolvePdaDateRange(null, null, accountToday)).toEqual({ since: "2026-09-14", until: "2026-10-11" });
  });

  it("rejects impossible calendar dates", () => {
    expect(() => resolvePdaDateRange("2026-02-30", "2026-03-01", accountToday)).toThrow("valid calendar dates");
  });

  it("rejects reversed or future reporting windows", () => {
    expect(() => resolvePdaDateRange("2026-10-11", "2026-10-10", accountToday)).toThrow("on or before");
    expect(() => resolvePdaDateRange("2026-10-11", "2026-10-12", accountToday)).toThrow("complete account day");
  });

  it("bounds ad-level queries to 90 days", () => {
    expect(() => resolvePdaDateRange("2026-07-01", "2026-10-11", accountToday)).toThrow("90 days");
  });
});
