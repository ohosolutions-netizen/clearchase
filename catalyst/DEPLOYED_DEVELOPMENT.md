# Catalyst Development Deployment

Deployed on 31 October 2026 to Catalyst project `77605000000235364` in the Development environment.

## Slate

- App: `clearchase-slate`
- Deployment: `default`
- App ID: `23667000000010002`
- Deployment ID: `23667000000010004`
- Hosted URL: `https://clearchase-slate-iunkdnln.onslate.in`

## Serverless API

- Function: `clearchase_api`
- Type: Advanced I/O
- Runtime: Node 24
- Function ID: `77605000000235388`
- Base URL: `https://clearchase-60091125992.development.catalystserverless.in/server/clearchase_api`
- State API: `/api/v1/state` (Development sandbox persistence)

## Data Store

- `Clients` — structured client records
- `AppState` (`77605000000235764`) — Development sandbox application state
- Health endpoint: `/api/v1/health`

The health endpoint was verified with HTTP 200 and Catalyst execution headers.

## Data Store

- Table: `Clients`
- Table ID: `77605000000235393`
- Columns: `business_name` (mandatory), `contact_name`, `email` (mandatory, PII/ePHI), `status` (mandatory, default `Active`), plus Catalyst system columns.

## Boundary

This is a Development deployment. Production promotion was not performed. The UI continues to use non-sensitive sandbox records while Catalyst Authentication, full tenant membership resolution, remaining workflow tables, Stratus quarantine, and verified malware scanning are implemented.
