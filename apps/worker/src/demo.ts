import type { CandidateProfile, CanonicalJob } from "@autoply/domain";
import { artifact, certify, isSubmissionEvidenceSufficient } from "@autoply/evidence";
import { assertTransition } from "@autoply/queue";
import { scoreJob } from "@autoply/scoring";

const profile: CandidateProfile = {
  id: "candidate-1",
  facts: { skills: ["fraud investigation", "AML", "bilingual", "banking"] },
  preferences: {
    titles: ["Fraud Investigator", "AML Analyst"],
    locations: ["Ottawa", "Remote"],
    remote: true,
  },
  answerBank: {},
  resumes: [],
};

const job: CanonicalJob = {
  id: "job-1",
  source: "demo",
  sourceJobId: "1",
  canonicalUrl: "https://example.com/jobs/1",
  company: "Example Bank",
  title: "Fraud Investigator",
  location: "Ottawa",
  remote: false,
  description: "Investigate fraud cases, banking transactions and AML alerts",
  fingerprint: "demo",
  discoveredAt: new Date().toISOString(),
};

const score = scoreJob(job, profile);
assertTransition("discovered", "scored");

const evidence = certify({
  applicationId: "app-1",
  runId: "run-1",
  adapter: { name: "demo", version: "1" },
  finalUrl: "https://example.com/thanks",
  confirmationText: "Application received",
  submittedAt: new Date().toISOString(),
  artifacts: [
    artifact("screenshot", "confirmation.png", "bytes"),
    artifact("field_manifest", "fields.json", "{}"),
  ],
});

console.log(
  JSON.stringify(
    {
      score,
      evidenceValid: isSubmissionEvidenceSufficient(evidence),
      evidence,
    },
    null,
    2,
  ),
);
