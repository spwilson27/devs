# Task: Implement Task-level Budget Monitoring & Guardrails (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-132]

## 1. Initial Test Written
- [ ] Create unit tests at tests/billing/budget.spec.ts that:
  - Instantiate the budget monitor with a per-task limit of $5.00 and simulate LLM call costs by incrementing the counter in small increments.
  - Assert that once the cost >= $5.00 the monitor returns `isPaused` for that task and emits a `budget.exceeded` event with taskId and totalCost.
  - Assert that reset/pause/unpause flows behave deterministically.

## 2. Task Implementation
- [ ] Implement `src/lib/billing/budget-monitor.ts` with an API:
  - `incrementCost(taskId, cents)` -> increments atomic counter persisted to SQLite (or a file-based DB) and returns new total.
  - `checkBudget(taskId)` -> returns { totalCents, limitCents, isPaused }
  - `pauseTask(taskId, reason)` and `unpauseTask(taskId)`.
- [ ] Wire a middleware into the DeveloperAgent call flow so every LLM call first consults `checkBudget` and refuses the call if the task is paused.
- [ ] Add configuration `config/budget.json` with default per-task cents (500 cents).

## 3. Code Review
- [ ] Ensure increments are atomic (use SQLite transactions) and safe under concurrent increments from parallel agents.
- [ ] Ensure the monitor persists state and recovers correctly after process restarts.
- [ ] Validate that emitted events are structured and include task metadata for monitoring systems.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/billing/budget.spec.ts` and verify all assertions succeed.
- [ ] Manually simulate a run where multiple agents increment the same task to validate concurrency handling.

## 5. Update Documentation
- [ ] Add `docs/risks/budget-monitor.md` documenting per-task budgets, default values, and how to override budgets for special tasks.

## 6. Automated Verification
- [ ] Add CI script `scripts/simulate-budget-hit.js` which simulates many small increments until the budget is hit and asserts the monitor pauses the task; CI can run this as a nightly check for regressions.
