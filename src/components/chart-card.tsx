import type { ReactNode } from "react";

export function ChartCard({ title, subtitle, summary, children, wide = false }: { title: string; subtitle: string; summary: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`chart-card ${wide ? "chart-wide" : ""}`} aria-label={`${title}. ${summary}`}>
      <div className="chart-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
