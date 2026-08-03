export type AtsKind = "greenhouse" | "lever" | "ashby" | "workday" | "linkedin" | "custom";
export type ApplicationState =
  | "discovered" | "scored" | "queued" | "materials_ready" | "ready_to_apply"
  | "in_progress" | "human_handoff" | "submission_unverified" | "submitted"
  | "failed" | "withdrawn" | "rejected" | "interview" | "offer";

export interface CandidateIdentity {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  region?: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface CanonicalJob {
  id: string;
  source: string;
  sourceJobId: string;
  canonicalUrl: string;
  company: string;
  title: string;
  location?: string;
  remote?: boolean;
  description: string;
  postedAt?: string;
  compensation?: { min?: number; max?: number; currency?: string; period?: "hour"|"year" };
  ats?: AtsKind;
  fingerprint: string;
  discoveredAt: string;
}

export interface CandidateProfile {
  id: string;
  identity?: CandidateIdentity;
  facts: Record<string, string | number | boolean | string[]>;
  preferences: {
    titles: string[];
    locations: string[];
    remote?: boolean;
    minCompensation?: number;
    excludedCompanies?: string[];
  };
  answerBank: Record<string, { answer: string; verifiedAt: string; source: "candidate"|"document" }>;
  resumes: Array<{ id: string; path: string; sha256: string; tags: string[] }>;
}

export interface ScoreBreakdown {
  total: number;
  dimensions: Record<string, { score: number; weight: number; rationale: string; evidence: string[] }>;
  hardFailures: string[];
  model?: string;
  rubricVersion: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  candidateId: string;
  state: ApplicationState;
  score?: ScoreBreakdown;
  selectedResumeId?: string;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  nextActionAt?: string;
  handoffReason?: string;
}

export interface EvidenceArtifact { kind: "screenshot"|"html"|"receipt"|"field_manifest"|"document"|"log"; path: string; sha256: string; capturedAt: string; redacted: boolean; }
export interface SubmissionEvidence {
  applicationId: string;
  runId: string;
  adapter: { name: string; version: string };
  finalUrl: string;
  confirmationText?: string;
  confirmationId?: string;
  submittedAt: string;
  artifacts: EvidenceArtifact[];
  manifestSha256: string;
}
