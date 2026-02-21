# Task: Implement Epic Token and Cost Budgeting Service (Sub-Epic: 35_1_PRD)

## Covered Requirements
- [1_PRD-REQ-UI-014]

## 1. Initial Test Written
- [ ] Create a new test file `src/core/budget/__tests__/TokenBudgetManager.test.ts`.
- [ ] Write a unit test `should track token usage and calculate USD cost based on model pricing`.
- [ ] Write a unit test `should emit WARNING event when soft limit (80% of budget) is reached`.
- [ ] Write a unit test `should emit PAUSE event and throw BudgetExceededError when hard limit is breached`.
- [ ] Write a unit test `should accurately aggregate cost across multiple tasks within a single Epic`.

## 2. Task Implementation
- [ ] Create the `TokenBudgetManager` class in `src/core/budget/TokenBudgetManager.ts`.
- [ ] Implement an `addUsage(epicId: string, taskId: string, tokens: number, model: string)` method that updates SQLite persistence.
- [ ] Implement the calculation logic to convert tokens to USD based on the model used.
- [ ] Add budget configuration fetching (e.g., retrieving the hard and soft limits for the current epic).
- [ ] Implement an Event Emitter or integrate with the existing `EventBus` to dispatch budget-related warnings and pause signals to the UI.

## 3. Code Review
- [ ] Ensure `TokenBudgetManager` cleanly separates state tracking from event dispatching.
- [ ] Verify that the SQLite queries use prepared statements and handle concurrent updates properly.
- [ ] Check that model pricing constants are easily configurable (e.g., stored in a separate constants file or config).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/core/budget/__tests__/TokenBudgetManager.test.ts` to ensure all tests pass.
- [ ] Confirm no existing tests are broken by running `npm run test:unit`.

## 5. Update Documentation
- [ ] Add the `TokenBudgetManager` service to the `docs/architecture/services.md` file (or equivalent).
- [ ] Update the `.agent.md` context for the Core module explaining how budget constraints are enforced.

## 6. Automated Verification
- [ ] Run a synthetic script simulating a heavy token workload to verify the PAUSE event is intercepted by the core orchestrator.
