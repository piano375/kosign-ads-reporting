import "server-only";

import { getServerConfig } from "@/lib/env";
import { accountSchema, normalizeInsightRows, type DailyRow } from "@/lib/meta/insights";
import { resolveMetaToken } from "@/lib/meta/token";

export type MetaPage = { data?: unknown[]; paging?: { cursors?: { after?: string } } };

function operationalError() {
  return new Error("Meta reporting is temporarily unavailable. No credentials or upstream response details are exposed.");
}

async function readToken() {
  const { META_SYSTEM_TOKEN_FILE } = getServerConfig();
  try {
    return await resolveMetaToken({ META_SYSTEM_TOKEN: process.env.META_SYSTEM_TOKEN, META_SYSTEM_TOKEN_FILE });
  } catch {
    throw operationalError();
  }
}

async function metaFetch(url: string, token: string) {
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500) break;
    } catch {
      // Retry network and service failures without surfacing a sensitive URL.
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw operationalError();
}

export async function fetchMetaAdInsights(since: string, until: string): Promise<unknown[]> {
  const config = getServerConfig();
  const token = await readToken();
  const base = `https://graph.facebook.com/${config.META_GRAPH_API_VERSION}/${config.META_AD_ACCOUNT_ID}`;
  const params = new URLSearchParams({
    level: "ad",
    fields: "ad_id,ad_name,spend,impressions,clicks,actions,conversions,date_start,date_stop",
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    action_report_time: "impression",
    use_account_attribution_setting: "true",
    limit: "500",
  });
  const rawRows: unknown[] = [];
  const seenCursors = new Set<string>();
  let after: string | undefined;

  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    if (after) params.set("after", after);
    const pageResponse = await metaFetch(`${base}/insights?${params.toString()}`, token);
    const page = (await pageResponse.json()) as MetaPage;
    rawRows.push(...(page.data ?? []));
    const nextCursor = page.paging?.cursors?.after;
    if (!nextCursor) return rawRows;
    if (seenCursors.has(nextCursor)) throw operationalError();
    seenCursors.add(nextCursor);
    after = nextCursor;
  }
  throw operationalError();
}

export async function fetchMetaDailyInsights(since: string, until: string): Promise<DailyRow[]> {
  const config = getServerConfig();
  const token = await readToken();
  const base = `https://graph.facebook.com/${config.META_GRAPH_API_VERSION}/${config.META_AD_ACCOUNT_ID}`;

  const accountResponse = await metaFetch(`${base}?fields=id,name,currency,timezone_name`, token);
  const account = accountSchema.safeParse(await accountResponse.json());
  if (!account.success || account.data.id !== config.META_AD_ACCOUNT_ID || account.data.name !== "Kosign Music" || account.data.currency !== "USD" || account.data.timezone_name !== config.META_ACCOUNT_TIMEZONE) {
    throw operationalError();
  }

  const params = new URLSearchParams({
    fields: "spend,impressions,clicks,actions,conversions,date_start,date_stop",
    time_range: JSON.stringify({ since, until }),
    time_increment: "1",
    action_report_time: "impression",
    use_account_attribution_setting: "true",
    limit: "500",
  });
  const rawRows: unknown[] = [];
  const seenCursors = new Set<string>();
  let after: string | undefined;

  for (let pageNumber = 0; pageNumber < 20; pageNumber += 1) {
    if (after) params.set("after", after);
    const pageResponse = await metaFetch(`${base}/insights?${params.toString()}`, token);
    const page = (await pageResponse.json()) as MetaPage;
    rawRows.push(...(page.data ?? []));
    const nextCursor = page.paging?.cursors?.after;
    if (!nextCursor) break;
    if (seenCursors.has(nextCursor)) throw operationalError();
    seenCursors.add(nextCursor);
    after = nextCursor;

    if (pageNumber === 19) throw operationalError();
  }
  return normalizeInsightRows(rawRows);
}
