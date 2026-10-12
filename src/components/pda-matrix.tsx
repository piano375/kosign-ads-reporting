"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { PDA_AWARENESS, PDA_PERSONAS } from "@/lib/pda/taxonomy";

type Ad = { id: string; name: string; persona: string; desire: string; awareness: string; mapped: boolean; spend: number; leads: number | null; qualifiedLeads: number | null; acceptances: number | null };
type Segment = { persona: string; desire: string; awareness: string; spend: number; leads: number | null; qualifiedLeads: number | null; acceptances: number | null; costPerAcceptance: number | null; ads: number };
type ReviewSuggestion = { persona: string | null; desire: string | null; awareness: string | null; confidence: "high" | "medium" | "needs-review"; rationale: string };
type Payload = { source: "live" | "stale"; since: string; until: string; mappedAds: number; unmappedAds: number; segments: Segment[]; ads: Ad[]; reviewSuggestions: Record<string, ReviewSuggestion>; note: string };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function metric(value: number | null) { return value === null ? "N/A" : value.toLocaleString(); }

function segmentTone(segment: Segment | undefined) {
  if (!segment) return "not-covered";
  if ((segment.acceptances ?? 0) === 0 && segment.spend > 0) return "underperforming";
  if ((segment.acceptances ?? 0) > 0) return "promising";
  return "not-covered";
}

export function PdaMatrix({ initialPayload }: { initialPayload: Payload | null }) {
  const [since, setSince] = useState(initialPayload?.since ?? "");
  const [until, setUntil] = useState(initialPayload?.until ?? "");
  const [payload, setPayload] = useState<Payload | null>(initialPayload);
  const [selected, setSelected] = useState<Segment | null>(initialPayload?.segments[0] ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultMax = useMemo(() => initialPayload?.until ?? "", [initialPayload?.until]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/pda?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}`, { cache: "no-store" });
      const data = await response.json() as Payload | { error: string };
      if (!response.ok || !("ads" in data)) throw new Error("error" in data ? data.error : "PDA matrix data is unavailable.");
      setPayload(data); setSelected((current) => current && data.segments.find((segment) => segment.persona === current.persona && segment.desire === current.desire && segment.awareness === current.awareness) || data.segments[0] || null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "PDA matrix data is unavailable."); }
    finally { setLoading(false); }
  }

  const top = payload?.segments.reduce<Segment | null>((winner, segment) => !winner || (segment.acceptances ?? 0) > (winner.acceptances ?? 0) ? segment : winner, null) ?? null;
  const selectedAds = selected ? (payload?.ads ?? []).filter((ad) => ad.mapped && ad.persona === selected.persona && ad.desire === selected.desire && ad.awareness === selected.awareness) : [];
  const unmapped = [...(payload?.ads ?? [])].filter((ad) => !ad.mapped).sort((a, b) => b.spend - a.spend);

  return <section className="pda-section pda-audit" aria-labelledby="pda-heading">
    <header className="pda-audit-header"><div><p className="eyebrow">KOSIGN MUSIC / CREATIVE COVERAGE AUDIT</p><h2 id="pda-heading">PERSONA × DESIRE<br />× AWARENESS</h2></div><p>LIVE META WINDOW<br /><strong>ACCEPTANCE KPI</strong></p></header>
    <div className="pda-controls">
      <label>From<input type="date" value={since} max={until || defaultMax} onChange={(event) => setSince(event.target.value)} /></label>
      <label>To<input type="date" value={until} min={since} max={defaultMax} onChange={(event) => setUntil(event.target.value)} /></label>
      <button type="button" onClick={() => void load()} disabled={loading || !since || !until}>{loading ? "Refreshing…" : "Refresh Meta data"}</button>
      {payload && <p>{payload.mappedAds} approved mappings · {payload.unmappedAds} ads to review</p>}
    </div>
    {error ? <p className="pda-error" role="alert">{error}</p> : !payload ? <p className="pda-error" role="status">PDA matrix data is temporarily unavailable. Use Refresh Meta data to try again.</p> : <>
      <div className="pda-audit-layout">
        <div className="pda-coverage"><h3>COVERAGE & PERFORMANCE</h3><p>Each cell is mapped creative coverage by audience awareness. Acceptance is the downstream quality signal; CPA is spend ÷ Acceptances.</p><div className="pda-matrix-wrap"><div className="pda-matrix" role="group" aria-label="Persona, desire, and awareness performance matrix">
          <div className="pda-axis">PERSONA / DESIRE</div>{PDA_AWARENESS.map((item) => <div className="pda-axis" key={item}>{item}</div>)}
          {PDA_PERSONAS.map((persona) => <div className="pda-persona-row" key={persona}><div className="pda-persona">{persona}</div>{PDA_AWARENESS.map((state) => {
            const cells = payload.segments.filter((item) => item.persona === persona && item.awareness === state);
            return <div className="pda-cell" key={state}>{cells.length ? cells.map((segment) => <button type="button" key={segment.desire} className={`pda-chip ${segmentTone(segment)} ${selected === segment ? "selected" : ""}`} style={{ "--signal": (segment.acceptances ?? 0) / Math.max(1, top?.acceptances ?? 1) } as CSSProperties} onClick={() => setSelected(segment)}><b>{metric(segment.acceptances)} A</b><span>{segment.desire}</span><small>{segment.costPerAcceptance === null ? `${usd.format(segment.spend)} spent · early` : `${usd.format(segment.costPerAcceptance)} CPA · ${segment.ads} ads`}</small></button>) : <span className="pda-empty">NOT COVERED</span>}</div>;
          })}</div>)}
        </div></div><div className="pda-legend"><span className="top-performer" /> top performer <span className="promising" /> promising / expand <span className="underperforming" /> underperforming <span className="not-covered" /> not covered</div><p className="pda-small">Source: live Meta Insights, impression-time. Acceptance = <code>application_staged</code>. Recent Acceptance outcomes may mature after 24–72 hours.</p></div>
        <aside className="pda-audit-sidebar"><section className="pda-side-card top"><h3>TOP PERFORMER</h3><b>{top ? `${metric(top.acceptances)} A` : "N/A"}</b><p>{top ? `${top.persona} / ${top.desire} / ${top.awareness}` : "No approved mapped performance in this window."}</p></section><section className="pda-side-card"><h3>SELECTED CELL</h3>{selected ? <><p>{selected.persona} / {selected.desire} / {selected.awareness}</p><div className="pda-detail-grid"><span>Spend<b>{usd.format(selected.spend)}</b></span><span>Acceptances<b>{metric(selected.acceptances)}</b></span><span>CPA<b>{selected.costPerAcceptance === null ? "N/A" : usd.format(selected.costPerAcceptance)}</b></span><span>Qualified<b>{metric(selected.qualifiedLeads)}</b></span></div><p className="pda-small">{selected.ads} approved ad{selected.ads === 1 ? "" : "s"}. {selectedAds.map((ad) => ad.name).join(" · ")}</p></> : <p>Select a covered cell.</p>}</section><section className="pda-side-card"><h3>WHITE SPACE</h3><p>Music Producer has no approved mapped creative across any awareness stage. It remains the clearest new-persona test.</p></section></aside>
      </div>
      <details className="pda-table"><summary>Review and approve the {unmapped.length} unmapped ads</summary><p>Suggestions accelerate review only. They do not assign a PDA cell; a human must approve the immutable Meta ad ID before it appears in the matrix.</p><div><table><thead><tr><th>Ad</th><th>Spend</th><th>Lead</th><th>Qualified</th><th>Acceptance</th><th>Suggested review lane</th></tr></thead><tbody>{unmapped.map((ad) => { const suggestion = payload.reviewSuggestions[ad.id]; const lane = suggestion?.persona ? `${suggestion.persona} · ${suggestion.desire} · ${suggestion.awareness}` : "No suggestion"; return <tr key={ad.id}><td>{ad.name}<small>{ad.id}</small></td><td>{usd.format(ad.spend)}</td><td>{metric(ad.leads)}</td><td>{metric(ad.qualifiedLeads)}</td><td>{metric(ad.acceptances)}</td><td><b className={`pda-confidence ${suggestion?.confidence ?? "needs-review"}`}>{suggestion?.confidence ?? "needs-review"}</b><br />{lane}<small>{suggestion?.rationale}</small></td></tr>; })}</tbody></table></div></details>
      <p className="pda-note">{payload.note}</p>
    </>}
  </section>;
}
