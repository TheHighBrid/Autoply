# Research synthesis

## Repository contribution map

| Project | Strongest reusable idea | Missing or weak area | Autoply use |
|---|---|---|---|
| AkbarDevop/ai-job-agent | Multi-ATS execution, answer bank, tracker continuity, blocked-state honesty, outreach/follow-up skills | Agent prompts and scripts are tightly coupled to Claude Code and personal workflow; evidence certification is not the central data model | ATS adapter contracts, candidate answer bank, handoff states, follow-up lifecycle |
| RajjjAryan/career-copilot | Transparent scoring, pipeline integrity, portal/feed scanning, document generation, multi-agent-tool portability | Primarily human-in-the-loop and terminal-oriented; real submission and retained sessions are secondary | Scoring rubric, deduplication, canonical statuses, provider-neutral instruction layer |
| Vlad9572324/hh.ru-clicker | Narrow platform-specific automation and vacancy interaction | Single-market/single-site scope; limited cross-ATS orchestration and evidence model | Demonstrates why adapters must be isolated and versioned |
| Rayyan9477/AutoApply... | Agentic browser workflow and form navigation | Browser agents can be nondeterministic; needs strict policy gates, retry bounds and auditable evidence | Browser planner as an optional fallback behind deterministic adapters |
| jolie-z/Auto-JobHunter | End-to-end job hunting concept and application automation | Often broad architecture with less mature evidence/tracking guarantees | Discovery and application orchestration concepts |
| surapuramakhil-org/Job_search_agent | Bulk discovery, configurable filters, dynamic resumes, success/failed/skipped outputs, TensorZero gateway | AGPL licensing; high-volume orientation; output files are not enough to prove submission | Provider gateway, explicit result categories, dynamic document pipeline |
| imon333/Job-apply-AI-agent | Lightweight AI-assisted application flow | Limited production controls and platform breadth | Small reference for simple integrations, not a core dependency |
| DaKheera47/job-ops | Excellent product UX, multi-board search, fit score, CV tailoring, Gmail outcome tracking, extractor extension model | Explicitly does not auto-apply; license adds Commons Clause restrictions | Search/extractor architecture, dashboard model, inbox-based outcome tracking |
| feder-cr/Jobs_Applier_AI_Agent_AIHawk | Historical large-scale auto-apply architecture and lessons around session reuse | Third-party plugins removed; anti-detection direction creates ToS and reliability risk; submission volume can damage quality | Retained-session lesson only; no stealth or bypass code adopted |
| santifer/career-ops | Structured skill modes, dashboard, PDF generation, batch processing | Similar to career-copilot; submission evidence and production ATS contracts remain gaps | Workflow mode organization and reporting |
| open-grind/open-grind | Secure token storage, automatic token rotation, resilient local cache, reproducible and signed releases | Not a job-search project | Security/release engineering patterns only |

## Combined system that none of the projects fully supplies

The missing center is a **submission certification layer**. Existing projects usually track `success`, infer submission from browser behavior, or deliberately stop before submission. Autoply defines an evidence bundle and refuses to label an application submitted without confirmation evidence.

Other cross-repository gaps:

1. A canonical job and application schema shared across all sources and ATS adapters.
2. Strict state transitions with idempotency and retry semantics.
3. Versioned ATS capability manifests and fixture-based adapter tests.
4. Encrypted retained-session ownership with explicit user login and revocation.
5. Truth-source metadata for every screening answer.
6. Redacted, hashed evidence manifests.
7. Follow-up scheduling derived from actual submission time and inbox events.
8. Quality/rate limits that prioritize fit over application volume.

## Licensing note

This repository contains original implementation scaffolding. Do not copy AGPL or Commons-Clause-covered source into an MIT codebase without accepting the resulting obligations. Treat upstream projects as research references unless a deliberate license strategy is chosen.
