# ClearChase

ClearChase is a focused client document collection workspace for bookkeepers. This repository currently contains a working sandbox vertical slice of the firm dashboard, client directory, templates, request lifecycle, review actions, and mobile client upload portal.

## Run locally

```bash
npm install
npm run dev
```

Build and test:

```bash
npm test
npm run build
```

## Development behavior

The hosted Development app reads and writes normalized Catalyst Data Store records. Client creation, request creation, and item review are persisted through the Advanced I/O function. Selecting **Preview client portal** opens the recipient experience. Document bytes remain blocked until Stratus quarantine and external malware scanning are configured; only quarantined file metadata may be recorded.

## Catalyst deployment shape

- Frontend: Vite output in `dist/`, suitable for Catalyst Web Client Hosting or Slate static hosting.
- Firm auth: Catalyst Authentication, resolved server-side to a membership and tenant context.
- Metadata: Catalyst Data Store with a mandatory tenant scope on every business query.
- Files: private Catalyst Stratus bucket only. Never expose permanent object URLs.
- API: Advanced I/O function behind API Gateway under `/api/v1`.
- Scheduling: Catalyst Job Scheduling / Job Functions with idempotency keys and leases.

Copy `.env.example` to `.env` for local configuration. Do not put real secrets in any `VITE_` variable because Vite exposes those values to the browser.

## Production launch blockers

The sandbox must not be represented as production-ready until all of these are implemented and tested:

1. Catalyst project authentication, Data Store tables/indexes, and server-enforced tenant authorization.
2. Stratus upload/download adapter with short-lived capabilities or a server-proxy fallback.
3. Verified malware scanning and quarantine. Production uploads must remain blocked until this is real.
4. Transactional mail with verified domain, bounce handling, suppression, and signed webhooks.
5. Billing adapter with hosted checkout and signed raw-body webhook verification.
6. Tenant isolation regression suite, rate limiting, OTP hashing, audit trail, retention, export, and deletion jobs.

See `IMPLEMENTATION_PROGRESS.md` for the exact implementation boundary.

## Normalized API

- `GET /api/v1/bootstrap` loads clients, templates, requests, and checklist items.
- `POST /api/v1/clients` creates a client and audit event.
- `POST /api/v1/requests` creates a request and copies its template checklist.
- `POST /api/v1/request-items/:id/review` persists review decisions.
- `POST /api/v1/files/metadata` creates quarantined upload metadata.

The legacy `AppState` table is retained only for rollback and is not used by the current source.
