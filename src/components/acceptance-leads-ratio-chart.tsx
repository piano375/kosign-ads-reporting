"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeeklyPoint } from "@/lib/dashboard/types";
import { ChartCard } from "@/components/chart-card";
import { count, percent } from "@/lib/metrics/format";

export function AcceptanceLeadsRatioChart({ points, current, median }: { points: WeeklyPoint[]; current: WeeklyPoint; median: number | null }) {
  const year = current.end.slice(0, 4);
  const data = [
    ...points.map((point) => ({ ...point, matureRatio: point.acceptanceToLeadRate, currentRatio: null })),
    { ...current, matureRatio: null, currentRatio: current.acceptanceToLeadRate },
  ];
  return (
    <ChartCard wide title={`Acceptance-to-Leads Ratio - Weekly View, ${year} YTD`} subtitle="Recorded Acceptances / Leads (%) | native Meta Lead before Sep 28; TypeformSubmit from Sep 28" summary="The navy series contains mature Monday-Sunday weeks. Lead is a cutover-aware denominator: native Meta Lead before Sep 28, then TypeformSubmit. The magenta hollow marker is a separate provisional last-seven-day period.">
      <div className="ratio-context">
        <span><i className="legend-dot mature" /> Matured weekly periods</span>
        <span><i className="legend-dot current" /> Current last 7 days / provisional</span>
        {median !== null && <span className="median-label">Mature-period median: {percent(median)}</span>}
      </div>
      <div className="chart-wrap ratio-chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 18, right: 22, bottom: 5, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#dfe2ea" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={25} tick={{ fill: "#435070", fontSize: 11 }} />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} tickLine={false} axisLine={false} width={50} tick={{ fill: "#435070", fontSize: 11 }} />
            {median !== null && <ReferenceLine y={median} stroke="#001f59" strokeDasharray="7 5" label={{ value: `Median ${percent(median)}`, fill: "#001f59", fontSize: 11, position: "insideTopRight" }} />}
            <Tooltip
              cursor={{ stroke: "#aeb8d0", strokeDasharray: "4 4" }}
              labelFormatter={(_, entries) => entries?.[0]?.payload ? `${entries[0].payload.start} to ${entries[0].payload.end} | ${entries[0].payload.maturity}` : ""}
              formatter={(value, _name, item) => [percent(typeof value === "number" ? value : null), item.dataKey === "currentRatio" ? "Current ratio" : `Acceptances ${count(item.payload.acceptances)} / Leads ${count(item.payload.leads)}`]}
              contentStyle={{ border: "1px solid #001f59", borderRadius: 12, fontSize: 12 }}
            />
            <Line name="Matured weekly periods" type="monotone" dataKey="matureRatio" stroke="#001f59" strokeWidth={2.5} dot={{ r: 4, fill: "#16a6a1", stroke: "#001f59", strokeWidth: 1.5 }} activeDot={{ r: 5 }} connectNulls={false} />
            <Line name="Current last 7 days / provisional" type="monotone" dataKey="currentRatio" stroke="transparent" dot={{ r: 6, fill: "#ffffff", stroke: "#ff0e73", strokeWidth: 3 }} activeDot={{ r: 7 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caveat">The current marker is not connected to mature weeks because Acceptance staging may still backfill. Annotation bands are supported when verified operational changes are supplied; no unverified historic events are shown.</p>
      <details className="chart-table"><summary>View ratio data as a table</summary>
        <table><thead><tr><th>Period</th><th>Acceptances</th><th>Leads</th><th>Ratio</th><th>Status</th></tr></thead>
          <tbody>{[...points, current].map((point) => <tr key={`${point.start}-${point.maturity}`}><td>{point.start} to {point.end}</td><td>{count(point.acceptances)}</td><td>{count(point.leads)}</td><td>{percent(point.acceptanceToLeadRate)}</td><td>{point.maturity}</td></tr>)}</tbody>
        </table>
      </details>
    </ChartCard>
  );
}
