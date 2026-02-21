# Task: Implement Entropy Buffer (20% Research & Strategy) (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-046]

## 1. Initial Test Written
- [ ] Create tests at tests/test_entropy_buffer.py that validate budget allocation and enforcement.
  - test_buffer_allocation: given a task budget (e.g., 1000 tokens or 10 turns), assert the BudgetManager reserves exactly 20% for research & strategy and returns the expected remaining execution budget.
  - test_buffer_enforced_by_scheduler: simulate a run where research nodes attempt to consume more than reserved buffer and assert the scheduler blocks additional research node execution until buffer replenishment or manual override.
  - Use deterministic numeric fixtures and avoid network calls.

## 2. Task Implementation
- [ ] Implement BudgetManager and scheduler integration.
  - File: src/agents/budget_manager.py
  - API:
    - allocate_budget(task_id: str, total_budget: int|float) -> dict {execution_budget: float, research_buffer: float}
    - consume_budget(task_id: str, node_type: str, amount: float) -> bool  -- returns True if consumption permitted, False otherwise.
  - Implementation details:
    - research_buffer = round(total_budget * 0.20, 4)
    - Persist budgets in `budgets(task_id TEXT PRIMARY KEY, total REAL, execution REAL, research_buffer REAL, updated_at TIMESTAMP)`.
    - The scheduler must call consume_budget prior to running a node; research nodes decrement research_buffer while implementation nodes decrement execution_budget.
    - Provide a configuration toggle `entropy_research_buffer_enabled` to enable/disable.

## 3. Code Review
- [ ] Ensure budget calculations are precise (use Decimal if needed), the DB schema supports atomic updates, and consumption operations are thread-safe (use transactions or row-level locks).

## 4. Run Automated Tests to Verify
- [ ] pytest -q tests/test_entropy_buffer.py and a small simulation script tests/support/budget_simulator.py that stresses buffer boundaries.

## 5. Update Documentation
- [ ] Add docs/budgeting/entropy_buffer.md describing the rationale (20% reserve), DB schema, and scheduler contract for consume_budget.

## 6. Automated Verification
- [ ] Provide tests/support/verify_budget_policy.py that runs a simulated task with known budget and asserts research consumption never exceeds reserved buffer under normal operation.
