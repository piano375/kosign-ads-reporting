import { currency, count } from "@/lib/metrics/format";

type HeroKpiCardProps = {
  title: string;
  value: number | null;
  previous: number | null;
  period: string;
  kind: "currency" | "count";
  tone: "gradient" | "navy";
  lowerIsBetter?: boolean;
};

export function HeroKpiCard({ title, value, previous, period, kind, tone, lowerIsBetter }: HeroKpiCardProps) {
  const formatter = kind === "currency" ? currency : count;
  const change = value !== null && previous !== null && previous !== 0 ? ((value - previous) / previous) * 100 : null;
  const improved = change !== null && (lowerIsBetter ? change < 0 : change > 0);
  const direction = change === null ? "No prior comparison" : `${change >= 0 ? "Up" : "Down"} ${Math.abs(change).toFixed(1)}% vs prior 7 days`;
  return (
    <article className={`hero-card hero-card--${tone}`}>
      <div className="card-topline">
        <p className="hero-kpi-label">{title}</p>
        <span className="provisional" title="Acceptance staging can backfill for 24 to 72 hours.">Provisional</span>
      </div>
      <p className="hero-value">{formatter(value)}</p>
      <p className="period-label">{period}</p>
      <p className={`comparison ${improved ? "improved" : change === null ? "neutral" : "declined"}`}>
        <span aria-hidden="true">{change === null ? "-" : change >= 0 ? "↑" : "↓"}</span> {direction}
      </p>
      <p className="card-note">Manual Acceptance staging may mature after this reporting window.</p>
    </article>
  );
}
