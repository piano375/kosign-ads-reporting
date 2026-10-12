export type PdaReviewSuggestion = {
  persona: string | null;
  desire: string | null;
  awareness: string | null;
  confidence: "high" | "medium" | "needs-review";
  rationale: string;
};

const NEEDS_REVIEW: PdaReviewSuggestion = {
  persona: null,
  desire: null,
  awareness: null,
  confidence: "needs-review",
  rationale: "No approved PDA signal in the ad name",
};

export function suggestPdaReview(name: string): PdaReviewSuggestion {
  const value = name.toLowerCase();
  if (value.includes("music industry secret")) {
    return { persona: "DIY Artist / Songwriter", desire: "Unlock Industry Secrets", awareness: "Unaware", confidence: "high", rationale: "Explicit industry-secret / unaware creative label" };
  }
  if (value.includes("radio royalties")) {
    return { persona: "DIY Artist / Songwriter", desire: "Collect Platform Royalties", awareness: "Problem Unaware", confidence: "medium", rationale: "Platform-specific royalty message; awareness needs creative review" };
  }
  if (value.includes("static26-aware") || value.includes("yourmusicglobalroyalties")) {
    return { persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Aware", confidence: "medium", rationale: "Explicit awareness/global-royalties label; confirm the intended persona" };
  }
  if (value.includes("catalog") && (value.includes("paid out") || value.includes("keep your roster"))) {
    return { persona: value.includes("roster") ? "Artist Manager" : "DIY Artist / Songwriter", desire: "Own & Protect Catalog", awareness: "Solution Aware", confidence: "medium", rationale: "Catalog ownership message; confirm awareness from the creative" };
  }
  if (value.includes("kobalt admin") || value.includes("same publishing tech") || value.includes("self-serve kobalt")) {
    return { persona: "Artist Manager", desire: "Access Enterprise Infrastructure", awareness: "Solution Aware", confidence: "medium", rationale: "Enterprise-infrastructure message; confirm manager versus songwriter audience" };
  }
  if (value.includes("1m streams") || value.includes("25k listeners") || value.includes("streams aren't") || value.includes("beyond the stream") || value.includes("pro isn't")) {
    return { persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Unaware", confidence: "medium", rationale: "Publishing-income gap message; confirm awareness from the creative" };
  }
  if (value.includes("registration") || value.includes("unclaimed royalties") || value.includes("found me") || value.includes("every cent counts")) {
    return { persona: "DIY Artist / Songwriter", desire: "Recover Missed Royalties", awareness: "Problem Unaware", confidence: "medium", rationale: "Uncollected-royalty / registration message; confirm intended persona and awareness" };
  }
  return NEEDS_REVIEW;
}
