import { describe, expect, it } from "vitest";
import { EVENT_KEYS, extractEvent } from "../../src/lib/metrics/events";

describe("extractEvent", () => {
  it("keeps an observed zero distinct from an absent mapping", () => {
    expect(extractEvent([{ action_type: EVENT_KEYS.acceptance, value: "0" }], EVENT_KEYS.acceptance, "conversions")).toMatchObject({ value: 0, observed: true });
    expect(extractEvent([], EVENT_KEYS.acceptance, "conversions")).toMatchObject({ value: null, observed: false });
  });

  it("sums duplicate entries for the same action type", () => {
    expect(extractEvent([
      { action_type: EVENT_KEYS.acceptance, value: "2" },
      { action_type: EVENT_KEYS.acceptance, value: "3" },
    ], EVENT_KEYS.acceptance, "conversions")).toMatchObject({ value: 5, observed: true });
  });
});
