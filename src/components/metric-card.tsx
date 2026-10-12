import { currency, count, percent } from "@/lib/metrics/format";
import type { MedianComparison } from "@/lib/dashboard/types";

export function MetricCard({ label, value, comparison, type = "count" }: { label: string; value: number | null; comparison: MedianComparison; type?: "currency" | "count" | "percent" }) {
  const formatter = type === "currency" ? currency : type === "percent" ? percent : count;
  const difference = comparison.percentFromMedian;
  const comparisonLabel = difference === null
    ? "1-year median unavailable"
    : Math.abs(difference) < 0.05
      ? "At 1-year median"
      : `${Math.abs(difference).toFixed(1)}% ${difference > 0 ? "over" : "under"} 1-year median`;
  return (
    <article className="metric-card">
      <h3>{label}</h3>
      <p>{formatter(value)}</p>
      {value === null && <span className="unavailable">Unavailable mapping</span>}
      <span className="median-comparison"><span aria-hidden="true">{difference === null || Math.abs(difference) < 0.05 ? "-" : difference > 0 ? "↑" : "↓"}</span> {comparisonLabel}</span>
    </article>
  );
}
