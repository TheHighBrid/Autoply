import assert from "node:assert/strict";
import test from "node:test";

import { scoreJob } from "../packages/scoring/dist/index.js";
import { assertTransition, canTransition } from "../packages/queue/dist/index.js";
import { artifact, certify, isSubmissionEvidenceSufficient } from "../packages/evidence/dist/index.js";
import { evaluateApplyIntent } from "../packages/policy/dist/index.js";

const profile = {
  id: "candidate-1",
  facts: { skills: ["fraud investigation", "AML", "banking"] },
  preferences: {
    titles: ["Fraud Investigator", "AML Analyst"],
    locations: ["Ottawa"],
    remote: true,
    excludedCompanies: ["Blocked Corp"],
  },
  answerBank: {},
  resumes: [],
};

const job = {
  id: "job-1",
  source: "fixture",
  sourceJobId: "1",
  canonicalUrl: "https://example.com/jobs/1",
  company: "Example Bank",
  title: "Fraud Investigator",
  location: "Ottawa",
  remote: false,
  description: "Investigate banking fraud and AML alerts.",
  fingerprint: "fixture",
  discoveredAt: "2026-08-01T00:00:00.000Z",
};

test("job scoring is deterministic and respects exclusions", () => {
  const first = scoreJob(job, profile);
  const second = scoreJob(job, profile);
  assert.deepEqual(first, second);
  assert.ok(first.total > 0);

  const excluded = scoreJob({ ...job, company: "Blocked Corp" }, profile);
  assert.equal(excluded.total, 0);
  assert.deepEqual(excluded.hardFailures, ["excluded_company"]);
});

test("application state machine blocks illegal jumps", () => {
  assert.equal(canTransition("discovered", "scored"), true);
  assert.equal(canTransition("discovered", "submitted"), false);
  assert.throws(() => assertTransition("discovered", "submitted"), /Illegal application transition/);
});

test("policy gate hands CAPTCHA and generated answers to a human", () => {
  assert.deepEqual(
    evaluateApplyIntent({
      autoSubmit: true,
      answers: [{ question: "Why us?", answer: "Draft", source: "generated" }],
      hasCaptcha: true,
      hasMfa: false,
      termsAccepted: true,
    }),
    { decision: "handoff", reasons: ["unverified_answer", "captcha_present"] },
  );
});

test("submission evidence requires confirmation, screenshot, and field manifest", () => {
  const evidence = certify({
    applicationId: "app-1",
    runId: "run-1",
    adapter: { name: "fixture", version: "1.0.0" },
    finalUrl: "https://example.com/thanks",
    confirmationText: "Application received",
    submittedAt: "2026-08-01T00:00:00.000Z",
    artifacts: [
      artifact("screenshot", "confirmation.png", "image-bytes"),
      artifact("field_manifest", "fields.json", "{}"),
    ],
  });

  assert.equal(isSubmissionEvidenceSufficient(evidence), true);
  assert.match(evidence.manifestSha256, /^[a-f0-9]{64}$/);
});
