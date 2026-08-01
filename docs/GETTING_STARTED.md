# Getting started

## Install

```bash
git clone https://github.com/TheHighBrid/Autoply.git
cd Autoply
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm install
pnpm test
```

## Create your private candidate profile

Interactive setup:

```bash
pnpm autoply setup
```

The profile is saved to `~/.autoply/profile.json` with restrictive permissions. Override the location during development:

```bash
pnpm autoply setup --home ./.autoply
```

For a disposable demonstration:

```bash
pnpm autoply setup --from config/profile.example.json --home ./.autoply-demo
```

## Check the installation

```bash
pnpm autoply doctor
pnpm autoply profile validate
pnpm autoply profile show
```

`profile show` redacts email and phone. Use `--raw` only on a trusted terminal.

## Score and import a job

```bash
pnpm autoply score examples/jobs/fraud-investigator.json
pnpm autoply job import examples/jobs/fraud-investigator.json
```

Imported jobs are stored under `~/.autoply/jobs/`.

## Current boundary

This milestone does not open a browser or submit applications. It establishes the private local profile, verified answer bank, policy defaults, diagnostics, canonical job import and deterministic scoring needed by later discovery and ATS workers.
