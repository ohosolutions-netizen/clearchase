# ClearChase Sandbox Architecture

## Security boundary

The browser never chooses its effective `tenant_id`. A Catalyst-authenticated firm request must resolve the user membership on the server and attach a trusted tenant context before any query. Client portal endpoints derive their narrow request scope from a hashed invitation token plus a verified OTP session. Public endpoints never accept a tenant or user identifier that expands authority.

## Storage flow

1. The client requests an upload intent bound to grant, request item, MIME, byte limit, object key, and expiry.
2. The backend validates scope and quota.
3. The file enters a private Stratus quarantine prefix or a server-proxied stream.
4. A verified scanner sets `Clean` or `Blocked`. An uncertain result stays quarantined.
5. Only `Clean` objects receive a short-lived, actor-scoped download capability.

## Scheduled work

One periodic Job Function discovers due recurrence and reminder work. Each effect uses a unique idempotency key; a lease prevents concurrent processing, and the outbox records provider acceptance. Auto-send stays off by default.

## Sandbox adapter

The present UI adapter uses in-memory typed data. It is deliberately labelled sandbox mode, contains no production identifiers, and does not send selected files or simulate a successful external integration.
