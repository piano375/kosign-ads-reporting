import { describe, expect, it } from "vitest";
import { classifyPdaAd, summarizePdaAds } from "../../src/lib/pda/classify";

describe("classifyPdaAd", () => {
  it("maps an explicitly approved manager roster creative by immutable ID", () => {
    expect(classifyPdaAd({ id: "120241507273270621", name: "any renamed label" })).toMatchObject({
      persona: "Artist Manager",
      desire: "Grow Artist Roster / Revenue",
      awareness: "Problem Unaware",
      mapped: true,
    });
  });

  it("maps an explicitly approved songwriter creative by immutable ID", () => {
    expect(classifyPdaAd({ id: "120240047047070621", name: "any renamed label" })).toMatchObject({
      persona: "DIY Artist / Songwriter",
      desire: "Recover Missed Royalties",
      awareness: "Problem Unaware",
      mapped: true,
    });
  });

  it("promotes the user-approved suggested lanes by immutable ID", () => {
    expect(classifyPdaAd({ id: "120241247639360621", name: "Music Industry Secret" })).toMatchObject({ persona: "DIY Artist / Songwriter", desire: "Unlock Industry Secrets", awareness: "Unaware", mapped: true });
    expect(classifyPdaAd({ id: "120240542170700621", name: "Static26" })).toMatchObject({ persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Aware", mapped: true });
    expect(classifyPdaAd({ id: "120250124089230621", name: "Kobalt Admin" })).toMatchObject({ persona: "Artist Manager", desire: "Access Enterprise Infrastructure", awareness: "Solution Aware", mapped: true });
    expect(classifyPdaAd({ id: "120250120949980621", name: "Radio Royalties" })).toMatchObject({ persona: "DIY Artist / Songwriter", desire: "Collect Platform Royalties", awareness: "Problem Unaware", mapped: true });
  });

  it("keeps a descriptive near-match unmapped when its ID is not approved", () => {
    expect(classifyPdaAd({ id: "unapproved", name: "Songwriter ProblemAware Missed Royalties" })).toEqual({
      persona: "Unmapped",
      desire: "Unmapped",
      awareness: "Unmapped",
      mapped: false,
    });
  });
});

describe("summarizePdaAds", () => {
  it("sums raw inputs before calculating Cost per Acceptance for a PDA cell", () => {
    const summary = summarizePdaAds([
      { id: "1", name: "a", persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Unaware", mapped: true, spend: 100, leads: 10, qualifiedLeads: 2, acceptances: 1 },
      { id: "2", name: "b", persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Unaware", mapped: true, spend: 150, leads: 20, qualifiedLeads: 5, acceptances: 1 },
    ]);

    expect(summary).toEqual([{ persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Unaware", mapped: true, spend: 250, leads: 30, qualifiedLeads: 7, acceptances: 2, costPerAcceptance: 125, ads: 2 }]);
  });
});
