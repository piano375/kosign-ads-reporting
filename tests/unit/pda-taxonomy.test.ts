import { describe, expect, it } from "vitest";
import { PDA_AWARENESS, PDA_PERSONAS } from "../../src/lib/pda/taxonomy";

describe("PDA taxonomy", () => {
  it("uses the five awareness stages and four personas from the supplied coverage audit", () => {
    expect(PDA_AWARENESS).toEqual(["Unaware", "Problem Unaware", "Problem Aware", "Solution Aware", "Product Aware"]);
    expect(PDA_PERSONAS).toEqual(["DIY Artist / Songwriter", "Artist Manager", "Music Publisher", "Music Producer"]);
  });
});
