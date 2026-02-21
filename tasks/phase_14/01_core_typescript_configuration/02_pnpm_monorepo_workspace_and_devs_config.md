# Task: Configure pnpm v9 Monorepo Workspace with devs Section in package.json (Sub-Epic: 01_Core TypeScript Configuration)

## Covered Requirements
- [TAS-006]

## 1. Initial Test Written
- [ ] Write a Jest test (`src/__tests__/package-json.test.ts`) that:
  - Reads the root `package.json` and asserts `packageManager` field equals `"pnpm@9.x"` (or matches the regex `/^pnpm@9\./`).
  - Asserts a top-level `"devs"` key exists in `package.json`.
  - Within `package.json["devs"]`, asserts the following sub-keys are present and correctly typed:
    - `"schemaVersion"` — a semver string (e.g. `"1.0.0"`).
    - `"agentModel"` — a non-empty string identifying the primary reasoning model (e.g. `"gemini-3-pro"`).
    - `"utilityModel"` — a non-empty string for the utility model (e.g. `"gemini-3-flash"`).
    - `"maxConcurrentAgents"` — a positive integer.
    - `"tokenBudget"` — an object with `"warningThreshold"` and `"hardLimit"` as positive integers.
    - `"sandboxPolicy"` — an object with at least `"allowNetwork"` (boolean) and `"allowFileSystemWrite"` (boolean).
  - Reads `pnpm-workspace.yaml` and asserts it contains at least one `packages` entry covering `packages/*`.
- [ ] Write a shell integration test that:
  - Runs `pnpm install --frozen-lockfile` and asserts exit code `0`.
  - Runs `pnpm ls --depth 0` and asserts pnpm v9 is active.

## 2. Task Implementation
- [ ] Ensure pnpm v9.x is installed and pinned:
  ```bash
  corepack enable && corepack prepare pnpm@9 --activate
  ```
- [ ] Add `"packageManager": "pnpm@9.x.x"` to the root `package.json`.
- [ ] Create or update `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'packages/*'
    - 'apps/*'
  ```
- [ ] Add the `"devs"` configuration section to the root `package.json`:
  ```json
  {
    "devs": {
      "schemaVersion": "1.0.0",
      "agentModel": "gemini-3-pro",
      "utilityModel": "gemini-3-flash",
      "maxConcurrentAgents": 4,
      "tokenBudget": {
        "warningThreshold": 750000,
        "hardLimit": 1000000
      },
      "sandboxPolicy": {
        "allowNetwork": false,
        "allowFileSystemWrite": true,
        "allowedNetworkHosts": []
      },
      "phases": {
        "currentPhase": null,
        "completedPhases": []
      }
    }
  }
  ```
- [ ] Add the following scripts to root `package.json` (merge with existing):
  ```json
  {
    "scripts": {
      "bootstrap-sandbox": "node scripts/bootstrap-sandbox.js",
      "run-mcp": "node scripts/run-mcp.js",
      "validate-all": "node scripts/validate-all.js"
    }
  }
  ```
- [ ] Create `packages/` and `apps/` directories with `.gitkeep` if they don't yet exist.
- [ ] Run `pnpm install` to generate an updated lockfile.

## 3. Code Review
- [ ] Confirm the `"devs"` section schema matches the TypeScript interface defined in `src/types/DevsConfig.ts` (create this file if absent).
- [ ] Verify `pnpm-workspace.yaml` correctly reflects the actual monorepo layout.
- [ ] Ensure no workspace package `package.json` sets `"packageManager"` to a conflicting pnpm version.
- [ ] Confirm `pnpm-lock.yaml` is committed to the repository (not gitignored).
- [ ] Verify the `"devs"` section does NOT contain any secrets or credentials — only schema/configuration values.

## 4. Run Automated Tests to Verify
- [ ] Run the package.json unit tests:
  ```bash
  pnpm test -- --testPathPattern="package-json.test"
  ```
- [ ] Verify pnpm workspace integrity:
  ```bash
  pnpm install --frozen-lockfile && pnpm ls --depth 0
  ```
- [ ] Confirm all commands exit `0`.

## 5. Update Documentation
- [ ] Create or update `src/types/DevsConfig.agent.md` documenting the `DevsConfig` TypeScript interface with field-by-field descriptions.
- [ ] Add a "Workspace Structure" section to the root `README.md` explaining the `packages/` and `apps/` layout.
- [ ] Document the `"devs"` package.json section schema in `docs/devs-config-schema.md`, explaining each field's purpose and valid values.

## 6. Automated Verification
- [ ] Add a CI step that validates the `"devs"` section against its JSON Schema:
  ```bash
  pnpm validate-all
  ```
- [ ] Add `scripts/validate-devs-config.ts` (invoked by `validate-all`) that:
  - Parses root `package.json`.
  - Validates `devs` section against the `DevsConfig` interface via `zod` or `ajv`.
  - Exits non-zero with a descriptive error if validation fails.
- [ ] Add a CI step to confirm `pnpm-lock.yaml` is up-to-date:
  ```bash
  pnpm install --frozen-lockfile
  ```
  (this step fails if the lockfile is stale, enforcing deterministic installs).
