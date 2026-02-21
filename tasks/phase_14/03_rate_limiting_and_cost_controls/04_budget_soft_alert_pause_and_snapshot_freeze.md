# Task: Implement Budget Soft-Alert, Pause, and Snapshot-Freeze Logic (Sub-Epic: 03_Rate Limiting and Cost Controls)

## Covered Requirements
- [8_RISKS-REQ-089]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/budget/__tests__/BudgetPolicyEngine.test.ts`.
- [ ] Write a unit test verifying that when `TokenBudgetTracker.getUsagePercent()` returns a value between 80 and 99 (inclusive), `BudgetPolicyEngine.evaluate()` returns `{ action: 'soft_alert', usagePercent }`.
- [ ] Write a unit test verifying that when `getUsagePercent()` returns exactly 80, `action` is `'soft_alert'`.
- [ ] Write a unit test verifying that when `getUsagePercent()` returns 100 or above, `action` is `'hard_freeze'`.
- [ ] Write a unit test verifying that when `action` is `'soft_alert'`, the orchestrator emits a `BUDGET_SOFT_ALERT` event and does NOT pause execution.
- [ ] Write a unit test verifying that when `action` is `'hard_freeze'`, the orchestrator calls `SnapshotManager.snapshot()` followed by `orchestrator.freezeAll()`, and emits `BUDGET_HARD_FREEZE` event.
- [ ] Write a unit test verifying that `SnapshotManager.snapshot()` writes a JSON file to `.devs/snapshots/<timestamp>_snapshot.json` containing the current task queue state, agent memory, and total token usage.
- [ ] Write a unit test verifying that `orchestrator.freezeAll()` marks all in-progress tasks as `FROZEN` in SQLite, preventing further execution until explicitly resumed.
- [ ] Write an integration test that runs the `BudgetPolicyEngine` poll loop (polling every 5 seconds via injected timer), simulates usage incrementing to 80%, asserts `BUDGET_SOFT_ALERT` is emitted, then simulates usage reaching 100% and asserts `BUDGET_HARD_FREEZE` is emitted and `freezeAll()` is called.
- [ ] Write a unit test verifying that a `soft_alert` notification is only emitted once per 10% usage increment (debounce), not on every poll cycle.

## 2. Task Implementation
- [ ] Create `src/orchestrator/budget/BudgetPolicyEngine.ts`:
  - Accepts `TokenBudgetTracker`, `SnapshotManager`, `Orchestrator`, and `ITimer` (injected).
  - Method `evaluate(): BudgetPolicyResult` — queries `getUsagePercent()` and returns `{ action: 'continue' | 'soft_alert' | 'hard_freeze'; usagePercent: number }`.
  - Method `startPolling(intervalMs: number = 5000): void` — sets up a recurring timer to call `evaluate()` and act on the result.
  - On `soft_alert`: emit `BUDGET_SOFT_ALERT` event via event bus with `{ usagePercent, remainingTokens, timestamp }`. Debounce: do not re-emit if the last emission was within the same 10% usage band.
  - On `hard_freeze`: call `snapshotManager.snapshot()`, then `orchestrator.freezeAll()`, then emit `BUDGET_HARD_FREEZE` event with full snapshot path.
- [ ] Create `src/orchestrator/budget/SnapshotManager.ts`:
  - Method `snapshot(): Promise<string>` — serializes current orchestrator state (task queue, active agents, token totals) to `<projectRoot>/.devs/snapshots/<ISO_timestamp>_snapshot.json`. Returns the snapshot file path.
  - Ensures `.devs/snapshots/` directory exists before writing (mode 0700).
  - After writing, logs a checksum (SHA-256) of the snapshot file to SQLite `snapshots` table (`path TEXT, checksum TEXT, created_at TEXT`).
- [ ] Modify `Orchestrator.ts`:
  - Add `freezeAll(): Promise<void>` method: updates all `task_status` rows where `status IN ('queued', 'in_progress')` to `status = 'FROZEN'` within a single SQLite transaction.
  - Expose a `resume()` method to restore FROZEN tasks to their pre-freeze status (for use after user intervention).
- [ ] Wire `BudgetPolicyEngine` into the orchestrator bootstrap: call `budgetPolicyEngine.startPolling()` after all tasks are enqueued.
- [ ] Export through `src/orchestrator/budget/index.ts`.

## 3. Code Review
- [ ] Verify `BudgetPolicyEngine` is fully decoupled from concrete timer implementation via `ITimer` (supports `setInterval`/`clearInterval`), enabling deterministic tests with fake timers.
- [ ] Verify `SnapshotManager.snapshot()` is atomic: write to a temp file first, then `rename()` to final path to avoid partial snapshots on crash.
- [ ] Verify `Orchestrator.freezeAll()` runs in a single SQLite transaction (`BEGIN IMMEDIATE ... COMMIT`) to guarantee atomicity.
- [ ] Verify debounce logic for `BUDGET_SOFT_ALERT` is tested for boundary conditions (exactly at 80%, at 89.9%, at 90.0%).
- [ ] Verify snapshot directory is created with permission `0o700` and that the `SnapshotManager` enforces this.
- [ ] Verify requirement annotation `// [8_RISKS-REQ-089]` appears in `BudgetPolicyEngine.ts`, `SnapshotManager.ts`, and `Orchestrator.ts`.
- [ ] Ensure all methods return typed results (no implicit `any`); strict TypeScript compliance.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="BudgetPolicyEngine"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="BudgetPolicyEngine.integration"` and confirm the polling integration test passes.
- [ ] Run `npm test -- --testPathPattern="SnapshotManager"` and confirm all snapshot unit tests pass.
- [ ] Run `npm run test:coverage -- --collectCoverageFrom="src/orchestrator/budget/**"` and assert ≥ 90% line coverage.
- [ ] Run `npm run lint` and confirm zero lint errors.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Budget Alert and Freeze Policy` section to `docs/orchestrator.md` describing the 80% soft-alert threshold, the 100% hard-freeze sequence (snapshot → freezeAll → event), debounce behavior, and how to resume after a freeze.
- [ ] Document `SnapshotManager` snapshot format (JSON schema) in `docs/snapshot-format.md`.
- [ ] Add an entry to `docs/agent-memory/phase_14_decisions.md` recording the decision to use `snapshot_and_freeze` (not terminate) at 100% and the recovery path.
- [ ] Update `specs/8_risks_mitigation.md` traceability table to mark `[8_RISKS-REQ-089]` as implemented in Phase 14 / Task 04.

## 6. Automated Verification
- [ ] Execute `scripts/validate-all.sh` and confirm exit code 0.
- [ ] Run `node scripts/check-req-coverage.js --req 8_RISKS-REQ-089` and assert `status: covered`.
- [ ] Run `npm run test -- --ci --forceExit` and confirm zero failing test suites.
- [ ] Run `grep -r "8_RISKS-REQ-089" src/orchestrator/budget/ src/orchestrator/Orchestrator.ts --include="*.ts" -l` and confirm at least 3 files listed.
- [ ] Run `node scripts/db-check.js --table snapshots` and confirm exit code 0, verifying the snapshots table schema exists.
- [ ] After running the integration test, verify that a `.devs/snapshots/` directory exists and contains at least one `*_snapshot.json` file (use `ls .devs/snapshots/*.json` in the test fixture directory).
