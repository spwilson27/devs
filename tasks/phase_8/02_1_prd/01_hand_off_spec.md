# Task: Design Human-in-the-loop Hand-off Specification (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-HITL-005]

## 1. Initial Test Written
- [ ] Write a unit test at tests/hitl/test_hand_off_spec.py::test_entropy_triggers_hand_off that exercises the ENTROPY -> HANDOFF flow and fails initially.
  - Use pytest and an in-memory sqlite database (sqlite:///:memory: or sqlite3.connect) for the test.
  - Arrange: create a mock Task object with task_id="task-xyz" and a mocked EntropyDetector that returns True for is_entropy(limit).
  - Act: call DeveloperAgent.handle_implementation_turn(task_id, context) (or the module responsible for running the entropy check) and assert that HandOffManager.create_hand_off(...) is invoked with arguments: (task_id, reason="entropy_limit", diagnostics={"stdout_hash": <str>, "last_commands": <list>}).
  - Assert: the hand_offs table contains a row with task_id="task-xyz", reason="entropy_limit", status="pending", and diagnostics JSON contains keys stdout_hash and last_commands.
  - Use pytest-mock or monkeypatch to stub NotificationService.enqueue and assert it was called with a payload containing handoff_id and user_id.

## 2. Task Implementation
- [ ] Implement the HandOffManager and persistence schema.
  - Add DB migration (or schema code) to create table `hand_offs` with columns: id TEXT PRIMARY KEY, task_id TEXT, reason TEXT, diagnostics JSON/TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMP, resolved_by TEXT NULL, resolved_at TIMESTAMP NULL.
  - Implement src/agents/hand_off.py with class HandOffManager exposing:
    - create_hand_off(task_id: str, reason: str, diagnostics: dict) -> dict (returns created row)
    - get_hand_off(hand_off_id: str) -> dict
    - list_pending_hand_offs() -> List[dict]
    - resolve_hand_off(hand_off_id: str, user_id: str, resolution_notes: str)
  - Integrate with EntropyDetector: when entropy limit is reached call HandOffManager.create_hand_off(...) and set task status to 'awaiting_human'.
  - Ensure create_hand_off persists atomically and enqueues a user notification via NotificationService.enqueue(channel='handoff', payload={hand_off_id, task_id, summary}).

## 3. Code Review
- [ ] On code review verify:
  - DB interactions use parameterized queries or an ORM and are covered by unit tests.
  - HandOffManager methods are idempotent and handle duplicates gracefully.
  - Diagnostics are sanitized before persistence (no secrets or large binary blobs); large diagnostics must be stored as references.
  - Notification payloads are minimal and safe for user-facing UIs.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/hitl/test_hand_off_spec.py -q
  - Expected: test_entropy_triggers_hand_off initially fails, then passes after implementing HandOffManager and integration.

## 5. Update Documentation
- [ ] Add docs/prd/hand_off_spec.md documenting the hand-off JSON payload, example flow (Agent hits entropy -> handoff created -> user resolves -> agent resumes), API endpoints (see Task 02), and CLI examples for resolving a hand-off.

## 6. Automated Verification
- [ ] Add scripts/integration/verify_hand_off.py that:
  - Simulates an EntropyDetector hitting the limit for a test task.
  - Waits up to 5s for a hand-off row to appear in DB.
  - Verifies the hand-off payload contains expected keys and NotificationService.enqueue was called (use a test/stub queue).
  - Exit status 0 means verification passed.
