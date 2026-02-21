# Task: Implement Turn & Token Budget Enforcement (Sub-Epic: 04_1_PRD)

## Covered Requirements
- [1_PRD-REQ-REL-002]

## 1. Initial Test Written
- [ ] Create unit tests first using pytest at `tests/unit/test_budget_manager.py`.
  - Tests to write (exact assertions):
    - test_turn_limit_enforced:
      - manager = BudgetManager()
      - manager.start_task(task_id="T1", token_budget=10000, turn_limit=10)
      - for i in range(10): manager.increment_turn()
      - assert manager.is_turn_exceeded() is True or manager.turns_used == 10 and manager.within_turn_limit() is False depending on API
      - attempt one more increment: expect a BudgetExceeded exception or a boolean that indicates limit reached
    - test_token_budget_enforced:
      - manager.start_task(task_id="T2", token_budget=100)
      - manager.consume_tokens(40); manager.consume_tokens(40); manager.consume_tokens(40)
      - assert manager.is_token_exceeded() is True after the third consume
    - test_concurrent_consumption_is_safe (optional but recommended):
      - spawn two threads that call consume_tokens in parallel and assert final token count never dips below zero

Provide explicit sequences and expected exceptions/return values so an agent can write tests verbatim.

## 2. Task Implementation
- [ ] Implement `src/budget_manager.py` with a `BudgetManager` class and the following API (type hints required):
  - def start_task(self, task_id: str, token_budget: int, turn_limit: int = 10) -> None
  - def consume_tokens(self, n: int) -> None
    - Decrement the remaining token budget; raise BudgetExceeded if budget < 0 after decrement.
  - def increment_turn(self) -> None
    - Increment turn counter; raise TurnLimitExceeded if turns_used > turn_limit.
  - def is_token_exceeded(self) -> bool
  - def is_turn_exceeded(self) -> bool
  - Use a simple threading.Lock around state mutations to make the manager safe for concurrent callers.
- [ ] Add clear, typed exceptions BudgetExceeded and TurnLimitExceeded in the same module.

## 3. Code Review
- [ ] Ensure the implementation meets the following:
  - Thread-safety for state mutations.
  - Small, well-documented public API.
  - Exceptions are used for hard limits (not silent booleans) so DeveloperAgent can implement suspend/hand-off logic.
  - Include unit tests that assert exceptions are raised when expected.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_budget_manager.py -q` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/budget_manager.md` describing:
  - Public API and exception semantics.
  - Default limits (turn_limit=10) and how to configure per-task budgets.
  - Integration notes for DeveloperAgent (what to do when BudgetExceeded or TurnLimitExceeded is raised).

## 6. Automated Verification
- [ ] Add `scripts/verify_budget_manager.sh` that runs the unit tests and performs a short concurrency smoke test that ensures token counts are consistent under concurrent consumption.
