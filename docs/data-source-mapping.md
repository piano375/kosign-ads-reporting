# Data-source mapping

| Dashboard metric | Source | Field | Status |
| --- | --- | --- | --- |
| Spend | Meta Insights | `spend` | Authoritative |
| Impressions | Meta Insights | `impressions` | Authoritative |
| All clicks | Meta Insights | `clicks` | Authoritative |
| Applications / Leads | Meta Insights actions | `lead` | Authoritative |
| Qualified Leads | Meta Insights conversions | `offsite_conversion.fb_pixel_custom.Qualified Lead` | Authoritative when observed |
| Acceptances | Meta Insights conversions | `offsite_conversion.fb_pixel_custom.application_staged` | Authoritative when observed |

Meta daily Insights is requested with impression-time reporting and the account attribution setting. Daily rows are summed before every derived metric is calculated. The account is Kosign Music, reporting in USD and `America/Los_Angeles`.

Meta event arrays are sparse: an action type with a zero value is normally omitted from that daily row. The adapter validates each exact `(source, action_type)` mapping across the complete fetched response before normalization. Once validated, a row-level omission is treated as zero. If the exact mapping is never observed in the response, the metric remains unavailable rather than being converted to zero.

The Aug 13-19 Acceptance regression fixture reconciles to a direct Meta aggregate: 21 Acceptances on $10,618.57 live spend, producing a $505.65 CPA as of Aug 20, 2026 at 10:59 PT. Earlier Aug 19 exports contained a partial final day and must not replace the current live result.

## Funnel status

Funnel is **not configured** in this build. No Funnel workspace, independent authentication method, report/view identifier, refresh cadence, or field mapping was supplied. Its adapter is consequently not invoked and no Funnel value is blended into Meta metrics. Before enabling it, document its independent credentials, timestamp semantics, source ownership, and a mature-period reconciliation tolerance here.

The Funnel MCP connector configured in OpenCode is an operator discovery tool and is separate from the dashboard's server-side data adapter. Its availability does not authorize the dashboard to blend Funnel data until the required field mapping and reconciliation are completed.
