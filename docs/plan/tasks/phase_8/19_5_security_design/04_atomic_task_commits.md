# Task: Implement Atomic Task Commits (Sub-Epic: 19_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-072]

## 1. Initial Test Written
- [ ] Add unit and integration tests at `specs/commit/test_atomic_commit.py` using pytest.
  - `test_atomic_commit_success` — in a temporary git repo, exercise the atomic commit coordinator with a simple file change and assert both a git commit was created and the DB transaction was marked committed and durable.
  - `test_atomic_commit_failure_rolls_back` — simulate a failure during the git commit (e.g., by mocking subprocess that drives `git commit` to raise) and assert the DB transaction is rolled back and the working tree remains consistent (no partial commit metadata persisted).
  - `test_commit_message_includes_task_metadata` — assert commit message includes `Task-ID: <task-id>` and metadata required by MCP (timestamp, agent-id).

## 2. Task Implementation
- [ ] Implement `src/commit/atomic_commit.py` exposing `AtomicCommitCoordinator` with API:
  - `begin(task_id: str)` — start an atomic commit context and create an intent record in DB (or WAL) that is fsynced.
  - `stage_changes(files: List[str])` — stage files in git index (use `git add` via subprocess or library) and create DB changes in the same transaction.
  - `commit(message: str)` — perform the git commit and mark DB transaction complete. The coordinator must ensure the following ordering:
    1. Persist intent to WAL/DB and fsync (durable marker for rollback)
    2. Attempt git commit (using `git` CLI with explicit author and message including `Task-ID`)
    3. If git commit succeeds, mark DB transaction as committed and fsync DB.
    4. If git commit fails, use WAL/intent to rollback DB changes and leave repository in previous state.
- [ ] Use subprocess calls to `git` with `--no-gpg-sign` and explicit environment to ensure deterministic commit metadata. The commit message must follow a machine-parsable header format with `Task-ID:` and `CommitNode:`.
- [ ] Add helper `scripts/atomic_commit_demo.py` that demonstrates coordinator usage on a temporary repo for manual verification.

## 3. Code Review
- [ ] Verify strict ordering (intent persisted before any external operation), durability (fsync after intent and after DB commit), and clear rollback paths.
- [ ] Verify the commit message format is machine-parsable and includes required metadata (Task-ID, timestamp, agent-id).
- [ ] Verify the implementation handles concurrent commits safely (document locking strategy used for commit coordination).

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q specs/commit/test_atomic_commit.py` and validate success of success-case and correct rollback behavior in failure-case.

## 5. Update Documentation
- [ ] Add `docs/security/atomic_commits.md` describing the atomic commit algorithm, ordering guarantees, and developer guidance for integrating new systems with `AtomicCommitCoordinator`.

## 6. Automated Verification
- [ ] Add `scripts/verify_atomic_commit.py` which:
  - Creates a temporary git repo, performs an atomic commit via the coordinator, asserts both git HEAD and DB state are updated, then simulates a git failure and asserts rollback semantics. This script should be runnable in CI as a deterministic verification step.