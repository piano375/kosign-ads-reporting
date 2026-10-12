# KOSIGN Ads Reporting Dashboard

A server-rendered Next.js dashboard for read-only KOSIGN Meta Ads reporting, including a live Persona × Desire × Awareness (PDA) creative coverage audit.

## Production deployment: Netlify

The app is configured for Netlify using the Next.js runtime (`netlify.toml`). Connect the GitHub repository in the **Harmonic Reach** Netlify team and deploy from `main`.

### Required Netlify environment variables

Set these values in Netlify **before** the first production deploy. Do not commit any real token.

| Variable | Required | Value |
| --- | --- | --- |
| `META_SYSTEM_TOKEN` | Yes | The private Meta system token; server-side only |
| `META_AD_ACCOUNT_ID` | Yes | `act_617887027795895` |
| `META_GRAPH_API_VERSION` | Yes | `v23.0` |
| `META_ACCOUNT_TIMEZONE` | Yes | `America/Los_Angeles` |
| `META_CACHE_TTL_SECONDS` | Optional | `1800` |
| `DASHBOARD_AUTH_USERNAME` | Yes | Username for the HTTP Basic Auth prompt |
| `DASHBOARD_AUTH_PASSWORD` | Yes | Strong dashboard password; server-side only |

`META_SYSTEM_TOKEN_FILE` is only for local development and is not usable on Netlify. The production app preferentially reads `META_SYSTEM_TOKEN` and never sends it to the browser. `DASHBOARD_AUTH_*` enables HTTP Basic Auth for every dashboard and API route; deploys fail closed with HTTP 503 until both are configured.

### Required GitHub / Netlify configuration

- Repository: `piano375/kosign-ads-reporting`
- Branch: `main`
- Build command: `npm run build`
- Netlify plugin: `@netlify/plugin-nextjs` (declared in `netlify.toml`)

## Local development

```bash
npm install
npm run build
npm start
```

The local process reads the Meta token from the private path configured by `META_SYSTEM_TOKEN_FILE` (default: `~/Vault Credentials/meta-system-token.txt`).

## Safety and reporting semantics

- Read-only Meta Graph API access; no campaign or budget writes.
- Credentials remain server-side only.
- PDA results use impression-time reporting.
- Acceptance is Meta-attributed `application_staged`; recent results may mature for 24–72 hours.
- After the verified Sep 28 web-flow cutover, Lead uses `TypeformSubmit` rather than native Meta `lead`.
- The PDA matrix uses explicit, immutable Meta ad-ID mappings. Ads with no approved mapping remain `Unmapped`.

## Validation

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

After deployment, verify `/` and `/api/pda?since=YYYY-MM-DD&until=YYYY-MM-DD` return successfully without exposing tokens or authorization headers.
