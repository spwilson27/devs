# Task: Implement automated human hand-off after 5 failures (Sub-Epic: 09_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-009]

## 1. Initial Test Written
- [ ] Create a unit test file `tests/unit/test_handoff_after_5_failures.py` that verifies the DeveloperAgent triggers a human hand-off after five consecutive failing implementation iterations for the same task. The test must:
  1. Use the project's test runner (pytest). If repository uses a different runner, adapt but keep the same assertions.
  2. Instantiate `DeveloperAgent` with `failure_handoff_threshold=5` and inject a mocked `HandoffQueue` (capture calls).
  3. Patch `DeveloperAgent.perform_implementation` to always return a structured failure object containing at least `error_message` and `output`.
  4. Execute exactly five implementation iterations for a single `task_id` by calling the public single-iteration method (e.g., `agent.execute_one_iteration(task_id)`).
  5. Assert that `HandoffQueue.enqueue` was called exactly once with a payload containing: `task_id`, `failure_count == 5`, `failure_history` (list of five failure objects), and `last_error_hash` (SHA-256 hex).
  6. Assert that the persistent task state was updated to `hand_off_required` (query the project's state store or mocked persistence layer).

Include a concise pytest example (adapt names to the codebase):

```python
def test_handoff_after_5_failures(monkeypatch, tmp_path):
    from devs.agents.developer_agent import DeveloperAgent
    from devs.handoff import HandoffQueue

    calls = []
    def fake_enqueue(payload):
        calls.append(payload)

    monkeypatch.setattr(HandoffQueue, "enqueue", fake_enqueue)
    agent = DeveloperAgent(config={"failure_handoff_threshold": 5})
    task_id = "task-09-1-handoff"

    def always_fail(*args, **kwargs):
        return {"success": False, "error_message":"simulated failure", "output":"trace"}
    monkeypatch.setattr(agent, "perform_implementation", always_fail)

    for _ in range(5):
        agent.execute_one_iteration(task_id)

    assert len(calls) == 1
    payload = calls[0]
    assert payload["task_id"] == task_id
    assert payload["failure_count"] == 5
    assert isinstance(payload["failure_history"], list) and len(payload["failure_history"]) == 5
    assert "last_error_hash" in payload
    assert agent.get_task_status(task_id) == "hand_off_required"
```

## 2. Task Implementation
- [ ] Implement per-task failure tracking and automated hand-off:
  - Add a persistent per-task failure counter stored in the project's state store (SQLite / Git-backed state). Expose helper methods: `_increment_failure_counter(task_id, failure_obj)` and `_reset_failure_counter(task_id)`.
  - When an implementation iteration returns failure, call `_increment_failure_counter`; compute SHA-256 of `failure.output` to generate an error hash and append to `failure_history`.
  - When the counter reaches `config.failure_handoff_threshold` (default 5) call `HandoffQueue.enqueue(payload)` with payload schema: `{task_id, failure_count, failure_history, last_error_hash, last_error_excerpt}`.
  - Mark the persistent task record `status = 'hand_off_required'` and store the handoff metadata (enqueue time, originating_agent, last_commit).
  - Ensure atomicity: update state and enqueue within a transaction so the system can revert on failure.
  - Add unit tests and a small integration test to validate persistence and enqueue behavior.

## 3. Code Review
- [ ] Verify:
  - Failure counters are persisted atomically and cleared on successful iteration.
  - Handoff payload includes sufficient context (five failure objects, error hashes) and contains no secrets.
  - Concurrency safety: concurrent increments use a lock or DB transaction to avoid races.
  - Proper structured logging and observability (log lines with `task_id`, `failure_count`, `last_error_hash`).
  - Adherence to project coding standards and presence of tests for edge cases (partial failures, DB errors).

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `pytest -q tests/unit/test_handoff_after_5_failures.py`
  - If using node: `npm test -- tests/unit/test_handoff_after_5_failures.js`
  - After tests pass, verify persistence by querying the state store (example SQLite):
    `sqlite3 devs_state.sqlite "select status, handoff_meta from tasks where id='task-09-1-handoff';"`
  - Confirm the `handoff_meta` contains `failure_count=5` and a `last_error_hash`.

## 5. Update Documentation
- [ ] Update `docs/PRD.md` (or `docs/behavior/agent_handoff.md`) to document:
  - The default handoff threshold (`5`), payload schema for `HandoffQueue`, persistent state fields added (`failure_count`, `failure_history`, `handoff_meta`), and expected observability logs.

## 6. Automated Verification
- [ ] Add a verification script `scripts/verify_handoff.sh` that:
  1. Runs `pytest tests/unit/test_handoff_after_5_failures.py`.
  2. Queries the state store to assert the task `status == 'hand_off_required'` and that a handoff record exists with `failure_count == 5`.
  3. Exits with non-zero code if any assertion fails.
