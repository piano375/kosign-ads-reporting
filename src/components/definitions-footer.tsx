import type { DashboardPayload } from "@/lib/dashboard/types";

export function DefinitionsFooter({ payload }: { payload: DashboardPayload }) {
  return (
    <footer className="definitions">
      <div><strong>Definitions</strong><p>CPC and CTR use Meta all-clicks. Lead uses the native Meta <code>lead</code> action before Sep 28, 2026 and <code>TypeformSubmit</code> after the web-flow cutover; they are not summed. Acceptance equals the <code>application_staged</code> custom conversion. Qualified Lead equals the matching Meta custom conversion when observed.</p></div>
      <div><strong>Source and cutoff</strong><p>Meta impression-time reporting, account attribution setting, {payload.account.currency}, {payload.account.timezone}. Data through {payload.cutoff}. Funnel integration not configured.</p></div>
      <div><strong>Data maturity</strong><p>Acceptance is manually staged and can backfill 24 to 72 hours after a reporting window. Recent Acceptance count and CPA are provisional.</p></div>
    </footer>
  );
}
