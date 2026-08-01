# ApplyForge

Evidence-first job-search and application automation.

ApplyForge is a local-first reference implementation for a system that discovers and scores roles, manages an application queue, generates tailored materials, fills supported ATS forms through retained browser sessions, records tamper-evident submission evidence, and schedules follow-ups.

> Status: architecture-complete starter repository. Discovery, scoring, queueing, evidence capture, policy gates, and ATS adapter contracts are implemented as reusable core modules. Real ATS selectors and provider integrations must be validated against current sites before production use.

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
- `packages/scoring`: transparent weighted role scoring
- `packages/queue`: application state machine and transition guards
- `packages/policy`: truth, consent and automation boundaries
- `packages/browser`: retained-session contract and browser run context
- `packages/adapters`: ATS adapter interface and capability registry
- `packages/evidence`: manifest hashing and submission certification
- `apps/worker`: orchestration example
- `docs/RESEARCH.md`: source-repository comparison and extraction map
- `docs/ARCHITECTURE.md`: production architecture and rollout stages
- `docs/THREAT-MODEL.md`: security and privacy controls

## Quick start

```bash
corepack enable
pnpm install
pnpm test
pnpm demo
```

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

ApplyForge does not include CAPTCHA bypassing, stealth fingerprint spoofing, credential harvesting, fabricated answers, or hidden mass-submission defaults. It supports user-authenticated retained sessions and explicit handoff states.

## License

MIT for original code in this repository. No source code from the researched repositories is copied into this scaffold. Review upstream licenses before porting implementations. Several examined projects use AGPL or additional restrictions.
