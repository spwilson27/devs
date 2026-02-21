# Task: Budget Exhaustion Detection and Snapshot-Freeze (Sub-Epic: 16_Budget Recovery and Redaction)

## Covered Requirements
- [8_RISKS-REQ-090]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/BudgetGuard.test.ts`.
- [ ] Write a unit test that instantiates `BudgetGuard` with a mock `config.json` where `budget.hardLimitUsd` is set to `10.00`.
- [ ] Write a test asserting that when `BudgetGuard.checkSpend(currentUsd: number)` is called with a value >= `hardLimitUsd`, it emits a `BUDGET_HARD_LIMIT` event and throws a `BudgetExhaustedError`.
- [ ] Write a test asserting that when `checkSpend` is called with a value >= 80% of `hardLimitUsd`, it emits a `BUDGET_SOFT_LIMIT` event but does NOT throw.
- [ ] Write an integration test in `src/orchestrator/__tests__/BudgetGuard.integration.test.ts` that wires `BudgetGuard` into the orchestrator event bus and asserts the bus receives the `BUDGET_HARD_LIMIT` event and transitions the orchestrator to a `FROZEN` state.
- [ ] Write a unit test for `SnapshotFreeze.execute()` that asserts it:
  1. Calls `git commit -am "chore(devs): budget-freeze snapshot [skip ci]"` with the correct args via a mocked `childProcess`.
  2. Writes a `freeze.json` file to `.devs/state/` with keys `taskId`, `spendUsd`, `timestamp`, and `reason: "BUDGET_HARD_LIMIT"`.
  3. Returns a `FreezeResult` object with a `success: true` field.

## 2. Task Implementation
- [ ] Create `src/orchestrator/BudgetGuard.ts`:
  - Export a class `BudgetGuard` that reads `budget.hardLimitUsd` from the project's `config.json` on construction.
  - Implement `checkSpend(currentUsd: number): void` that:
    - Calculates soft limit as `hardLimitUsd * 0.8`.
    - If `currentUsd >= hardLimitUsd`, emits `BUDGET_HARD_LIMIT` on the shared EventEmitter and throws `new BudgetExhaustedError(currentUsd, hardLimitUsd)`.
    - Else if `currentUsd >= softLimit`, emits `BUDGET_SOFT_LIMIT`.
- [ ] Create `src/orchestrator/errors/BudgetExhaustedError.ts` exporting a class extending `Error` with `currentUsd` and `limitUsd` fields.
- [ ] Create `src/orchestrator/SnapshotFreeze.ts`:
  - Export a class `SnapshotFreeze` with a static `execute(taskId: string, spendUsd: number): Promise<FreezeResult>` method.
  - It must run `git add -A && git commit -m "chore(devs): budget-freeze snapshot [skip ci]"` using the `execa` library.
  - It must write `.devs/state/freeze.json` with `{ taskId, spendUsd, timestamp: new Date().toISOString(), reason: 'BUDGET_HARD_LIMIT' }`.
- [ ] In `src/orchestrator/OrchestratorStateMachine.ts`, subscribe to the `BUDGET_HARD_LIMIT` event and transition the machine to the `FROZEN` state, blocking further task execution.

## 3. Code Review
- [ ] Verify `BudgetGuard` reads config values lazily and is not a singleton; it must be instantiable per-project session.
- [ ] Confirm `SnapshotFreeze` uses `execa` (not `child_process.exec`) for reliable stdout/stderr capture.
- [ ] Confirm `freeze.json` is written atomically (write to temp file, then rename) to prevent partial writes on crash.
- [ ] Verify the `FROZEN` state in the orchestrator state machine is a terminal state that requires explicit user action to exit; no automatic transitions out of `FROZEN`.
- [ ] Ensure `BudgetExhaustedError` is listed in the project's central error registry.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/orchestrator/__tests__/BudgetGuard.test.ts --coverage` and confirm all tests pass with 100% line coverage of `BudgetGuard.ts`.
- [ ] Run `npx jest src/orchestrator/__tests__/BudgetGuard.integration.test.ts` and confirm the integration test passes.
- [ ] Run the full test suite `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/orchestrator/BudgetGuard.agent.md` (create if absent) to document the soft/hard limit logic, the events emitted, and the `FROZEN` state transition.
- [ ] Update `src/orchestrator/SnapshotFreeze.agent.md` to describe the freeze artifact (`freeze.json`) schema and the git commit convention used.
- [ ] Add an entry to `docs/reliability.md` under a "Budget Exhaustion" section describing the two-tier (soft/hard) budget enforcement model.

## 6. Automated Verification
- [ ] Run `node scripts/verify_coverage.js --module BudgetGuard --threshold 100` and assert exit code 0.
- [ ] Run `node scripts/verify_coverage.js --module SnapshotFreeze --threshold 100` and assert exit code 0.
- [ ] Run `ls .devs/state/freeze.json` after the integration test completes to verify the artifact was created on disk.
