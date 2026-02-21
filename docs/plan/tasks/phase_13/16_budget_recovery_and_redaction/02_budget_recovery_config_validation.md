# Task: Budget Recovery Config Validation and Resume Gate (Sub-Epic: 16_Budget Recovery and Redaction)

## Covered Requirements
- [8_RISKS-REQ-090]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/BudgetRecoveryGate.test.ts`.
- [ ] Write a unit test asserting that `BudgetRecoveryGate.validate(config)` returns `{ valid: false, reason: 'BUDGET_NOT_INCREASED' }` when the project state is `FROZEN` and `config.budget.hardLimitUsd` has not changed relative to the frozen snapshot value stored in `.devs/state/freeze.json`.
- [ ] Write a unit test asserting that `BudgetRecoveryGate.validate(config)` returns `{ valid: true }` when `config.budget.hardLimitUsd` is strictly greater than the `spendUsd` recorded in `freeze.json`.
- [ ] Write a unit test asserting that `BudgetRecoveryGate.validate(config)` returns `{ valid: true }` when `config.models.taskExecutor` has been changed to a "Tier 2" model (e.g., `gemini-flash` or any model listed in the `TIER_2_MODELS` allowlist in `src/config/constants.ts`).
- [ ] Write a test asserting that `BudgetRecoveryGate.validate(config)` returns `{ valid: false, reason: 'FREEZE_ARTIFACT_MISSING' }` when `.devs/state/freeze.json` does not exist.
- [ ] Write an integration test asserting that running `devs resume` from a `FROZEN` state with an invalid config exits with code `1` and prints a human-readable error message including the current spend and the required budget increase.

## 2. Task Implementation
- [ ] Create `src/orchestrator/BudgetRecoveryGate.ts`:
  - Export a class with a static `validate(config: ProjectConfig): Promise<ValidationResult>` method.
  - Read `.devs/state/freeze.json`; if absent, return `{ valid: false, reason: 'FREEZE_ARTIFACT_MISSING' }`.
  - Parse `freeze.json` to get `spendUsd` (the spend at the time of freeze).
  - Return `{ valid: true }` if `config.budget.hardLimitUsd > spendUsd` OR if `TIER_2_MODELS` (from `src/config/constants.ts`) includes `config.models.taskExecutor`.
  - Otherwise return `{ valid: false, reason: 'BUDGET_NOT_INCREASED' }`.
- [ ] In `src/config/constants.ts`, add and export a `TIER_2_MODELS: readonly string[]` array containing at minimum `['gemini-flash', 'gemini-flash-lite', 'gpt-4o-mini']`.
- [ ] In the `devs resume` CLI handler (`src/cli/commands/resume.ts`), call `BudgetRecoveryGate.validate(config)` before proceeding. If invalid, print the reason and exit with code `1`. If valid, transition orchestrator state from `FROZEN` to `READY` and continue.

## 3. Code Review
- [ ] Verify `BudgetRecoveryGate.validate` is a pure function with no side effects (reads only, no writes).
- [ ] Confirm the `TIER_2_MODELS` list is defined in `constants.ts` and not inlined in `BudgetRecoveryGate` to allow a single point of update.
- [ ] Verify the CLI handler does not swallow the `ValidationResult.reason`; it must be surfaced to the user verbatim.
- [ ] Confirm the resume gate is also exercised by `devs run` (not only `devs resume`) when the orchestrator is in `FROZEN` state.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/orchestrator/__tests__/BudgetRecoveryGate.test.ts --coverage` and confirm all tests pass.
- [ ] Run the CLI integration test: `npx jest src/cli/__tests__/resume.integration.test.ts`.
- [ ] Run `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create or update `src/orchestrator/BudgetRecoveryGate.agent.md` documenting the two recovery paths (budget increase vs. Tier 2 model) and the `TIER_2_MODELS` allowlist location.
- [ ] Update `docs/reliability.md` under the "Budget Exhaustion" section to describe the recovery workflow: how a user updates `config.json` and what `devs resume` checks before proceeding.
- [ ] Update the CLI reference in `docs/cli.md` with the new exit code `1` behavior for `devs resume` when budget validation fails.

## 6. Automated Verification
- [ ] Run `node scripts/verify_coverage.js --module BudgetRecoveryGate --threshold 100` and assert exit code 0.
- [ ] Run `bash scripts/e2e/budget_recovery_gate.sh` which should: create a fake `freeze.json`, run `devs resume` with an unchanged config, and assert exit code 1; then run it with an increased budget and assert exit code 0.
