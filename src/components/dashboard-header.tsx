import Image from "next/image";
import type { DashboardPayload } from "@/lib/dashboard/types";

export function DashboardHeader({ payload }: { payload: DashboardPayload }) {
  const refreshed = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: payload.account.timezone }).format(new Date(payload.refreshedAt));
  return (
    <header className="dashboard-header">
      <div className="dashboard-brand">
        <Image className="brand-logo" src="/kosign-logo-full-color.png" alt="KOSIGN" width={155} height={31} priority />
        <div>
          <p className="eyebrow">META PERFORMANCE</p>
          <h1>ADS REPORTING</h1>
        </div>
      </div>
      <div className="header-meta" aria-label="Report details">
        <span className="meta-pill">{payload.account.currency} / {payload.account.timezone.replace("_", " ")}</span>
        <span className="meta-pill">Through {payload.cutoff}</span>
        <span className="meta-pill">Refreshed {refreshed}</span>
      </div>
    </header>
  );
}
