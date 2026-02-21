# Task: Implement TDD Fidelity Enforcement and Benchmarking (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create `src/tdd/__tests__/TddFidelityEnforcer.test.ts`.
- [ ] Write a unit test `should return fidelity score of 1.0 when all tasks followed RED-GREEN-REFACTOR` — mock `tdd_verifications` rows where every task has `red_confirmed=1`, `green_confirmed=1`, `refactor_confirmed=1`; assert `score === 1.0`.
- [ ] Write a unit test `should return fidelity score of 0.0 when no tasks had a confirmed RED state` — mock rows where `red_confirmed=0` for all tasks; assert `score === 0.0`.
- [ ] Write a unit test `should calculate a partial fidelity score correctly` — mock 4 tasks where 3 have `red_confirmed=1` and 1 does not; assert `score === 0.75`.
- [ ] Write a unit test `should throw if the fidelity score drops below the configured threshold` — configure threshold `0.9` and a score of `0.75`; assert `TddFidelityError` is thrown with message including `score: 0.75, threshold: 0.9`.
- [ ] Write a unit test `should emit a TDD_FIDELITY_REPORT event with the full breakdown` — spy on `EventBus.emit`; assert the event payload contains `{ score, totalTasks, violatingTasks: [...] }`.
- [ ] Write an integration test `should query the real tdd_verifications table and compute a score` — seed an in-memory SQLite with 5 verification rows (3 compliant, 2 non-compliant), instantiate `TddFidelityEnforcer`, call `computeScore()`, assert `score === 0.6`.

## 2. Task Implementation
- [ ] Create `src/tdd/TddFidelityEnforcer.ts`.
- [ ] Add columns `red_confirmed`, `green_confirmed`, `refactor_confirmed` (all `INTEGER DEFAULT 0`) to `migrations/014_tdd_verifications.sql` (add via ALTER TABLE or update the migration if not yet applied).
- [ ] Update `AutomatedVerificationGate.verify()` to accept a `stage: 'red' | 'green' | 'refactor'` parameter and set the appropriate `_confirmed` column to `1` when `passed === true` (for `'red'` stage, set `red_confirmed=1` when `passed === false` — confirming the RED state, i.e. tests failed as expected).
- [ ] Define and export interface `TddFidelityReport { score: number; totalTasks: number; compliantTasks: number; violatingTasks: Array<{ taskId: string; missingStages: string[] }> }`.
- [ ] Define and export class `TddFidelityError extends Error` with properties `score: number` and `threshold: number`.
- [ ] Implement `TddFidelityEnforcer` class with constructor accepting:
  - `dbService: DatabaseService`
  - `eventBus: EventBus`
  - `threshold: number` (default: `0.95`)
- [ ] Implement `async computeScore(): Promise<TddFidelityReport>`:
  1. Query `tdd_verifications` grouped by `task_id`, selecting `MAX(red_confirmed)`, `MAX(green_confirmed)`, `MAX(refactor_confirmed)`.
  2. A task is "compliant" if all three stages are confirmed.
  3. Compute `score = compliantTasks / totalTasks` (return `1.0` if `totalTasks === 0`).
  4. Build `violatingTasks` list with `missingStages` for each non-compliant task.
  5. Emit `EventBus.emit('TDD_FIDELITY_REPORT', report)`.
  6. If `score < threshold`, throw `TddFidelityError`.
  7. Return the report.
- [ ] Integrate `TddFidelityEnforcer.computeScore()` into the orchestrator's post-run lifecycle (after all tasks complete), so a low fidelity score halts any subsequent phase progression.
- [ ] Export `TddFidelityEnforcer` and `TddFidelityError` from `src/tdd/index.ts`.

## 3. Code Review
- [ ] Verify that `red_confirmed` being `1` means tests were confirmed to have FAILED (RED state), not passed — comments must make this explicit in the code.
- [ ] Confirm the SQL `GROUP BY task_id` query uses `MAX()` aggregation correctly to collapse multiple verification rows per task.
- [ ] Confirm `TddFidelityError` has `name = 'TddFidelityError'` set in the constructor.
- [ ] Verify `threshold` is configurable (read from `.devs/config.json` under key `tdd.fidelityThreshold`) with the default `0.95` as a fallback.
- [ ] Confirm `computeScore()` is idempotent and safe to call multiple times without double-counting.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/tdd/__tests__/TddFidelityEnforcer.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests pass.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Add a sub-section `### TDD Fidelity Score` to `docs/architecture/tdd-loop.md` explaining how the score is computed, what the `red_confirmed`/`green_confirmed`/`refactor_confirmed` columns mean, and what happens when the score falls below the threshold.
- [ ] Document the `TDD_FIDELITY_REPORT` event payload shape in `docs/architecture/event-bus.md`.
- [ ] Update `docs/agent-memory/phase_14.md` with: `TddFidelityEnforcer implemented; computes per-task Red-Green-Refactor compliance score from tdd_verifications; blocks phase progression if score < tdd.fidelityThreshold config.`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/tdd` and assert line coverage ≥ 90% for `TddFidelityEnforcer.ts`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Run `grep -r "9_ROADMAP-REQ-033" src/tdd/TddFidelityEnforcer.ts | wc -l | awk '{if($1>=1) print "PASS"; else print "FAIL"}'` to confirm the benchmarking requirement `[9_ROADMAP-REQ-033]` (TDD Fidelity benchmark) is referenced in a code comment as required by `[TAS-063]`.
