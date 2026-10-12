import { describe, expect, it } from "vitest";
import { suggestPdaReview } from "../../src/lib/pda/review";

describe("suggestPdaReview", () => {
  it("suggests the historical unaware industry-secret lane without approving the ad", () => {
    expect(suggestPdaReview("Music Industry Secret - Video")).toEqual({
      persona: "DIY Artist / Songwriter",
      desire: "Unlock Industry Secrets",
      awareness: "Unaware",
      confidence: "high",
      rationale: "Explicit industry-secret / unaware creative label",
    });
  });

  it("suggests the historical platform-royalties problem-unaware lane", () => {
    expect(suggestPdaReview("KOSIGN - Kato - Radio Royalties – Copy")).toMatchObject({
      persona: "DIY Artist / Songwriter",
      desire: "Collect Platform Royalties",
      awareness: "Problem Unaware",
      confidence: "medium",
    });
  });

  it("requires human review for a creator name without an explicit PDA lane", () => {
    expect(suggestPdaReview("KOSIGN - Mac Reel 001 v1 (No Watermark) – Copy")).toEqual({
      persona: null,
      desire: null,
      awareness: null,
      confidence: "needs-review",
      rationale: "No approved PDA signal in the ad name",
    });
  });
});
