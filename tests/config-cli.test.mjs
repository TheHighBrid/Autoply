import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createConfig,
  loadConfig,
  resolveAutoplyPaths,
  saveConfig,
  validateConfig,
} from "../packages/config/dist/index.js";

const input = {
  fullName: "Example Candidate",
  email: "candidate@example.com",
  city: "Ottawa",
  country: "Canada",
  targetTitles: ["Fraud Investigator"],
  locations: ["Ottawa"],
  remote: true,
  skills: ["fraud", "AML"],
  workAuthorization: "Authorized to work in Canada",
  requiresSponsorship: false,
};

test("candidate config is created, validated, saved atomically, and loaded", async () => {
  const home = await mkdtemp(join(tmpdir(), "autoply-config-"));
  const paths = resolveAutoplyPaths(home);
  const config = createConfig(input, new Date("2026-08-01T00:00:00.000Z"));

  assert.equal(validateConfig(config).valid, true);
  await saveConfig(config, paths);
  const loaded = await loadConfig(paths);

  assert.equal(loaded.candidate.identity.email, "candidate@example.com");
  assert.equal(loaded.policy.requireEvidence, true);
  assert.equal((await stat(paths.profile)).mode & 0o777, 0o600);
  assert.match(await readFile(paths.profile, "utf8"), /"schemaVersion": 1/);
});

test("config validation rejects unsafe or incomplete policy", () => {
  const config = createConfig(input);
  const invalid = { ...config, policy: { ...config.policy, requireEvidence: false } };
  const result = validateConfig(invalid);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("policy.requireEvidence must remain true"));
});
