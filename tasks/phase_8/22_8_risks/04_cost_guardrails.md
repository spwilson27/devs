# Task: Implement Cost Guardrails ($5.00 per task) (Sub-Epic: 22_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-005]

## 1. Initial Test Written
- [ ] Write unit/integration tests that validate per-task cost accounting and enforcement of a $5.00 USD budget guardrail:
  - Tests to write FIRST:
    - test_budget_accumulates_and_pauses: simulate a sequence of API/LLM call cost events (e.g., $0.50, $1.25, $3.50) and assert that after the cumulative total reaches or exceeds $5.00 the task is paused and a `budget_exceeded` status is set.
    - test_precision_and_rounding: ensure addition uses exact decimal arithmetic (no floating point drift); verify adding $0.10 ten times equals $1.00 exactly.
    - test_budget_persistence_and_resume: after budget exceeded, persist state; after consuming a manual credit (e.g., admin add $2.00) assert the task can be resumed when total < limit.
  - Test file: `tests/test_cost_guardrails.py` or `tests/cost-guardrails.test.ts`.
  - Mocking: mock external billing/cost-estimate calls to return deterministic cost values.

## 2. Task Implementation
- [ ] Implement a CostTracker and integrate it into DeveloperAgent's turn loop to estimate and account for costs before each external API use:
  - Module suggestion: `src/agents/cost_tracker.py` or `packages/agents/src/costTracker.ts`.
  - API and behavior:
    - class CostTracker(budget_usd: Decimal = Decimal('5.00'))
    - add_cost(amount_usd: Decimal) -> Decimal  # adds amount and returns new total
    - can_consume(amount_usd: Decimal) -> bool  # checks if adding the amount would exceed budget
    - pause_task_if_exceeded(task_id: str) -> None  # set task state and emit event
    - admin_adjust(task_id: str, delta_usd: Decimal) -> Decimal  # for manual resume/testing
  - Implementation details:
    - Use exact decimal arithmetic (Python: decimal.Decimal; Node: Big.js or Decimal.js) for precise currency handling.
    - Integrate cost estimation hooks: before any LLM/API call the DeveloperAgent must ask CostTracker.can_consume(estimate) and only proceed if allowed; otherwise emit `budget_warning` and set status `paused`.
    - Persist per-task cost totals atomically with the CommitNode/SQLite pattern and make the stored totals part of task metadata for auditing.
    - Expose a small admin API to top-up a task's budget for manual resume.

## 3. Code Review
- [ ] Verify that:
  - Decimal arithmetic is used (no floats) and tests validate rounding behavior.
  - Budget checking occurs before external calls (pre-flight checks) and that a `budget_exceeded` event is emitted when threshold crossed.
  - All cost updates are persisted atomically and are auditable.

## 4. Run Automated Tests to Verify
- [ ] Run the cost guardrail tests:
  - pytest: `pytest -q tests/test_cost_guardrails.py`.
  - jest: `npx jest tests/cost-guardrails.test.ts`.
  - Ensure CI will run cost-related tests and block merges when failing.

## 5. Update Documentation
- [ ] Add `docs/risks/cost_guardrails.md` documenting:
  - Budget default ($5.00) and overridden config locations.
  - How cost estimates are derived and where to instrument additional estimate points.
  - Admin flow for topping up budgets and resuming paused tasks.

## 6. Automated Verification
- [ ] Add `scripts/verify_cost_guardrails.sh` that:
  - Runs the cost tests.
  - Simulates a sequence of cost events that reach $5.00 and asserts the task is paused and `budget_exceeded` event is emitted.
  - Exit non-zero on failures.
