#!/usr/bin/env node
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  createConfig,
  ensureAutoplyHome,
  importCanonicalJob,
  loadCanonicalJob,
  loadConfig,
  redactConfig,
  resolveAutoplyPaths,
  saveConfig,
  validateConfig,
  type AutoplyConfig,
  type ProfileInput,
} from "@autoply/config";
import { scoreJob } from "@autoply/scoring";

const argv = process.argv.slice(2);
const valueAfter = (flag: string): string | undefined => {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
};
const withoutGlobalFlags = (): string[] => {
  const copy = [...argv];
  for (const flag of ["--home"]) {
    const index = copy.indexOf(flag);
    if (index >= 0) copy.splice(index, 2);
  }
  return copy;
};
const args = withoutGlobalFlags();
const paths = resolveAutoplyPaths(valueAfter("--home"));

const help = `Autoply CLI

Usage:
  pnpm autoply setup
  pnpm autoply setup --from config/profile.example.json
  pnpm autoply doctor
  pnpm autoply profile show [--raw]
  pnpm autoply profile validate
  pnpm autoply job import <job.json>
  pnpm autoply score <job.json>

Global options:
  --home <path>   Override ~/.autoply
`;

const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const yes = (value: string, defaultValue = false) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return defaultValue;
  return ["y", "yes", "true", "1"].includes(normalized);
};

async function interactiveSetup(): Promise<AutoplyConfig> {
  const rl = createInterface({ input, output });
  try {
    const ask = async (prompt: string, required = true): Promise<string> => {
      while (true) {
        const answer = (await rl.question(prompt)).trim();
        if (answer || !required) return answer;
        console.log("This value is required.");
      }
    };
    const profile: ProfileInput = {
      fullName: await ask("Full name: "),
      email: await ask("Email: "),
      phone: await ask("Phone (optional): ", false),
      city: await ask("City (optional): ", false),
      region: await ask("Province/state (optional): ", false),
      country: (await ask("Country [Canada]: ", false)) || "Canada",
      targetTitles: list(await ask("Target job titles, comma-separated: ")),
      locations: list(await ask("Preferred locations, comma-separated: ")),
      remote: yes(await ask("Open to remote roles? [Y/n]: ", false), true),
      skills: list(await ask("Skills, comma-separated: ")),
      workAuthorization: await ask("Work authorization status: "),
      requiresSponsorship: yes(await ask("Require sponsorship now or later? [y/N]: ", false), false),
      linkedinUrl: await ask("LinkedIn URL (optional): ", false),
      portfolioUrl: await ask("Portfolio URL (optional): ", false),
    };
    return createConfig(profile);
  } finally {
    rl.close();
  }
}

async function setup(): Promise<void> {
  const from = valueAfter("--from");
  let config: AutoplyConfig;
  if (from) {
    const parsed: unknown = JSON.parse(await readFile(from, "utf8"));
    const validation = validateConfig(parsed);
    if (!validation.valid) throw new Error(`Invalid imported profile\n- ${validation.errors.join("\n- ")}`);
    config = parsed as AutoplyConfig;
  } else {
    config = await interactiveSetup();
  }
  await saveConfig(config, paths);
  console.log(`✓ Profile saved securely to ${paths.profile}`);
  console.log("✓ Submission mode is review and evidence is required.");
}

async function doctor(): Promise<void> {
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  const major = Number(process.versions.node.split(".")[0]);
  checks.push({ name: "Node.js", ok: major >= 20, detail: process.versions.node });
  try {
    await ensureAutoplyHome(paths);
    await access(paths.home, constants.R_OK | constants.W_OK);
    checks.push({ name: "Autoply home", ok: true, detail: paths.home });
  } catch (error) {
    checks.push({ name: "Autoply home", ok: false, detail: String(error) });
  }
  try {
    const config = await loadConfig(paths);
    checks.push({
      name: "Candidate profile",
      ok: true,
      detail: `${config.candidate.identity?.fullName ?? config.candidate.id} (${config.candidate.preferences.titles.length} target roles)`,
    });
  } catch (error) {
    checks.push({ name: "Candidate profile", ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
  for (const check of checks) console.log(`${check.ok ? "✓" : "✗"} ${check.name}: ${check.detail}`);
  if (checks.some((check) => !check.ok)) {
    console.error("\nRun `pnpm autoply setup` to create or repair your profile.");
    process.exitCode = 1;
  }
}

async function profileCommand(): Promise<void> {
  const action = args[1] ?? "show";
  const config = await loadConfig(paths);
  if (action === "validate") {
    console.log(`✓ ${paths.profile} is valid.`);
    return;
  }
  if (action === "show") {
    console.log(JSON.stringify(args.includes("--raw") ? config : redactConfig(config), null, 2));
    return;
  }
  throw new Error(`Unknown profile action: ${action}`);
}

async function jobCommand(): Promise<void> {
  if (args[1] !== "import" || !args[2]) throw new Error("Usage: pnpm autoply job import <job.json>");
  console.log(`✓ Imported job to ${await importCanonicalJob(args[2], paths)}`);
}

async function scoreCommand(): Promise<void> {
  if (!args[1]) throw new Error("Usage: pnpm autoply score <job.json>");
  const [config, job] = await Promise.all([loadConfig(paths), loadCanonicalJob(args[1])]);
  console.log(JSON.stringify({ job: { id: job.id, company: job.company, title: job.title }, score: scoreJob(job, config.candidate) }, null, 2));
}

async function main(): Promise<void> {
  switch (args[0]) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      console.log(help);
      break;
    case "setup":
      await setup();
      break;
    case "doctor":
      await doctor();
      break;
    case "profile":
      await profileCommand();
      break;
    case "job":
      await jobCommand();
      break;
    case "score":
      await scoreCommand();
      break;
    default:
      throw new Error(`Unknown command: ${args[0]}\n\n${help}`);
  }
}

main().catch((error) => {
  console.error(`Autoply error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
