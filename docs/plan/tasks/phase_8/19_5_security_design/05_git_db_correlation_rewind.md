# Task: Implement Git-DB Correlation for Deterministic Rewind (Sub-Epic: 19_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-074]

## 1. Initial Test Written
- [ ] Add unit and integration tests at `specs/rewind/test_git_db_correlation.py` using pytest.
  - `test_commit_mapping_recorded` — after performing an atomic commit, assert a mapping row exists in the `commits` table with fields `{commit_sha, db_tx_id, task_id, timestamp}`.
  - `test_rewind_restores_git_and_db` — perform several committed operations, call `rewind_to_commit(commit_sha)` and assert that `git rev-parse HEAD` equals `commit_sha` and that the DB state matches the snapshot taken at that commit (compare a deterministic DB export or selected tables).
  - `test_rewind_fails_safely_on_dirty_workspace` — if workspace is dirty, the rewind operation should refuse unless `force=True` and tests must assert safe failure modes.

## 2. Task Implementation
- [ ] Implement `src/rewind/git_db_mapper.py` with APIs:
  - `record_commit_mapping(commit_sha: str, db_tx_id: str, task_id: str, metadata: dict)` — persist mapping to a durable SQLite table `commits(commit_sha PRIMARY KEY, db_tx_id, task_id, metadata_json, created_at)`.
  - `get_db_tx_for_commit(commit_sha: str) -> Optional[str]`
  - `rewind_to_commit(commit_sha: str, force: bool=False)` — perform the rewind operation:
    1. Verify working tree is clean unless `force`.
    2. Identify associated `db_tx_id` for the commit.
    3. Restore DB snapshot for the `db_tx_id` (snapshots were created by the AtomicCommitCoordinator as part of the commit flow — store snapshots in `.devs/snapshots/<db_tx_id>.sql` using `sqlite .dump` or equivalent).
    4. Reset Git `HEAD` to `commit_sha` (use `git reset --hard <sha>` or a safe, documented equivalent) and verify that both Git and DB are in sync.
- [ ] Ensure the mapping is created as part of the atomic commit flow (the AtomicCommitCoordinator must call `record_commit_mapping` only after a fully successful atomic commit so the mapping represents durable, consistent state).

## 3. Code Review
- [ ] Verify that snapshots are produced atomically (create temp file and `os.replace`) and are persisted under `.devs/snapshots/` with strict file permissions (e.g., 0o600) to avoid accidental exposure.
- [ ] Verify that the rewind operation refuses to run on a dirty workspace unless `force=True` and that `force` adds an explicit safety confirmation to the audit log.
- [ ] Verify that mapping schema is indexed on `commit_sha` and `db_tx_id` and that metadata JSON is used sparingly for quick lookups.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q specs/rewind/test_git_db_correlation.py` and validate all tests pass, including the dirty-workspace refusal behavior.

## 5. Update Documentation
- [ ] Add `docs/security/git_db_correlation_and_rewind.md` describing: how mappings are recorded, snapshot formats, the recommended operational procedure for rewinds, and how to investigate failed rewinds.

## 6. Automated Verification
- [ ] Provide `scripts/verify_rewind_flow.py` that:
  - Runs a sequence of atomic commits (using the coordinator), records the final commit SHA, calls `rewind_to_commit` to the earlier SHA, and asserts `git rev-parse HEAD` equals the earlier SHA and that the DB export matches the saved snapshot for that commit. This script should be idempotent and safe to run in CI on ephemeral repos.