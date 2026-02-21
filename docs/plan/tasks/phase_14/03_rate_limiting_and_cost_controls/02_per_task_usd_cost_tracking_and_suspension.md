# Task: Implement Real-Time Per-Task USD Cost Tracking and Suspension (Sub-Epic: 03_Rate Limiting and Cost Controls)

## Covered Requirements
- [8_RISKS-REQ-005]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/cost/__tests__/CostGuardrail.test.ts`.
- [ ] Write a unit test verifying that `CostTracker.recordUsage({ inputTokens, outputTokens, model })` correctly converts token counts to USD using the model's known per-token price (e.g., Gemini 3 Pro: $0.0000035/input token, $0.0000105/output token) and accumulates the total correctly.
- [ ] Write a unit test verifying that when a task's accumulated USD cost crosses the user-defined threshold (default `$5.00`), `CostGuardrail.check()` returns `{ action: 'suspend', taskId, costUsd }`.
- [ ] Write a unit test verifying that when cost is below the threshold, `CostGuardrail.check()` returns `{ action: 'continue' }`.
- [ ] Write a unit test verifying that the threshold is configurable per-project via `devs.config.json` field `costGuardrails.perTaskLimitUsd`, and that the default is exactly `5.00` when the field is absent.
- [ ] Write a unit test verifying that `CostTracker.reset(taskId)` clears the accumulated cost for that specific task, not other tasks.
- [ ] Write a unit test verifying that when `action: 'suspend'` is returned, the orchestrator's `TaskRunner.run()` calls `orchestrator.suspendTask(taskId)` and emits a `TASK_COST_EXCEEDED` event with the full cost metadata.
- [ ] Write an integration test that runs a `TaskRunner` through 3 sequential fake LLM calls, each contributing $1.80 in simulated token cost, and asserts suspension occurs after the third call pushes accumulated cost past $5.00.

## 2. Task Implementation
- [ ] Create `src/orchestrator/cost/CostTracker.ts`:
  - Export `ModelPricing` map: `Record<string, { inputPer1kTokens: number; outputPer1kTokens: number }>` initialized from `src/config/model-pricing.json`.
  - Export `CostTracker` class with:
    - `recordUsage(params: { taskId: string; model: string; inputTokens: number; outputTokens: number }): void` — accumulates running USD cost per task in an in-memory `Map<string, number>`.
    - `getTaskCost(taskId: string): number` — returns current USD total for task.
    - `reset(taskId: string): void` — clears accumulated cost for task.
    - `getTotalProjectCost(): number` — sums all task costs.
- [ ] Create `src/config/model-pricing.json` with pricing entries for `gemini-3-pro` and `gemini-3-flash`.
- [ ] Create `src/orchestrator/cost/CostGuardrail.ts`:
  - Export `CostGuardrail` class accepting `CostTracker` and `thresholdUsd: number` (default 5.00).
  - Method `check(taskId: string): CostCheckResult` returns `{ action: 'continue' | 'suspend'; taskId: string; costUsd: number }`.
- [ ] Modify `src/orchestrator/TaskRunner.ts`:
  - After each LLM call completes, extract token usage from the API response object.
  - Call `costTracker.recordUsage(...)`.
  - Call `costGuardrail.check(taskId)`.
  - If `action === 'suspend'`: call `this.orchestrator.suspendTask(taskId)`, emit `TASK_COST_EXCEEDED` event via the event bus, and halt further processing of the task.
- [ ] Persist the per-task cost to SQLite `task_costs` table (`task_id TEXT, cost_usd REAL, updated_at TEXT`) so cost is recoverable after a process restart.
- [ ] Expose `thresholdUsd` as a configurable field in `devs.config.json` under `costGuardrails.perTaskLimitUsd`; load it during orchestrator bootstrap.
- [ ] Export everything through `src/orchestrator/cost/index.ts`.

## 3. Code Review
- [ ] Verify floating-point arithmetic uses `Math.round(value * 1e6) / 1e6` to avoid accumulated rounding errors in USD totals.
- [ ] Verify the `ModelPricing` map is loaded once at startup and is immutable (use `Object.freeze`).
- [ ] Verify that `CostTracker` uses dependency-injected storage (interface `ICostStore`) so in-memory and SQLite implementations are interchangeable in tests.
- [ ] Verify that the `TASK_COST_EXCEEDED` event payload includes: `taskId`, `costUsd`, `thresholdUsd`, `timestamp`.
- [ ] Verify requirement annotation `// [8_RISKS-REQ-005]` appears in `CostGuardrail.ts`, `CostTracker.ts`, and the modified `TaskRunner.ts`.
- [ ] Confirm no silent swallowing of errors from `costTracker.recordUsage`; failures must be logged and re-thrown.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="cost"` and confirm all unit tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="CostGuardrail.integration"` and confirm the integration test passes.
- [ ] Run `npm run test:coverage -- --collectCoverageFrom="src/orchestrator/cost/**"` and assert line coverage ≥ 90%.
- [ ] Run `npm run lint` and confirm zero lint errors in `src/orchestrator/cost/` and `src/orchestrator/TaskRunner.ts`.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Per-Task Cost Guardrails` section to `docs/orchestrator.md` documenting the USD tracking mechanism, default threshold, event emitted on suspension, and how to configure `costGuardrails.perTaskLimitUsd`.
- [ ] Document `model-pricing.json` schema in `docs/configuration.md`.
- [ ] Add an entry to `docs/agent-memory/phase_14_decisions.md` recording the decision to suspend (not terminate) a task on cost breach and the rationale.
- [ ] Update `specs/8_risks_mitigation.md` traceability table to mark `[8_RISKS-REQ-005]` as implemented in Phase 14 / Task 02.

## 6. Automated Verification
- [ ] Execute `scripts/validate-all.sh` and confirm exit code 0.
- [ ] Run `node scripts/check-req-coverage.js --req 8_RISKS-REQ-005` and assert `status: covered`.
- [ ] Run `npm run test -- --ci --forceExit` and confirm zero failing test suites.
- [ ] Run `grep -r "8_RISKS-REQ-005" src/orchestrator/cost/ src/orchestrator/TaskRunner.ts --include="*.ts" -l` and confirm all three files are listed.
- [ ] Confirm `task_costs` table exists in the test SQLite database by running `node scripts/db-check.js --table task_costs` and verifying exit code 0.
