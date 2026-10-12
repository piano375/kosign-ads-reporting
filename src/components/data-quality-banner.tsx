import type { DashboardPayload } from "@/lib/dashboard/types";

export function DataQualityBanner({ payload }: { payload: DashboardPayload }) {
  const stale = payload.source.meta === "stale";
  return (
    <aside className={`quality-banner ${stale ? "is-stale" : ""}`} aria-live="polite">
      <strong className="quality-label">{stale ? "Stale data" : "Data quality note"}</strong>
      <div><span>{payload.source.note}</span><span className="quality-divider" aria-hidden="true">/</span><span>Acceptance staging may backfill for 24 to 72 hours.</span></div>
    </aside>
  );
}
