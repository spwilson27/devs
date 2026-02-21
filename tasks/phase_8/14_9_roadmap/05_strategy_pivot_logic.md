# Task: Implement Strategy Pivot logic (Sub-Epic: 14_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-605]

## 1. Initial Test Written
- [ ] Create tests/tdd/test_strategy_pivot.py using pytest with the following tests:
  - test_pivot_after_three_identical_failures: simulate three TestNode responses for the same task_id with identical 'hash' values and assert StrategyPivot.record_failure(task_id, error_hash) increments counts and that StrategyPivot.trigger_pivot_if_needed(task_id) returns a pivot decision on the third identical occurrence.
  - test_pivot_does_not_trigger_for_distinct_failures: provide distinct hashes and assert pivot is not triggered.

## 2. Task Implementation
- [ ] Implement tdd/strategy_pivot.py with:
  - StrategyPivot class that tracks failure counts per (task_id, error_hash) and exposes record_failure(task_id, error_hash) -> int and trigger_pivot_if_needed(task_id) -> Optional[dict].
  - Default threshold configurable via environment variable or config (DEFAULT_PIVOT_THRESHOLD=3).
  - Persistence adapter that can write to SQLite (.devs/pivots.db) with table pivots(task_id TEXT, error_hash TEXT, count INTEGER, last_seen TIMESTAMP) for production and an in-memory store for unit tests.
  - When pivot triggers, return a pivot descriptor {"pivoted": True, "reason": "repeated_error", "error_hash": <hash>, "action": "generate_first_principles_plan"} and ensure integration point to call DeveloperAgent.generate_first_principles_plan(task_context).

## 3. Code Review
- [ ] Ensure deterministic hash comparisons, configurable threshold, concurrency-safe persistence (use transactions), defense against hash collisions by combining stdout+stderr+exit_code into the digest, and clear logging for auditing pivot decisions.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/tdd/test_strategy_pivot.py and confirm tests pass.

## 5. Update Documentation
- [ ] Add docs/strategy/pivot.md describing pivot threshold semantics, storage schema for pivots, how DeveloperAgent is invoked on pivot, and examples of a pivot flow.

## 6. Automated Verification
- [ ] CI: run unit tests and an end-to-end integration test that simulates three identical failures from TestNode and validates that the task metadata includes a pivot marker and that an RCA handoff placeholder is created.