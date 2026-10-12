"use client";

import type { DashboardPayload } from "@/lib/dashboard/types";
import type { PdaPayload } from "@/lib/pda/service";
import { DashboardHeader } from "@/components/dashboard-header";
import { HeroKpiCard } from "@/components/hero-kpi-card";
import { MetricCard } from "@/components/metric-card";
import { DataQualityBanner } from "@/components/data-quality-banner";
import { WeeklyLineChart } from "@/components/weekly-line-chart";
import { AcceptanceLeadsRatioChart } from "@/components/acceptance-leads-ratio-chart";
import { DefinitionsFooter } from "@/components/definitions-footer";
import { PdaMatrix } from "@/components/pda-matrix";

export function Dashboard({ payload, pdaPayload }: { payload: DashboardPayload; pdaPayload: PdaPayload | null }) {
  const { metrics, previous } = payload.hero;
  return (
    <main className="page-shell">
      <DashboardHeader payload={payload} />
      <DataQualityBanner payload={payload} />

      <section className="hero-grid" aria-label="Primary reporting KPIs">
        <HeroKpiCard title="Cost per Acceptance" value={metrics.costPerAcceptance} previous={previous.costPerAcceptance} period={payload.hero.period.label} kind="currency" tone="gradient" lowerIsBetter />
        <HeroKpiCard title="Acceptances" value={metrics.acceptances} previous={previous.acceptances} period={payload.hero.period.label} kind="count" tone="navy" />
      </section>

      <section className="supporting-section" aria-labelledby="supporting-kpis">
        <div className="section-label"><p className="eyebrow">DELIVERY DIAGNOSTICS</p><h2 id="supporting-kpis">Supporting KPIs</h2></div>
        <div className="metric-grid">
          <MetricCard label="Spend" value={metrics.spend} comparison={payload.supportingComparisons.spend} type="currency" />
          <MetricCard label="Qualified Leads" value={metrics.qualifiedLeads} comparison={payload.supportingComparisons.qualifiedLeads} />
          <MetricCard label="Cost per Qualified Lead" value={metrics.costPerQualifiedLead} comparison={payload.supportingComparisons.costPerQualifiedLead} type="currency" />
          <MetricCard label="Leads" value={metrics.leads} comparison={payload.supportingComparisons.leads} />
          <MetricCard label="Cost per Lead" value={metrics.costPerApplication} comparison={payload.supportingComparisons.costPerApplication} type="currency" />
          <MetricCard label="CPC (all clicks)" value={metrics.cpcAll} comparison={payload.supportingComparisons.cpcAll} type="currency" />
          <MetricCard label="CTR (all clicks)" value={metrics.ctrAll} comparison={payload.supportingComparisons.ctrAll} type="percent" />
          <MetricCard label="Qualified Lead to Acceptance" value={metrics.qualifiedLeadToAcceptanceRate} comparison={payload.supportingComparisons.qualifiedLeadToAcceptanceRate} type="percent" />
        </div>
      </section>

      <section className="charts-section" aria-label="Weekly performance trends">
        <div className="section-label"><p className="eyebrow">WEEKLY PERFORMANCE</p><h2>Calendar Weeks + Current WTD</h2></div>
        <div className="chart-grid">
          <WeeklyLineChart points={payload.weekly} provisional={payload.provisionalWeek} metric="cpcAll" />
          <WeeklyLineChart points={payload.weekly} provisional={payload.provisionalWeek} metric="ctrAll" />
          <WeeklyLineChart points={payload.weekly} provisional={payload.provisionalWeek} metric="costPerApplication" />
          <WeeklyLineChart points={payload.weekly} provisional={payload.provisionalWeek} metric="costPerAcceptance" />
        </div>
      </section>

      <section className="ratio-section" aria-label="Funnel quality trend">
        <AcceptanceLeadsRatioChart points={payload.weekly} current={payload.currentRatio} median={payload.medianAcceptanceToLeadRate} />
      </section>
      <PdaMatrix initialPayload={pdaPayload} />
      <DefinitionsFooter payload={payload} />
    </main>
  );
}
