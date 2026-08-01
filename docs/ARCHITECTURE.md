# Production architecture

## Control plane

- API/UI: queue, review, settings, application timeline
- Orchestrator: durable workflow engine with idempotency keys
- Scheduler: discovery cadence, application windows, follow-up reminders
- Policy engine: consent, truth source, site capability and rate limits

## Data plane

- Source connectors normalize jobs into `CanonicalJob`
- Deduper combines URL, source ID and semantic fingerprint
- Scorer produces deterministic dimensions plus optional LLM rationale
- Material service creates resume/letter variants from verified facts
- Browser worker opens an encrypted retained profile
- ATS adapter maps fields, uploads documents and requests submit
- Evidence service captures confirmation and signs the manifest
- Inbox connector classifies interview/rejection/offer messages

## Recommended production stack

- TypeScript monorepo
- PostgreSQL for canonical data and event history
- S3-compatible encrypted artifact storage or local filesystem
- Temporal, BullMQ or another durable workflow engine
- Playwright with persistent contexts for user-authenticated sessions
- OpenTelemetry traces with PII redaction
- Pluggable LLM gateway with schema-validated responses

## Rollout

### Phase 0: read-only
Discovery, normalization, scoring, queue, analytics.

### Phase 1: preparation
Tailored materials and screening-answer drafts. Human submits.

### Phase 2: assisted fill
Retained browser session fills deterministic fields and pauses before submit.

### Phase 3: supported auto-submit
Only for adapters with tested confirmation detection and explicit user policy. Store evidence bundle.

### Phase 4: autonomous follow-up
Inbox outcome parsing, reminders and drafted outreach, with send policies per channel.

## Adapter quality gate

An adapter becomes auto-submit capable only after:

- fixture tests cover required/optional/custom fields
- upload and validation errors are classified
- submit selector is unambiguous
- confirmation detector has positive and negative fixtures
- retry cannot duplicate an application
- CAPTCHA/MFA paths enter human handoff
- live canary runs are retained and reviewed
