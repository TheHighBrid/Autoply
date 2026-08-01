import type { CandidateProfile, CanonicalJob, ScoreBreakdown } from "@autoply/domain";

export interface ScoreWeights {
  title: number;
  skills: number;
  location: number;
  compensation: number;
  seniority: number;
  preference: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  title: 0.22,
  skills: 0.28,
  location: 0.12,
  compensation: 0.12,
  seniority: 0.14,
  preference: 0.12,
};

const terms = (value: string): Set<string> =>
  new Set(value.toLowerCase().match(/[a-z0-9+#.]{2,}/g) ?? []);

const overlap = (needles: Set<string>, haystack: Set<string>): number => {
  if (needles.size === 0) return 0;
  let matches = 0;
  for (const token of needles) {
    if (haystack.has(token)) matches += 1;
  }
  return matches / needles.size;
};

const validateWeights = (weights: ScoreWeights): void => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 1) > 0.0001) {
    throw new Error(`Score weights must total 1. Received ${total}.`);
  }
};

export function scoreJob(
  job: CanonicalJob,
  profile: CandidateProfile,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): ScoreBreakdown {
  validateWeights(weights);

  const excluded = profile.preferences.excludedCompanies?.some(
    (company) => company.toLowerCase() === job.company.toLowerCase(),
  );
  const hardFailures = excluded ? ["excluded_company"] : [];

  const jobTitleTerms = terms(job.title);
  const titleScore = Math.max(
    ...profile.preferences.titles.map((title) => overlap(terms(title), jobTitleTerms)),
    0,
  );

  const skillEvidence = Object.values(profile.facts)
    .flatMap((value) => (Array.isArray(value) ? value : [String(value)]))
    .join(" ");
  const skillScore = overlap(terms(skillEvidence), terms(job.description));

  const locationScore =
    job.remote && profile.preferences.remote
      ? 1
      : profile.preferences.locations.some((location) =>
            job.location?.toLowerCase().includes(location.toLowerCase()),
          )
        ? 1
        : 0.25;

  const maxCompensation = job.compensation?.max;
  const compensationScore =
    profile.preferences.minCompensation === undefined || maxCompensation === undefined
      ? 0.5
      : maxCompensation >= profile.preferences.minCompensation
        ? 1
        : 0;

  const seniorityScore = /senior|lead|principal|staff/i.test(job.title) ? 0.45 : 1;
  const preferenceScore =
    profile.preferences.remote === undefined || job.remote === undefined
      ? 0.6
      : job.remote === profile.preferences.remote
        ? 1
        : 0.4;

  const raw = {
    title: titleScore,
    skills: skillScore,
    location: locationScore,
    compensation: compensationScore,
    seniority: seniorityScore,
    preference: preferenceScore,
  };

  const dimensions = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      {
        score: Math.round(value * 100),
        weight: weights[key as keyof ScoreWeights],
        rationale: `Deterministic ${key} match`,
        evidence: [],
      },
    ]),
  ) as ScoreBreakdown["dimensions"];

  const total = hardFailures.length
    ? 0
    : Math.round(
        Object.entries(raw).reduce(
          (sum, [key, value]) => sum + value * weights[key as keyof ScoreWeights],
          0,
        ) * 100,
      );

  return { total, dimensions, hardFailures, rubricVersion: "1.0.0" };
}
