# Autoply

Evidence-first job-search and application automation.

Autoply is a local-first system being built to discover and score roles, manage an application queue, generate tailored materials, fill supported ATS forms through retained browser sessions, record tamper-evident submission evidence, and schedule follow-ups.

> Current milestone: the private candidate profile, verified answer bank, policy defaults, diagnostics, canonical job import, deterministic scoring, and runnable CLI are implemented. Real job-source connectors and ATS browser adapters remain under development.

## Design principles

1. **Evidence before status.** An application is never marked submitted merely because a click occurred.
2. **Deterministic workflow.** Every role moves through a strict state machine.
3. **Human truth boundary.** The system may tailor presentation, but may not invent qualifications or answers.
4. **Retained sessions.** Authentication is performed by the user and reused from an encrypted browser profile.
5. **Adapter isolation.** Greenhouse, Lever, Ashby, Workday and other portals use separate versioned adapters.
6. **Graceful handoff.** CAPTCHA, MFA, ambiguous questions and policy boundaries pause the run instead of being bypassed.
7. **Idempotency.** Duplicate discovery or retries do not create duplicate applications.
8. **Local-first privacy.** Candidate data, resumes, answers and browser state stay local by default.

## Architecture

```text
Sources -> Normalizer -> Deduper -> Scorer -> Queue
                                         |
                                         v
Candidate Vault -> Material Builder -> Policy Gate -> ATS Adapter
                                                    -> Browser Session
                                                    -> Evidence Recorder
                                                    -> Tracker / Follow-up Scheduler
```

## Packages

- `packages/domain`: canonical job, candidate, application and evidence models
- `packages/config`: private local profile, validation, answer bank, paths and job import
- `packages/scoring`: transparent weighted role scoring
- `packages/queue`: application state machine and transition guards
- `packages/policy`: truth, consent and automation boundaries
- `packages/browser`: retained-session contract and browser run context
- `packages/adapters`: ATS adapter interface and capability registry
- `packages/evidence`: manifest hashing and submission certification
- `apps/cli`: interactive setup, diagnostics, profile, job import and scoring commands
- `apps/worker`: orchestration example

## Quick start

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm install
pnpm test
pnpm autoply setup
pnpm autoply doctor
```

Then score the included example role:

```bash
pnpm autoply score examples/jobs/fraud-investigator.json
```

See [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) for the complete first-run workflow.

## What counts as a submitted application?

A run can transition to `submitted` only when all required evidence exists:

- final portal URL and ATS adapter/version
- timestamped screenshot after submit
- confirmation text or stable confirmation identifier
- submitted field manifest with secrets redacted
- resume and cover-letter content hashes
- browser run identifier
- cryptographic digest covering the evidence manifest

If the portal gives no reliable confirmation, the result is `submission_unverified`, not `submitted`.

## Safety boundary

Autoply does not include CAPTCHA bypassing, stealth fingerprint spoofing, credential harvesting, fabricated answers, or hidden mass-submission defaults. It supports user-authenticated retained sessions and explicit handoff states.

## License

MIT for original code in this repository. No source code from the researched repositories is copied into this scaffold. Review upstream licenses before porting implementations. Several examined projects use AGPL or additional restrictions.
