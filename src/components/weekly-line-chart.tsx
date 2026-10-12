"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { WeeklyPoint } from "@/lib/dashboard/types";
import { ChartCard } from "@/components/chart-card";
import { currency, percent } from "@/lib/metrics/format";

type MetricKey = "cpcAll" | "ctrAll" | "costPerApplication" | "costPerAcceptance";

const labels: Record<MetricKey, string> = {
  cpcAll: "CPC (all clicks)",
  ctrAll: "CTR (all clicks)",
  costPerApplication: "Cost per Lead",
  costPerAcceptance: "Cost per Acceptance",
};

export function WeeklyLineChart({ points, provisional, metric }: { points: WeeklyPoint[]; provisional: WeeklyPoint | null; metric: MetricKey }) {
  const isPercent = metric === "ctrAll";
  const year = points.at(-1)?.end.slice(0, 4) ?? provisional?.end.slice(0, 4) ?? "YTD";
  const format = (value: number | null) => isPercent ? percent(value) : currency(value);
  const data = [
    ...points.map((point) => ({ ...point, matureValue: point[metric], provisionalValue: null })),
    ...(provisional ? [{ ...provisional, matureValue: null, provisionalValue: provisional[metric] }] : []),
  ];
  const tablePoints = provisional ? [...points, provisional] : points;
  const summary = `${labels[metric]} uses complete Monday-Sunday periods plus a separately marked provisional current week. Values are calculated from period totals, not averaged daily ratios.`;

  return (
    <ChartCard title={labels[metric]} subtitle={`Complete weeks + provisional WTD | ${year} YTD`} summary={summary}>
      <div className="weekly-chart-legend" aria-label="Chart legend">
        <span><i className="legend-dot weekly-mature" /> Complete week</span>
        {provisional && <span><i className="legend-dot weekly-provisional" /> Current week, provisional</span>}
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 18, right: 12, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#dfe2ea" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={30} tick={{ fill: "#435070", fontSize: 11 }} />
            <YAxis tickFormatter={(value) => isPercent ? `${value.toFixed(1)}%` : `$${value.toFixed(0)}`} tickLine={false} axisLine={false} width={56} tick={{ fill: "#435070", fontSize: 11 }} />
            <Tooltip
              cursor={{ stroke: "#aeb8d0", strokeDasharray: "4 4" }}
              labelFormatter={(_, entries) => entries?.[0]?.payload ? `${entries[0].payload.start} to ${entries[0].payload.end} | ${entries[0].payload.maturity}` : ""}
              formatter={(value, _name, item) => [format(typeof value === "number" ? value : null), item.dataKey === "provisionalValue" ? `${labels[metric]} (provisional)` : labels[metric]]}
              contentStyle={{ border: "1px solid #001f59", borderRadius: 12, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="matureValue" stroke="#0059ff" strokeWidth={2.5} dot={{ r: 3.5, fill: "#0059ff", stroke: "#001f59", strokeWidth: 1.5 }} activeDot={{ r: 5 }} connectNulls={false} />
            <Line type="monotone" dataKey="provisionalValue" stroke="transparent" dot={{ r: 6, fill: "#ffffff", stroke: "#ff0e73", strokeWidth: 3 }} activeDot={{ r: 7 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {metric === "costPerAcceptance" && <p className="chart-caveat">Gaps indicate zero or unavailable Acceptance data. The current week is provisional and may mature after staging.</p>}
      <details className="chart-table">
        <summary>View chart data as a table</summary>
        <table><thead><tr><th>Week</th><th>{labels[metric]}</th><th>Spend</th><th>Status</th></tr></thead>
          <tbody>{tablePoints.map((point) => <tr key={`${point.start}-${point.maturity}`}><td>{point.start} to {point.end}</td><td>{format(point[metric])}</td><td>{currency(point.spend)}</td><td>{point.maturity}</td></tr>)}</tbody>
        </table>
      </details>
    </ChartCard>
  );
}
