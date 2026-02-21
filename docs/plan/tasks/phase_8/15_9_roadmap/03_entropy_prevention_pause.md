# Task: Implement Entropy Prevention Pause (suspend within 1 turn) (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-035]

## 1. Initial Test Written
- [ ] Create integration-style tests at tests/test_entropy_prevention.py:
  - test_pause_within_one_turn: simulate two consecutive turns that produce identical normalized outputs and assert that after the second turn the system transitions the task into `suspended` state.
  - test_pause_reason_and_logging: ensure the suspension record includes `reason: "entropy-detected"` and contains the offending hash and recent turn indices.
  - Use mocks/fakes for the DeveloperAgent scheduler so tests are deterministic and do not rely on wall-clock timing.

## 2. Task Implementation
- [ ] Implement PauseController and integrate with EntropyDetector:
  - File: src/agents/pause_controller.py
  - API:
    - pause_task(task_id: str, reason: str, metadata: dict) -> None  -- persist `suspended` state in DB and emit observability event.
    - resume_task(task_id: str, actor: str) -> None  -- allow resume flow (used by manual intervention).
  - Integration behavior:
    - When EntropyDetector.is_entropy(task_id) returns True, call pause_task within the same turn execution path so that the suspension occurs no later than the next scheduler cycle.
    - Ensure pause is atomic: set task state in DB and enqueue any UI/agent notifications in the same transaction when possible.
  - DB schema: `task_states(task_id TEXT PRIMARY KEY, state TEXT, reason TEXT, metadata JSON, updated_at TIMESTAMP)`.

## 3. Code Review
- [ ] Verify the implementation for:
  - Atomicity of state changes (no race conditions with parallel workers).
  - Idempotency: repeated pause requests for an already-suspended task are no-ops.
  - Observability: emit structured telemetry with trace_id and task_id.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_entropy_prevention.py; tests must simulate the real scheduler by advancing a fake turn counter.

## 5. Update Documentation
- [ ] Update docs/entropy/pause_policy.md describing the pause semantics, CLI for resuming tasks, and sample JSON payloads produced when a pause occurs.

## 6. Automated Verification
- [ ] Provide tests/support/verify_pause_flow.py that runs a minimal end-to-end scenario and asserts that pause occurs within the required turn budget (one scheduler cycle) and that the DB row contains the entropy hash and reason.
