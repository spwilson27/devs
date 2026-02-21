# Task: Implement strategy pivot after 3 identical failures (Sub-Epic: 09_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-012]

## 1. Initial Test Written
- [ ] Create a unit test file `tests/unit/test_strategy_pivot.py` that verifies the `StrategyPivotAgent` is invoked when the same error occurs three times in a row for a single task. The test must:
  1. Instantiate `DeveloperAgent` with `strategy_pivot_threshold=3` and inject a mocked `StrategyPivotAgent` (capture invocation).
  2. Simulate three consecutive failing iterations that produce an identical error `output` (use the same error string so SHA-256 hashes match).
  3. Assert that `StrategyPivotAgent.pivot(task_id, failure_history)` was called exactly once after the third identical failure.
  4. Assert that the task state was updated to reflect a `strategy_pivoted` flag and that the failure counter was reset or annotated accordingly.

Example pytest sketch:

```python
def test_strategy_pivot_on_three_identical_failures(monkeypatch):
    from devs.agents.developer_agent import DeveloperAgent
    from devs.pivot import StrategyPivotAgent

    calls = []
    def fake_pivot(task_id, history):
        calls.append((task_id, history))

    monkeypatch.setattr(StrategyPivotAgent, "pivot", fake_pivot)
    agent = DeveloperAgent(config={"strategy_pivot_threshold": 3})
    task_id = "task-09-1-pivot"

    def fail_same(*a, **k):
        return {"success": False, "error_message":"same failure", "output":"stacktrace"}
    monkeypatch.setattr(agent, "perform_implementation", fail_same)

    for _ in range(3):
        agent.execute_one_iteration(task_id)

    assert len(calls) == 1
    assert calls[0][0] == task_id
    assert agent.get_task_flag(task_id, "strategy_pivoted") is True
```

## 2. Task Implementation
- [ ] Implement identical-error detection and strategy pivoting:
  - Maintain a per-task recent error-hash window and failure history in persistent storage.
  - Compute SHA-256 of each failure `output` and append to `failure_history`.
  - If the last `N` error-hashes are identical and `N >= config.strategy_pivot_threshold (3)`, invoke `StrategyPivotAgent.pivot(task_id, failure_history)`.
  - `StrategyPivotAgent.pivot` should produce a small structured plan switch payload (e.g., set `task.strategy = 'first_principles'` and attach `pivot_reason`), and the DeveloperAgent should record `strategy_pivoted = true` and reset or annotate the failure counter.
  - Ensure the pivot is idempotent for the identical-failure sequence and includes logging and persisted pivot metadata (time, failure_hash, originating_agent).

## 3. Code Review
- [ ] Verify:
  - Error hashing uses SHA-256 and is stable across invocations.
  - Pivot triggers only after the configured threshold of identical error hashes.
  - Pivot action persists pivot metadata and is idempotent.
  - Proper undo semantics if pivot execution fails (do not lose failure history).

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `pytest -q tests/unit/test_strategy_pivot.py`
  - Inspect agent logs for the `strategy_pivoted` flag and pivot metadata.

## 5. Update Documentation
- [ ] Update `docs/PRD.md` (or `docs/behavior/strategy_pivot.md`) describing pivot thresholds (`3`), the error hashing approach, and the expected action taken by the `StrategyPivotAgent`.

## 6. Automated Verification
- [ ] Add `scripts/verify_strategy_pivot.sh` that:
  1. Runs the unit test.
  2. Searches the agent log or state store for a `strategy_pivot` entry for the test `task_id` and asserts its presence.
  3. Exits non-zero on failure.
