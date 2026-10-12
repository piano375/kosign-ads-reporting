import "server-only";

export type FunnelStatus = "notConfigured" | "configured" | "unavailable" | "reconciling" | "ready";

// Funnel is intentionally separate from Meta. It is not queried until an approved mapping exists.
export function getFunnelStatus(): FunnelStatus {
  return "notConfigured";
}
