# Task: TDD Fidelity Red-Phase Gate Enforcement Benchmark (Sub-Epic: 25_Benchmarking Suite Process and Performance Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-033]

## 1. Initial Test Written
- [ ] Create test file at `src/orchestrator/__tests__/tdd-fidelity.bench.test.ts`.
- [ ] Write a unit test `redPhaseGate_failsWhenNoFailingTestRecorded` that calls `enforceRedPhaseGate({ taskId: "task-001", testRunResult: { passed: 5, failed: 0 } })` and asserts it throws a `RedPhaseGateError` with message containing "Red-Phase Gate".
- [ ] Write a unit test `redPhaseGate_passesWhenAtLeastOneTestFails` that calls `enforceRedPhaseGate({ taskId: "task-001", testRunResult: { passed: 0, failed: 1 } })` and asserts it resolves without throwing.
- [ ] Write a unit test `tddFidelityReport_100Percent` that creates a mock `TaskLedger` with 10 tasks all having `red_phase_passed = true` and asserts `computeTDDFidelityScore(ledger) === 1.0`.
- [ ] Write a unit test `tddFidelityReport_partialCompliance` that creates a mock `TaskLedger` with 8/10 tasks having `red_phase_passed = true` and asserts `computeTDDFidelityScore(ledger) === 0.8`.
- [ ] Write an integration test `benchmarkRedPhaseGateEnforcement_logsPersist` that runs `enforceRedPhaseGate` for 5 tasks and verifies the `tdd_ledger` SQLite table has 5 rows with `red_phase_verified_at` timestamps.
- [ ] Write a benchmark test measuring `computeTDDFidelityScore` over 1000-task ledger, asserting execution time < 10ms.
- [ ] All tests must FAIL before implementation begins (Red-Phase Gate confirmed).

## 2. Task Implementation
- [ ] Create `src/orchestrator/tdd-gate.ts` exporting:
  - `class RedPhaseGateError extends Error {}`.
  - `interface TestRunResult { passed: number; failed: number }`.
  - `interface RedPhaseGateInput { taskId: string; testRunResult: TestRunResult }`.
  - `function enforceRedPhaseGate(input: RedPhaseGateInput): Promise<void>` — throws `RedPhaseGateError` if `failed === 0`; otherwise inserts a `tdd_ledger` row with `{ task_id, red_phase_passed: true, red_phase_verified_at: ISO8601 }`.
  - `function computeTDDFidelityScore(taskIds: string[]): Promise<number>` — queries `tdd_ledger` for all given task IDs, returns `count(red_phase_passed = true) / taskIds.length`.
- [ ] Create migration `migrations/0XX_create_tdd_ledger.sql` adding table: `tdd_ledger(task_id TEXT PRIMARY KEY, red_phase_passed INTEGER DEFAULT 0, red_phase_verified_at TEXT, implementation_started_at TEXT)`.
- [ ] Integrate `enforceRedPhaseGate` into the orchestrator's `TDDLoop` at the point between "Initial Test Written" and "Task Implementation" steps so it is called automatically for every task.
- [ ] Create `src/orchestrator/benchmark-tdd-fidelity.ts` exporting `runTDDFidelityBenchmark(): Promise<BenchmarkReport>` that queries all tasks in `tdd_ledger`, computes the fidelity score, and returns `{ metric: "tdd-fidelity", score: number, pass: boolean }` where `pass = score === 1.0`.
- [ ] Register in `package.json` under `devs.benchmarks`: `"tdd-fidelity": "vitest bench src/orchestrator/__tests__/tdd-fidelity.bench.test.ts"`.

## 3. Code Review
- [ ] Verify `enforceRedPhaseGate` is called unconditionally in the `TDDLoop` and cannot be bypassed by agent output.
- [ ] Confirm `RedPhaseGateError` is propagated up to the orchestrator and stops the task from proceeding to implementation.
- [ ] Verify `tdd_ledger` migration uses `CREATE TABLE IF NOT EXISTS` for idempotency.
- [ ] Confirm `computeTDDFidelityScore` returns `1.0` (not `Infinity`) when `taskIds` is empty (handle divide-by-zero).
- [ ] Verify all SQLite queries use parameterized statements.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/orchestrator/__tests__/tdd-fidelity.bench.test.ts` and confirm all tests pass.
- [ ] Run `npx vitest bench src/orchestrator/__tests__/tdd-fidelity.bench.test.ts` and confirm p95 < 10ms.
- [ ] Run `npm run migrate` and confirm `tdd_ledger` table exists.
- [ ] Run `npm run lint` and confirm zero errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/tdd-gate.agent.md` documenting: Red-Phase Gate purpose, how to confirm a failing test, `tdd_ledger` schema, and fidelity score formula.
- [ ] Update `docs/benchmarks/README.md` to add a row for `tdd-fidelity` with threshold `score = 1.0 (100%)`.
- [ ] Add `# [9_ROADMAP-REQ-033]` comment above `enforceRedPhaseGate` in source.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js --benchmark tdd-fidelity` and confirm exit code 0.
- [ ] Confirm `reports/benchmarks/tdd-fidelity.json` contains `{ "score": 1.0, "pass": true }`.
- [ ] Run `grep -r "9_ROADMAP-REQ-033" src/orchestrator/tdd-gate.ts` and confirm the requirement ID appears in source.
