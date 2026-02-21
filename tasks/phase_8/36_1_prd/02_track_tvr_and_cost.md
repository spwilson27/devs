# Task: Implement Token-to-Value Ratio (TVR) and Cost Tracking Guardrails (Sub-Epic: 36_1_PRD)

## Covered Requirements
- [1_PRD-REQ-MET-008]

## 1. Initial Test Written
- [ ] Create `tests/core/metrics/TvrTracker.test.ts`.
- [ ] Write a test `should accumulate token costs across turns and calculate TVR` that mocks multiple LLM API responses with `usage_metadata`, sums the input/output token costs, and calculates the total USD cost for a simulated successful task.
- [ ] Write a test `should alert if TVR exceeds $1.50 threshold` that verifies an alert event is emitted when the accumulated cost for a task breaches the target.

## 2. Task Implementation
- [ ] Create `src/core/metrics/TvrTracker.ts`.
- [ ] Implement `TvrTracker` to subscribe to LLM invocation events (`LLM_RESPONSE_RECEIVED`).
- [ ] Extract `prompt_token_count` and `candidates_token_count` from each Gemini 3 Pro and Flash response.
- [ ] Calculate the USD cost using predefined pricing constants for Gemini 3 Pro/Flash.
- [ ] Persist the accumulated cost in the `tasks` table in `.devs/state.sqlite` under a new `total_cost_usd` column.
- [ ] Expose a `getTvrForTask(taskId: string)` method that returns the total cost for a specific task.

## 3. Code Review
- [ ] Ensure the pricing constants are configurable (e.g., via environment variables or a configuration file) rather than hardcoded in the logic, or at least placed in a central `constants.ts` file.
- [ ] Check that decimal precision issues are avoided by using a robust currency handling approach (e.g., storing micro-cents or using integer math).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/core/metrics/TvrTracker.test.ts` to ensure cost accumulation tests pass.

## 5. Update Documentation
- [ ] Document the TVR calculation and the current model pricing constants used in `docs/architecture/metrics.md`.

## 6. Automated Verification
- [ ] Run a test CLI command `npm run test:integration -- --tvr-mock` that feeds mock token usage data into the event bus and verifies the SQLite database records the expected `total_cost_usd`.
