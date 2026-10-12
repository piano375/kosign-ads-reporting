import { Dashboard } from "@/components/dashboard";
import { getDashboardPayload } from "@/lib/dashboard/service";
import { getPdaPayload } from "@/lib/pda/service";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ pda_since?: string; pda_until?: string }> }) {
  const payload = await getDashboardPayload();
  const pdaParams = await searchParams;
  let pdaPayload = null;
  try { pdaPayload = await getPdaPayload(pdaParams.pda_since ?? null, pdaParams.pda_until ?? null); } catch { /* PDA panel renders an explicit unavailable state. */ }
  return <Dashboard payload={payload} pdaPayload={pdaPayload} />;
}
