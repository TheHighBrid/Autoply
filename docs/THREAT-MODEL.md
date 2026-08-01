# Threat model

## Protected assets
Candidate identity, resume, contact details, work authorization answers, browser cookies, application history and evidence.

## Controls

- Store browser profiles outside the repository with restrictive filesystem permissions.
- Encrypt sensitive local data and support session revocation.
- Never place secrets or raw cookies in logs or evidence manifests.
- Redact EEO, demographic and disability answers from screenshots where feasible.
- Hash generated documents and submitted field manifests.
- Require provenance for every screening answer.
- Disable automatic action on CAPTCHA, MFA, identity verification and ambiguous legal attestations.
- Bound retries and use per-application idempotency keys.
- Maintain append-only application events for auditability.
- Separate discovery credentials from application-session credentials.
