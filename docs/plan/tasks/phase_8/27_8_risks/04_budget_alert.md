# Task: Implement budget alert and automatic pause at threshold (Sub-Epic: 27_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-089]

## 1. Initial Test Written
- [ ] Detect repo runtime and choose language-appropriate test harness (pytest or jest).
- [ ] Create tests that exercise BudgetManager behavior under increasing consumption:
  - tests/risks/test_budget_alert.py (pytest):
    - Initialize BudgetManager with total_budget=1000 (units) and threshold_ratio=0.8.
    - Simulate sequential cost events via BudgetManager.record_cost(task_id, amount) until cumulative >= 800.
    - Assert that BudgetManager.alerted(task_id) is True, that the BudgetManager returns status `paused` for that task, and that an alert entry was emitted to an alerts table or message queue (verify the alerts table contains an entry with level="warning" and reason contains "80%".
    - Test concurrent updates using threads or asyncio to assert transactional safety (use sqlite transactions and explicit `BEGIN IMMEDIATE`).
  - Node: tests/risks/budget-alert.test.ts with equivalent assertions.
- [ ] Test names: `test_budget_alert_triggers_pause`, `test_budget_alert_concurrent_updates`.

## 2. Task Implementation
- [ ] Implement `src/risks/budget_manager.{py,ts}` with:
  - class BudgetManager:
    - record_cost(task_id: str, cost: float): records cost atomically and returns current_spent, current_ratio.
    - get_status(task_id): returns {spent, budget, ratio, state}
    - top_up(task_id, amount): increase budget and clear paused state if above threshold.
    - on_threshold_reached(task_id): emits an Alert via AlertService and sets task state to `paused` in the TaskState table.
  - Persistence: use SQLite table `budgets(task_id, budget, spent, updated_at)` and `alerts(id, task_id, level, message, created_at)`.
  - Transactions: all updates must be transactional (use SQL `BEGIN`/`COMMIT` or node sqlite library transactions) and safe for concurrent updates.
- [ ] Integrate BudgetManager with AgentScheduler so that when a task is `paused` the DeveloperAgent will not be scheduled for further turns until resolved.
- [ ] Configuration: make threshold configurable via env var or config file `RISK_BUDGET_THRESHOLD=0.8`.

## 3. Code Review
- [ ] Verify transactional correctness and presence of unique constraints on budgets table.
- [ ] Confirm alert messages include task_id, current_spent, budget, ratio, and timestamp.
- [ ] Ensure no blocking synchronous calls that could starve agent threads; prefer async IO where appropriate.

## 4. Run Automated Tests to Verify
- [ ] Run the budget alert tests:
  - Python: `pytest tests/risks/test_budget_alert.py -q`.
  - Node: `npx jest tests/risks/budget-alert.test.ts --runInBand`.
- [ ] Verify that tests assert paused state and alert emission.

## 5. Update Documentation
- [ ] Add `docs/tasks/phase_8/27_8_risks/04_budget_alert.md` documenting budget model, schema for `budgets` and `alerts` tables, CLI for inspecting budgets (`devs budget status --task <id>`) and top-up commands.

## 6. Automated Verification
- [ ] Provide `scripts/verify_budget_alert.sh` which:
  - Boots a minimal environment, initializes BudgetManager with a small budget, simulates costs, and asserts the paused state and alert entry exist.
  - Exits with non-zero on failure.
